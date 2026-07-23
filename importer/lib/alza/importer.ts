/**
 * RE:DISTRICT — Alza Import Engine
 * Orchestrates the complete import process:
 * Alza → scrape → images → Supabase supplier_products → RE:DISTRICT products
 *
 * Entry point: importAlzaCategory(url)
 */

import type { AlzaProduct, ImportReport, ImportError, SyncStats } from "./types";
import { crawlCategory } from "./category";
import { scrapeProducts } from "./product";
import { processProductImages, ensureImageBucket } from "./images";
import { upsertSupplierProduct, markMissingProductsUnavailable, verifyDatabaseSchema } from "./database";
import { syncProducts } from "./sync";
import { logger } from "./logger";
import { closeContext } from "./client";
import { closeBrowser } from "./browser";

// ── Import engine ──────────────────────────────────────────────────────────

/**
 * Run a complete import of an Alza category.
 * Handles all phases: crawl → scrape → images → supplier_products → sync → store.
 *
 * @param categoryUrl - e.g. "https://www.alza.sk/beauty/casio/v1508.htm"
 * @returns Detailed ImportReport
 */
export async function importAlzaCategory(categoryUrl: string): Promise<ImportReport> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const errors: ImportError[] = [];

  let pagesFound = 0;
  let pagesCrawled = 0;
  let productsFound = 0;
  let productsCreated = 0;
  let productsUpdated = 0;
  let productsUnavailable = 0;
  let productsFailed = 0;
  let imagesDownloaded = 0;
  let imagesSkipped = 0;
  let syncStats: SyncStats = { storeCreated: 0, storeUpdated: 0, storeSkipped: 0, storeFailed: 0 };

  const seenProductIds = new Set<string>();

  logger.clear();
  logger.setPhase("init");
  logger.info(`╔══════════════════════════════════════════════╗`);
  logger.info(`║  RE:DISTRICT — Alza Category Import         ║`);
  logger.info(`╚══════════════════════════════════════════════╝`);
  logger.info(`Category URL: ${categoryUrl}`);

  try {
    // ── Phase 0: Pre-flight checks ───────────────────────────────────────

    logger.setPhase("preflight");

    const schemaOk = await verifyDatabaseSchema();
    if (!schemaOk) {
      throw new Error("Database schema verification failed. Run scripts/create-supplier-tables.sql first.");
    }

    await ensureImageBucket();
    logger.success("Pre-flight checks passed");

    // ── Phase 1: Crawl category pages ────────────────────────────────────

    logger.setPhase("crawl");
    logger.info("Phase 1: Crawling category pages...");

    const crawlResult = await crawlCategory(categoryUrl);
    pagesFound = crawlResult.totalPages;
    pagesCrawled = crawlResult.totalPages;
    productsFound = crawlResult.productStubs.length;

    logger.success(`Phase 1 complete: ${productsFound} products found across ${pagesFound} pages`);

    if (productsFound === 0) {
      logger.warn("No products found in category. Stopping.");
      return buildReport({
        startedAt, startMs, categoryUrl, pagesFound, pagesCrawled,
        productsFound, productsCreated, productsUpdated, productsUnavailable,
        productsFailed, imagesDownloaded, imagesSkipped, syncStats, errors,
      });
    }

    // ── Phase 2: Scrape product pages ────────────────────────────────────

    logger.setPhase("scrape");
    logger.info(`Phase 2: Scraping ${productsFound} product pages...`);

    const scrapeResults = await scrapeProducts(
      crawlResult.productStubs,
      (done, total) => {
        if (done % 10 === 0 || done === total) {
          logger.info(`Scraping progress: ${done}/${total}`);
        }
      },
    );

    const successful = scrapeResults.filter(r => r.product !== null);
    const failed = scrapeResults.filter(r => r.product === null);

    productsFailed += failed.length;
    for (const f of failed) {
      errors.push({
        url: f.stub.url,
        message: f.error ?? "Unknown scraping error",
        phase: "scrape",
      });
    }

    logger.success(`Phase 2 complete: ${successful.length} scraped, ${failed.length} failed`);

    // ── Phase 3: Process images ───────────────────────────────────────────

    logger.setPhase("images");
    logger.info(`Phase 3: Processing images for ${successful.length} products...`);

    const productImageMap = new Map<string, string[]>();

    for (const { product } of successful) {
      if (!product) continue;

      logger.setPhase(`images:${product.supplierProductId}`);

      try {
        const { storedUrls, downloaded, skipped, failed: imgFailed } = await processProductImages(
          product.images,
          product.supplierProductId,
        );

        productImageMap.set(product.supplierProductId, storedUrls);
        imagesDownloaded += downloaded;
        imagesSkipped += skipped;

        if (imgFailed > 0) {
          logger.warn(`${imgFailed} images failed for ${product.name}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error(`Image processing failed for ${product.supplierProductId}`, { error: msg });
        errors.push({ url: product.url, message: msg, phase: "image" });
        productImageMap.set(product.supplierProductId, []);
      }
    }

    logger.success(`Phase 3 complete: ${imagesDownloaded} downloaded, ${imagesSkipped} skipped`);

    // ── Phase 4: Upsert into supplier_products ────────────────────────────

    logger.setPhase("database");
    logger.info(`Phase 4: Syncing ${successful.length} products to supplier_products...`);

    for (const { product } of successful) {
      if (!product) continue;

      const imageUrls = productImageMap.get(product.supplierProductId) ?? [];
      seenProductIds.add(product.supplierProductId);

      try {
        const { action } = await upsertSupplierProduct(product, imageUrls);
        if (action === "created") productsCreated++;
        else productsUpdated++;

        logger.debug(`supplier_products ${action}: ${product.name}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error(`supplier_products sync failed: ${product.name}`, { error: msg });
        errors.push({ url: product.url, message: msg, phase: "database" });
        productsFailed++;
      }
    }

    logger.success(`Phase 4 complete: ${productsCreated} created, ${productsUpdated} updated in supplier_products`);

    // ── Phase 5: Mark missing products unavailable ────────────────────────

    logger.setPhase("missing-check");
    logger.info("Phase 5: Checking for missing products...");

    productsUnavailable = await markMissingProductsUnavailable(seenProductIds);

    logger.success(`Phase 5 complete: ${productsUnavailable} products marked unavailable`);

    // ── Phase 6: Sync supplier_products → RE:DISTRICT product store ───────

    logger.setPhase("store-sync");
    logger.info("Phase 6: Syncing supplier_products → product store...");

    // Pass categoryUrl so sync engine can scope to this import if needed
    syncStats = await syncProducts(categoryUrl);

    logger.success(`Phase 6 complete`, {
      storeCreated: syncStats.storeCreated,
      storeUpdated: syncStats.storeUpdated,
      storeSkipped: syncStats.storeSkipped,
      storeFailed:  syncStats.storeFailed,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Import failed fatally: ${msg}`);
    errors.push({ url: categoryUrl, message: msg, phase: "crawl" });
    productsFailed++;
  } finally {
    logger.setPhase("cleanup");
    await closeContext().catch(() => undefined);
    await closeBrowser().catch(() => undefined);
    logger.info("Browser resources cleaned up");
  }

  const report = buildReport({
    startedAt, startMs, categoryUrl, pagesFound, pagesCrawled,
    productsFound, productsCreated, productsUpdated, productsUnavailable,
    productsFailed, imagesDownloaded, imagesSkipped, syncStats, errors,
  });

  logger.setPhase("complete");
  logger.success("╔══════════════════════════════════════════════╗");
  logger.success("║  IMPORT COMPLETE                             ║");
  logger.success("╚══════════════════════════════════════════════╝");
  logger.info(`Duration: ${report.durationMs}ms`);
  logger.info(`supplier_products — Created: ${productsCreated} | Updated: ${productsUpdated} | Unavailable: ${productsUnavailable}`);
  logger.info(`store products    — Created: ${syncStats.storeCreated} | Updated: ${syncStats.storeUpdated} | Failed: ${syncStats.storeFailed}`);
  logger.info(`Images: ${imagesDownloaded} downloaded, ${imagesSkipped} skipped`);

  return report;
}

// ── Report builder ─────────────────────────────────────────────────────────

function buildReport(args: {
  startedAt: string;
  startMs: number;
  categoryUrl: string;
  pagesFound: number;
  pagesCrawled: number;
  productsFound: number;
  productsCreated: number;
  productsUpdated: number;
  productsUnavailable: number;
  productsFailed: number;
  imagesDownloaded: number;
  imagesSkipped: number;
  syncStats: SyncStats;
  errors: ImportError[];
}): ImportReport {
  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - args.startMs;

  return {
    startedAt: args.startedAt,
    finishedAt,
    durationMs,
    categoryUrl: args.categoryUrl,
    pagesFound: args.pagesFound,
    pagesCrawled: args.pagesCrawled,
    productsFound: args.productsFound,
    productsCreated: args.productsCreated,
    productsUpdated: args.productsUpdated,
    productsUnavailable: args.productsUnavailable,
    productsFailed: args.productsFailed,
    imagesDownloaded: args.imagesDownloaded,
    imagesSkipped: args.imagesSkipped,
    sync: args.syncStats,
    errors: args.errors,
  };
}
