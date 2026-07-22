/**
 * RE:DISTRICT — Alza Category Crawler
 * Crawls a category page (and all its pages) to collect product URLs.
 * Uses Playwright for rendering, Cheerio for parsing.
 */

import * as cheerio from "cheerio";
import type { AlzaProductStub, CategoryCrawlResult } from "./types";
import { ALZA_BASE_URL, SELECTORS } from "./constants";
import { fetchPage } from "./client";
import { logger } from "./logger";
import { detectTotalPages, buildPaginatedUrls, hasNextPage, extractNextPageUrl } from "./pagination";
import { normalizeAlzaUrl, extractSupplierProductId, cleanText, deduplicateByKey } from "./utils";

// ── Product stub extraction from a single category page ───────────────────

function extractProductStubs(html: string, pageUrl: string): AlzaProductStub[] {
  const $ = cheerio.load(html);
  const stubs: AlzaProductStub[] = [];

  // Try each product item selector
  for (const itemSel of SELECTORS.productItem) {
    const items = $(itemSel);
    if (items.length === 0) continue;

    items.each((_, el) => {
      const item = $(el);

      // Try each link selector within the item
      let href: string | null = null;
      let name: string | null = null;

      for (const linkSel of SELECTORS.productLink) {
        const link = item.find(linkSel).first();
        if (link.length) {
          href = link.attr("href") ?? null;
          name = cleanText(link.text() || link.attr("title") || link.attr("aria-label"));
          if (href) break;
        }
      }

      if (!href) return;

      const absoluteUrl = normalizeAlzaUrl(href, ALZA_BASE_URL);
      const supplierProductId = extractSupplierProductId(absoluteUrl);

      if (!supplierProductId || supplierProductId.startsWith("hash_0")) return;

      stubs.push({
        url: absoluteUrl,
        name: name ?? "",
        supplierProductId,
      });
    });

    // If we found items, stop trying other selectors
    if (stubs.length > 0) break;
  }

  if (stubs.length === 0) {
    logger.warn(`No product stubs found on page: ${pageUrl}`);
  } else {
    logger.debug(`Found ${stubs.length} product stubs on: ${pageUrl}`);
  }

  return stubs;
}

// ── Category crawl strategies ──────────────────────────────────────────────

/**
 * Strategy A: known total pages → build all URLs upfront, fetch in parallel.
 */
async function crawlKnownPages(
  categoryUrl: string,
  totalPages: number,
): Promise<AlzaProductStub[]> {
  const urls = buildPaginatedUrls(categoryUrl, totalPages);
  logger.info(`Crawling ${urls.length} category pages (known pagination)`);

  const allStubs: AlzaProductStub[] = [];

  // Fetch pages sequentially to be respectful
  for (const [index, url] of urls.entries()) {
    logger.setPhase(`category-page-${index + 1}`);
    try {
      const { html } = await fetchPage(url);
      const stubs = extractProductStubs(html, url);
      allStubs.push(...stubs);
      logger.info(`Page ${index + 1}/${urls.length}: ${stubs.length} products`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to crawl category page ${url}`, { error: msg });
    }
  }

  return allStubs;
}

/**
 * Strategy B: unknown total pages → follow "next" links sequentially.
 */
async function crawlSequential(categoryUrl: string): Promise<AlzaProductStub[]> {
  const allStubs: AlzaProductStub[] = [];
  let currentUrl: string | null = categoryUrl;
  let pageNum = 1;

  while (currentUrl) {
    logger.setPhase(`category-page-${pageNum}`);
    logger.info(`Crawling category page ${pageNum}: ${currentUrl}`);

    try {
      const { html } = await fetchPage(currentUrl);
      const stubs = extractProductStubs(html, currentUrl);
      allStubs.push(...stubs);

      if (hasNextPage(html)) {
        currentUrl = extractNextPageUrl(html, currentUrl);
        pageNum++;
      } else {
        currentUrl = null;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to crawl page ${pageNum}`, { error: msg });
      break;
    }
  }

  return allStubs;
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Crawl an Alza category URL and return all product stubs.
 * Handles pagination automatically.
 */
export async function crawlCategory(categoryUrl: string): Promise<CategoryCrawlResult> {
  logger.setPhase("category-detect");
  logger.info(`Starting category crawl: ${categoryUrl}`);

  // Fetch first page to detect pagination
  const firstPage = await fetchPage(categoryUrl);
  const totalPages = detectTotalPages(firstPage.html);

  logger.info(`Total pages detected: ${totalPages === 0 ? "unknown" : totalPages}`);

  let allStubs: AlzaProductStub[];

  if (totalPages === 1) {
    // Single page: already have the HTML
    allStubs = extractProductStubs(firstPage.html, categoryUrl);
  } else if (totalPages > 1) {
    // Known total: crawl all pages (first page already fetched)
    const firstPageStubs = extractProductStubs(firstPage.html, categoryUrl);
    const remainingUrls = buildPaginatedUrls(categoryUrl, totalPages).slice(1);

    const remainingStubs: AlzaProductStub[] = [];
    for (const [i, url] of remainingUrls.entries()) {
      logger.setPhase(`category-page-${i + 2}`);
      try {
        const { html } = await fetchPage(url);
        remainingStubs.push(...extractProductStubs(html, url));
        logger.info(`Page ${i + 2}/${totalPages}: found ${remainingStubs.length} stubs so far`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error(`Failed on page ${i + 2}`, { error: msg });
      }
    }

    allStubs = [...firstPageStubs, ...remainingStubs];
  } else {
    // Unknown total: follow next links
    allStubs = await crawlSequential(categoryUrl);
  }

  // Remove duplicate product URLs
  const unique = deduplicateByKey(allStubs, "supplierProductId");

  logger.success(`Category crawl complete`, {
    totalPages: totalPages || "unknown",
    productsFound: unique.length,
    duplicatesRemoved: allStubs.length - unique.length,
  });

  return {
    categoryUrl,
    totalPages: totalPages || allStubs.length,
    productStubs: unique,
  };
}
