// lib/store.ts
// Server-side only. Uses Vercel KV when available, /tmp otherwise.
import type { Product, PageConfig } from "@/lib/types";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const IS_VERCEL = !!process.env.VERCEL;
const TMP       = "/tmp/rd";
const DATA_DIR  = join(process.cwd(), "data");

function ensureDir(d: string) {
  try { mkdirSync(d, { recursive: true }); } catch {}
}

// ── File helpers ──────────────────────────────────────────────────────────────

function readJSON<T>(name: string, fallback: T): T {
  // Try /tmp first (runtime writes), then project data dir (seed)
  const paths = [
    join(TMP, `${name}.json`),
    join(DATA_DIR, `${name}.json`),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      try { return JSON.parse(readFileSync(p, "utf-8")); } catch {}
    }
  }
  return fallback;
}

function writeJSON<T>(name: string, data: T): void {
  ensureDir(TMP);
  writeFileSync(join(TMP, `${name}.json`), JSON.stringify(data, null, 2));
}

// ── KV helpers ────────────────────────────────────────────────────────────────

async function kvGet<T>(key: string): Promise<T | null> {
  if (!process.env.KV_REST_API_URL) return null;
  try {
    const { kv } = await import("@vercel/kv");
    return await kv.get<T>(key);
  } catch { return null; }
}

async function kvSet(key: string, value: unknown): Promise<void> {
  if (!process.env.KV_REST_API_URL) return;
  try {
    const { kv } = await import("@vercel/kv");
    await kv.set(key, value);
  } catch {}
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const kv = await kvGet<Product[]>("products");
  if (kv && Array.isArray(kv)) return kv;
  return readJSON<Product[]>("products", []);
}

export async function saveProduct(product: Product): Promise<void> {
  const list = await getProducts();
  const idx  = list.findIndex(p => p.id === product.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...product };
  else          list.unshift(product);
  await kvSet("products", list);
  writeJSON("products", list);
}

export async function deleteProduct(id: string): Promise<void> {
  const list = (await getProducts()).filter(p => p.id !== id);
  await kvSet("products", list);
  writeJSON("products", list);
}

// ── Pages ─────────────────────────────────────────────────────────────────────

export async function getPages(): Promise<Record<string, PageConfig>> {
  const kv = await kvGet<Record<string, PageConfig>>("pages");
  if (kv) return kv;
  return readJSON<Record<string, PageConfig>>("pages", {});
}

export async function savePage(page: string, config: PageConfig): Promise<void> {
  const pages  = await getPages();
  pages[page]  = config;
  await kvSet("pages", pages);
  writeJSON("pages", pages);
}
