/**
 * RE:DISTRICT — Alza Pagination Module
 * Detects total pages and generates paginated URLs for a category.
 */

import * as cheerio from "cheerio";
import { ALZA_BASE_URL, SELECTORS } from "./constants";
import { logger } from "./logger";
import { normalizeAlzaUrl, parseNumber } from "./utils";

// ── Page count detection ───────────────────────────────────────────────────

/**
 * Try every known pagination selector to find total page count.
 * Returns 1 if no pagination found (single-page category).
 */
export function detectTotalPages(html: string): number {
  const $ = cheerio.load(html);

  // Strategy 1: "pagescnt" span with text like "5 stránok"
  for (const sel of SELECTORS.paginationPages) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.text().trim();
      const num = parseNumber(text);
      if (num && num > 0) {
        logger.debug(`Detected ${num} pages via selector "${sel}"`);
        return Math.round(num);
      }
    }
  }

  // Strategy 2: Look for numbered page links and find the max
  const pageNumbers: number[] = [];
  $("a[href*='?pgn='], a[href*='pg='], a.paginatorButton, .pagination a").each((_, el) => {
    const text = $(el).text().trim();
    const num = parseNumber(text);
    if (num && num > 0 && num < 1000) {
      pageNumbers.push(num);
    }
  });

  if (pageNumbers.length > 0) {
    const max = Math.max(...pageNumbers);
    logger.debug(`Detected ${max} pages via page number links`);
    return max;
  }

  // Strategy 3: Check for a "next" link; if absent, we're on the last/only page
  for (const sel of SELECTORS.paginationNext) {
    if ($(sel).length) {
      // Next exists but we can't determine total — return a sentinel
      logger.debug("Next page link found but total pages unknown, will crawl sequentially");
      return 0; // 0 = unknown, crawl until no more next
    }
  }

  logger.debug("No pagination detected — single page category");
  return 1;
}

/**
 * Check if a "next page" link exists in the current HTML.
 */
export function hasNextPage(html: string): boolean {
  const $ = cheerio.load(html);
  for (const sel of SELECTORS.paginationNext) {
    if ($(sel).length > 0) return true;
  }
  return false;
}

/**
 * Extract the href from the next page link.
 */
export function extractNextPageUrl(html: string, currentUrl: string): string | null {
  const $ = cheerio.load(html);

  for (const sel of SELECTORS.paginationNext) {
    const el = $(sel).first();
    if (el.length) {
      const href = el.attr("href");
      if (href) {
        return normalizeAlzaUrl(href, ALZA_BASE_URL);
      }
    }
  }

  // Fallback: try to increment page parameter
  return buildNextPageUrl(currentUrl);
}

/**
 * Build paginated URLs for a category when total pages are known.
 * Alza pagination: /category/v{id}.htm → /category/v{id}/p{page}.htm
 */
export function buildPaginatedUrls(categoryUrl: string, totalPages: number): string[] {
  if (totalPages <= 1) return [categoryUrl];

  const urls: string[] = [categoryUrl];

  // Pattern: /vXXXX.htm → /vXXXX/pN.htm
  const vMatch = categoryUrl.match(/\/v(\d+)(\.htm)/i);
  if (vMatch) {
    const base = categoryUrl.replace(`/v${vMatch[1]}${vMatch[2]}`, `/v${vMatch[1]}`);
    for (let page = 2; page <= totalPages; page++) {
      urls.push(`${base}/p${page}.htm`);
    }
    return urls;
  }

  // Fallback: append ?pgn=N query param
  const baseUrl = categoryUrl.split("?")[0];
  for (let page = 2; page <= totalPages; page++) {
    urls.push(`${baseUrl}?pgn=${page}`);
  }

  return urls;
}

// ── Internal helpers ───────────────────────────────────────────────────────

function buildNextPageUrl(currentUrl: string): string | null {
  try {
    const url = new URL(currentUrl);

    // Try pgn param
    const pgn = url.searchParams.get("pgn");
    if (pgn) {
      const next = parseInt(pgn, 10) + 1;
      url.searchParams.set("pgn", String(next));
      return url.toString();
    }

    // Try path-based pagination /pN.htm
    const pathMatch = currentUrl.match(/\/p(\d+)\.htm$/i);
    if (pathMatch) {
      const next = parseInt(pathMatch[1], 10) + 1;
      return currentUrl.replace(/\/p\d+\.htm$/, `/p${next}.htm`);
    }

    return null;
  } catch {
    return null;
  }
}
