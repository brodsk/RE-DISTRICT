/**
 * RE:DISTRICT — Data Store
 * Backend: Upstash Redis via @upstash/redis
 *
 * Required env vars (set in Vercel with prefix "redistrict_"):
 *   redistrict_KV_REST_API_URL
 *   redistrict_KV_REST_API_TOKEN
 *
 * Local dev fallback: .data/*.json files
 */

import type { Product, PageConfig, ProductCategory, SavedOrder } from "@/lib/types";
import { CATEGORY_PREFIX } from "@/lib/types";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const IS_VERCEL = !!process.env.VERCEL;
const LOCAL_DIR = join(process.cwd(), ".data");

// ── Redis client ──────────────────────────────────────────────────────────────

function getRedis() {
  // Vercel adds the prefix from the integration — try both prefixed and unprefixed
  const url =
    process.env.redistrict_KV_REST_API_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.redistrict_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  // Dynamic import so it doesn't crash during build when env vars aren't set
  const { Redis } = require("@upstash/redis");
  return new Redis({ url, token }) as import("@upstash/redis").Redis;
}

function redisAvailable(): boolean {
  return !!(
    (process.env.redistrict_KV_REST_API_URL || process.env.KV_REST_API_URL) &&
    (process.env.redistrict_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN)
  );
}

// ── Local filesystem (dev only) ───────────────────────────────────────────────

function localRead<T>(name: string, fallback: T): T {
  if (IS_VERCEL) return fallback;
  try {
    const p = join(LOCAL_DIR, `${name}.json`);
    if (!existsSync(p)) return fallback;
    return JSON.parse(readFileSync(p, "utf-8")) as T;
  } catch { return fallback; }
}

function localWrite(name: string, value: unknown): void {
  if (IS_VERCEL) return;
  try {
    mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(join(LOCAL_DIR, `${name}.json`), JSON.stringify(value, null, 2));
  } catch (e) { console.error("[store] local write error:", e); }
}

// ── Seed data (read-only fallback) ────────────────────────────────────────────

function readSeed<T>(name: string, fallback: T): T {
  try {
    const p = join(process.cwd(), "data", `${name}.json`);
    if (!existsSync(p)) return fallback;
    return JSON.parse(readFileSync(p, "utf-8")) as T;
  } catch { return fallback; }
}

// ── Core read / write ─────────────────────────────────────────────────────────

async function storeRead<T>(key: string, fallback: T): Promise<T> {
  // 1. Upstash Redis
  const redis = getRedis();
  if (redis) {
    try {
      const val = await redis.get<T>(key);
      if (val !== null && val !== undefined) {
        console.log(`[store] Redis GET "${key}" → ${Array.isArray(val) ? (val as unknown[]).length + " items" : "ok"}`);
        return val;
      }
    } catch (e) {
      console.error("[store] Redis GET error:", e);
    }
  }

  // 2. Local dev file
  const loc = localRead<T>(key, null as unknown as T);
  if (loc !== null) {
    console.log(`[store] local GET "${key}"`);
    return loc;
  }

  // 3. Seed file
  const seed = readSeed<T>(key, fallback);
  console.log(`[store] seed GET "${key}"`);
  return seed;
}

async function storeWrite(key: string, value: unknown): Promise<void> {
  // 1. Upstash Redis
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(key, value);
      console.log(`[store] Redis SET "${key}" OK`);
      return;
    } catch (e) {
      console.error("[store] Redis SET error:", e);
    }
  }

  // 2. Local dev file
  if (!IS_VERCEL) {
    localWrite(key, value);
    return;
  }

  console.warn(
    `[store] ⚠️  No persistent backend available for key "${key}". ` +
    `Set redistrict_KV_REST_API_URL and redistrict_KV_REST_API_TOKEN in Vercel environment variables.`
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  return storeRead<Product[]>("products", []);
}

export async function saveProduct(product: Product): Promise<void> {
  const list = await getProducts();
  const idx  = list.findIndex(p => p.id === product.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...product };
  else          list.unshift(product);
  console.log(`[store] saveProduct "${product.name}" (${product.id}) — total: ${list.length}`);
  await storeWrite("products", list);
}

export async function deleteProduct(id: string): Promise<void> {
  const list = (await getProducts()).filter(p => p.id !== id);
  console.log(`[store] deleteProduct ${id} — total: ${list.length}`);
  await storeWrite("products", list);
}

export async function getOrders(): Promise<SavedOrder[]> {
  return storeRead<SavedOrder[]>("orders", []);
}

export async function saveOrder(order: SavedOrder): Promise<void> {
  const list = await getOrders();
  const idx  = list.findIndex(o => o.id === order.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...order };
  else          list.unshift(order);
  await storeWrite("orders", list.slice(0, 100));
}

export async function getPages(): Promise<Record<string, PageConfig>> {
  return storeRead<Record<string, PageConfig>>("pages", {});
}

export async function savePage(page: string, config: PageConfig): Promise<void> {
  const pages = await getPages();
  pages[page] = config;
  await storeWrite("pages", pages);
}

// ── Status ────────────────────────────────────────────────────────────────────

export function getStoreStatus(): {
  backend:    string;
  persistent: boolean;
  redis:      boolean;
  local:      boolean;
} {
  const redis = redisAvailable();
  const local = !IS_VERCEL;
  return {
    redis,
    local,
    persistent: redis || local,
    backend:    redis ? "upstash-redis" : local ? "local-file" : "seed-only (not persistent)",
  };
}


// ── RD Watch ID system ────────────────────────────────────────────────────────
// Format: RD-[PREFIX]-[0001]
// Each category (CST/RST/CRT) has its own counter in the store.
// Counters never reset. IDs are immutable once assigned.

async function getCounter(prefix: string): Promise<number> {
  return storeRead<number>(`counter:${prefix}`, 0);
}

export async function generateRdId(category: ProductCategory): Promise<string> {
  const prefix = CATEGORY_PREFIX[category];
  const current = await getCounter(prefix);
  const next    = current + 1;
  await storeWrite(`counter:${prefix}`, next);
  return `RD-${prefix}-${String(next).padStart(4, "0")}`;
}
