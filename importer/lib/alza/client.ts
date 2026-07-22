/**
 * RE:DISTRICT — Alza Client
 * High-level page fetching with retry and throttling.
 * Wraps browser.ts with retry logic and request throttling.
 */

import type { BrowserContext } from "playwright";
import { createContext, fetchPageHtml, type FetchedPage } from "./browser";
import { MAX_RETRIES } from "./constants";
import { logger } from "./logger";
import { withRetry, randomDelay } from "./utils";

// ── Context pool ───────────────────────────────────────────────────────────

let sharedContext: BrowserContext | null = null;

async function getContext(): Promise<BrowserContext> {
  if (!sharedContext) {
    sharedContext = await createContext();
  }
  return sharedContext;
}

export async function closeContext(): Promise<void> {
  if (sharedContext) {
    await sharedContext.close().catch(() => undefined);
    sharedContext = null;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch a page with automatic retry and random throttling.
 * Returns the full HTML string via Playwright + Cheerio-ready output.
 */
export async function fetchPage(
  url: string,
  waitForSelector?: string,
): Promise<FetchedPage> {
  logger.debug(`Fetching: ${url}`);

  await randomDelay();

  const context = await getContext();

  return withRetry(
    () => fetchPageHtml(url, context, waitForSelector),
    MAX_RETRIES,
    `fetchPage(${url})`,
  );
}

/**
 * Fetch multiple pages concurrently (up to limit).
 * Each page gets its own rate limiting.
 */
export async function fetchPages(
  urls: string[],
  concurrency: number,
  waitForSelector?: string,
): Promise<Array<{ url: string; html: string | null; error: string | null }>> {
  const results: Array<{ url: string; html: string | null; error: string | null }> = [];
  const queue = [...urls];
  const inFlight: Promise<void>[] = [];

  async function processOne(url: string): Promise<void> {
    try {
      const page = await fetchPage(url, waitForSelector);
      results.push({ url, html: page.html, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to fetch ${url}`, { error: msg });
      results.push({ url, html: null, error: msg });
    }
  }

  while (queue.length > 0 || inFlight.length > 0) {
    while (inFlight.length < concurrency && queue.length > 0) {
      const url = queue.shift()!;
      const p = processOne(url).then(() => {
        inFlight.splice(inFlight.indexOf(p), 1);
      });
      inFlight.push(p);
    }

    if (inFlight.length > 0) {
      await Promise.race(inFlight);
    }
  }

  return results;
}
