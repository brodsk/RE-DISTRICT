/**
 * RE:DISTRICT — Alza Product Scraper
 * Fetches and parses individual product pages.
 * Combines client.ts (fetch) + parser.ts (parse).
 */

import type { AlzaProduct, AlzaProductStub } from "./types";
import { MAX_CONCURRENT_PRODUCT_PAGES, MAX_RETRIES } from "./constants";
import { fetchPage } from "./client";
import { parseProductPage } from "./parser";
import { logger } from "./logger";
import { withRetry, runConcurrent } from "./utils";

// ── Single product scrape ──────────────────────────────────────────────────

/**
 * Scrape a single product page. Returns null on failure.
 */
export async function scrapeProduct(url: string): Promise<AlzaProduct | null> {
  try {
    const { html, statusCode } = await withRetry(
      () => fetchPage(url),
      MAX_RETRIES,
      `scrapeProduct(${url})`,
    );

    if (statusCode === 404) {
      logger.warn(`Product page 404: ${url}`);
      return null;
    }

    if (statusCode >= 400) {
      logger.error(`Product page HTTP ${statusCode}: ${url}`);
      return null;
    }

    const product = parseProductPage(html, url);
    return product;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to scrape product: ${url}`, { error: msg });
    return null;
  }
}

// ── Batch product scraping ─────────────────────────────────────────────────

export interface ScrapeResult {
  stub: AlzaProductStub;
  product: AlzaProduct | null;
  error: string | null;
}

/**
 * Scrape multiple product pages with controlled concurrency.
 * Never throws — failed products are returned with error set.
 */
export async function scrapeProducts(
  stubs: AlzaProductStub[],
  onProgress?: (done: number, total: number, latest: ScrapeResult) => void,
): Promise<ScrapeResult[]> {
  logger.info(`Scraping ${stubs.length} products (concurrency: ${MAX_CONCURRENT_PRODUCT_PAGES})`);

  const results: ScrapeResult[] = [];
  let done = 0;

  const concurrentResults = await runConcurrent(
    stubs,
    MAX_CONCURRENT_PRODUCT_PAGES,
    async (stub) => {
      logger.setPhase(`product:${stub.supplierProductId}`);

      try {
        const product = await scrapeProduct(stub.url);
        const result: ScrapeResult = {
          stub,
          product,
          error: product ? null : "Failed to parse product page",
        };

        done++;
        onProgress?.(done, stubs.length, result);

        if (product) {
          logger.info(`[${done}/${stubs.length}] ✓ ${product.name}`);
        } else {
          logger.warn(`[${done}/${stubs.length}] ✗ ${stub.url}`);
        }

        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const result: ScrapeResult = { stub, product: null, error: msg };
        done++;
        onProgress?.(done, stubs.length, result);
        return result;
      }
    },
  );

  for (const { result } of concurrentResults) {
    if (result) results.push(result);
  }

  const successful = results.filter(r => r.product !== null).length;
  const failed = results.filter(r => r.product === null).length;

  logger.success(`Product scraping complete`, { successful, failed, total: stubs.length });

  return results;
}
