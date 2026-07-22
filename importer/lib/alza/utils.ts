/**
 * RE:DISTRICT — Alza Importer Utilities
 */

import { RETRY_BASE_DELAY_MS, RETRY_MAX_DELAY_MS, REQUEST_DELAY_MIN_MS, REQUEST_DELAY_MAX_MS } from "./constants";
import { logger } from "./logger";

// ── Delays ─────────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function randomDelay(): Promise<void> {
  const ms = REQUEST_DELAY_MIN_MS + Math.random() * (REQUEST_DELAY_MAX_MS - REQUEST_DELAY_MIN_MS);
  await sleep(ms);
}

export function exponentialBackoff(attempt: number): number {
  const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
  return Math.min(delay, RETRY_MAX_DELAY_MS);
}

// ── Retry wrapper ──────────────────────────────────────────────────────────

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  context: string,
): Promise<T> {
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxRetries) {
        const delay = exponentialBackoff(attempt);
        logger.warn(`${context} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms`, {
          error: lastError.message,
        });
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

// ── Concurrency control ────────────────────────────────────────────────────

export async function runConcurrent<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<Array<{ item: T; result: R | null; error: Error | null }>> {
  const results: Array<{ item: T; result: R | null; error: Error | null }> = [];
  const queue = [...items];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;

      try {
        const result = await fn(item);
        results.push({ item, result, error: null });
      } catch (err) {
        results.push({
          item,
          result: null,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return results;
}

// ── URL handling ───────────────────────────────────────────────────────────

export function normalizeAlzaUrl(url: string, base: string): string {
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}

export function extractSupplierProductId(url: string): string {
  // Alza product URLs follow: /nazov-produktu/p12345678.htm
  const match = url.match(/\/p(\d+)\.htm/i);
  if (match) return match[1];

  // Fallback: hash the URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}

export function buildImageStoragePath(supplier: string, productId: string, index: number, ext: string): string {
  return `${supplier}/${productId}/${index}.${ext}`;
}

// ── Text cleaning ──────────────────────────────────────────────────────────

export function cleanText(text: string | undefined | null): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

export function parsePrice(raw: string | undefined | null): number | null {
  if (!raw) return null;
  // Remove currency symbols, spaces, replace comma decimals
  const cleaned = raw.replace(/[^\d,\.]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

export function parseNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getFileExtension(url: string): string {
  const match = url.match(/\.([a-z]+)(\?|$)/i);
  return match ? match[1].toLowerCase() : "jpg";
}

export function deduplicateByKey<T>(items: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return items.filter(item => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
