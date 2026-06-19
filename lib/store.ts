/**
 * RE:DISTRICT — Data Store
 *
 * Priority chain:
 *   1. Vercel KV  → persistent, shared across all devices/deployments
 *   2. Seed file  → bundled data/products.json (read-only, for initial data)
 *
 * ⚠️  /tmp writes are intentionally REMOVED.
 *     Vercel's /tmp is per-instance and per-cold-start — NOT shared between
 *     serverless function instances. Writing there causes products created on
 *     one device to be invisible on others.
 *
 * Set these env vars in Vercel dashboard:
 *   KV_REST_API_URL      (from Vercel KV storage tab)
 *   KV_REST_API_TOKEN    (from Vercel KV storage tab)
 *
 * Without KV: seed data from data/products.json is served (read-only).
 */

import type { Product, PageConfig } from "@/lib/types";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ── Seed data (bundled, read-only) ────────────────────────────────────────────

function readSeed<T>(name: string, fallback: T): T {
  const p = join(process.cwd(), "data", `${name}.json`);
  if (!existsSync(p)) return fallback;
  try { return JSON.parse(readFileSync(p, "utf-8")); } catch { return fallback; }
}

// ── Vercel KV ─────────────────────────────────────────────────────────────────

function hasKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvGet<T>(key: string): Promise<T | null> {
  if (!hasKV()) return null;
  try {
    const { kv } = await import("@vercel/kv");
    return await kv.get<T>(key);
  } catch (e) {
    console.error("[store] KV get error:", e);
    return null;
  }
}

async function kvSet(key: string, value: unknown): Promise<void> {
  if (!hasKV()) {
    console.warn("[store] KV not configured — changes will not persist across requests. Set KV_REST_API_URL and KV_REST_API_TOKEN in Vercel.");
    return;
  }
  try {
    const { kv } = await import("@vercel/kv");
    await kv.set(key, value);
  } catch (e) {
    console.error("[store] KV set error:", e);
  }
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  // 1. Try KV (persistent, shared across devices)
  const kv = await kvGet<Product[]>("products");
  if (kv && Array.isArray(kv)) return kv;

  // 2. Fall back to bundled seed data
  return readSeed<Product[]>("products", []);
}

export async function saveProduct(product: Product): Promise<void> {
  const list = await getProducts();
  const idx  = list.findIndex(p => p.id === product.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...product };
  else          list.unshift(product);
  await kvSet("products", list);
}

export async function deleteProduct(id: string): Promise<void> {
  const list = (await getProducts()).filter(p => p.id !== id);
  await kvSet("products", list);
}

// ── Pages ─────────────────────────────────────────────────────────────────────

export async function getPages(): Promise<Record<string, PageConfig>> {
  const kv = await kvGet<Record<string, PageConfig>>("pages");
  if (kv) return kv;
  return readSeed<Record<string, PageConfig>>("pages", {});
}

export async function savePage(page: string, config: PageConfig): Promise<void> {
  const pages = await getPages();
  pages[page] = config;
  await kvSet("pages", pages);
}
