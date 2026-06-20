/**
 * RE:DISTRICT — Persistent Data Store
 *
 * Storage priority:
 *   1. Vercel KV      — fastest, requires KV_REST_API_URL + KV_REST_API_TOKEN
 *   2. Vercel Blob    — file-based, requires BLOB_READ_WRITE_TOKEN
 *   3. Local file     — development only (not shared across devices)
 *   4. Seed data      — read-only fallback (data/products.json)
 *
 * The first available backend is used for both reads and writes.
 * Products created in admin WILL appear on all devices once any persistent
 * backend is configured.
 *
 * Quick setup: In Vercel dashboard → Storage → Create KV Database,
 * then copy KV_REST_API_URL and KV_REST_API_TOKEN to environment variables.
 */

import type { Product, PageConfig } from "@/lib/types";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IS_VERCEL = !!process.env.VERCEL;
const LOCAL_DIR = join(process.cwd(), ".data");

function readSeedFile<T>(name: string, fallback: T): T {
  const p = join(process.cwd(), "data", `${name}.json`);
  if (!existsSync(p)) return fallback;
  try { return JSON.parse(readFileSync(p, "utf-8")); } catch { return fallback; }
}

function log(msg: string) {
  console.log(`[store] ${msg}`);
}

// ─── Backend 1: Vercel KV ─────────────────────────────────────────────────────

function kvAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvRead<T>(key: string): Promise<T | null> {
  if (!kvAvailable()) return null;
  try {
    const { kv } = await import("@vercel/kv");
    const val = await kv.get<T>(key);
    if (val !== null && val !== undefined) {
      log(`KV read "${key}" OK`);
      return val;
    }
    return null;
  } catch (e) {
    log(`KV read error: ${e}`);
    return null;
  }
}

async function kvWrite(key: string, value: unknown): Promise<boolean> {
  if (!kvAvailable()) return false;
  try {
    const { kv } = await import("@vercel/kv");
    await kv.set(key, value);
    log(`KV write "${key}" OK`);
    return true;
  } catch (e) {
    log(`KV write error: ${e}`);
    return false;
  }
}

// ─── Backend 2: Vercel Blob ───────────────────────────────────────────────────
// Blob stores files at stable URLs. We use a fixed "virtual path" per key.
// Read: fetch the blob URL stored in a well-known index blob.
// Write: put new blob, update the index.

function blobAvailable() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// We store a small JSON "index" blob that maps key → blob URL
// index blob URL is stored in an env var or derived deterministically
const BLOB_INDEX_KEY = "redistrict-store-index";

async function blobReadIndex(): Promise<Record<string, string>> {
  if (!blobAvailable()) return {};
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_INDEX_KEY, token: process.env.BLOB_READ_WRITE_TOKEN! });
    if (blobs.length === 0) return {};
    // Use the most recent one
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];
    const res = await fetch(latest.url, { cache: "no-store" });
    return await res.json();
  } catch { return {}; }
}

async function blobRead<T>(key: string): Promise<T | null> {
  if (!blobAvailable()) return null;
  try {
    const index = await blobReadIndex();
    const url = index[key];
    if (!url) return null;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const val = await res.json();
    log(`Blob read "${key}" OK`);
    return val as T;
  } catch (e) {
    log(`Blob read error: ${e}`);
    return null;
  }
}

async function blobWrite(key: string, value: unknown): Promise<boolean> {
  if (!blobAvailable()) return false;
  try {
    const { put, del, list } = await import("@vercel/blob");
    const token = process.env.BLOB_READ_WRITE_TOKEN!;

    // 1. Upload the new value
    const dataBlob = new Blob([JSON.stringify(value)], { type: "application/json" });
    const { url: dataUrl } = await put(
      `redistrict-data-${key}-${Date.now()}.json`,
      dataBlob,
      { access: "public", token, addRandomSuffix: false }
    );

    // 2. Read + update the index
    const index = await blobReadIndex();

    // Delete old data blob for this key if it exists
    if (index[key]) {
      try { await del(index[key], { token }); } catch {}
    }

    index[key] = dataUrl;

    // 3. Delete old index blobs
    const { blobs: oldIndices } = await list({ prefix: BLOB_INDEX_KEY, token });
    for (const b of oldIndices) {
      try { await del(b.url, { token }); } catch {}
    }

    // 4. Upload new index
    const indexBlob = new Blob([JSON.stringify(index)], { type: "application/json" });
    await put(
      `${BLOB_INDEX_KEY}-${Date.now()}.json`,
      indexBlob,
      { access: "public", token, addRandomSuffix: false }
    );

    log(`Blob write "${key}" OK → ${dataUrl}`);
    return true;
  } catch (e) {
    log(`Blob write error: ${e}`);
    return false;
  }
}

// ─── Backend 3: Local filesystem (dev only) ───────────────────────────────────

function localRead<T>(name: string, fallback: T): T {
  if (IS_VERCEL) return fallback;
  try {
    const p = join(LOCAL_DIR, `${name}.json`);
    if (!existsSync(p)) return fallback;
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch { return fallback; }
}

function localWrite(name: string, value: unknown): boolean {
  if (IS_VERCEL) return false;
  try {
    mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(join(LOCAL_DIR, `${name}.json`), JSON.stringify(value, null, 2));
    log(`Local write "${name}" OK`);
    return true;
  } catch (e) {
    log(`Local write error: ${e}`);
    return false;
  }
}

// ─── Unified read/write ───────────────────────────────────────────────────────

async function storeRead<T>(key: string, fallback: T): Promise<T> {
  // 1. KV
  const kv = await kvRead<T>(key);
  if (kv !== null) return kv;

  // 2. Blob
  const blob = await blobRead<T>(key);
  if (blob !== null) return blob;

  // 3. Local (dev)
  const loc = localRead<T>(key, null as unknown as T);
  if (loc !== null) return loc;

  // 4. Seed file
  const seed = readSeedFile<T>(key, fallback);
  log(`Falling back to seed data for "${key}"`);
  return seed;
}

async function storeWrite(key: string, value: unknown): Promise<void> {
  // Try all backends, log which one succeeds
  const kv   = await kvWrite(key, value);
  const blob  = !kv  ? await blobWrite(key, value) : false;
  const local = !kv && !blob ? localWrite(key, value) : false;

  if (!kv && !blob && !local && IS_VERCEL) {
    log(
      `⚠️  NO PERSISTENT BACKEND AVAILABLE. ` +
      `Products will be lost on cold start. ` +
      `Configure KV_REST_API_URL+KV_REST_API_TOKEN or BLOB_READ_WRITE_TOKEN in Vercel.`
    );
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  return storeRead<Product[]>("products", []);
}

export async function saveProduct(product: Product): Promise<void> {
  const list = await getProducts();
  const idx  = list.findIndex(p => p.id === product.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...product };
  else          list.unshift(product);
  log(`saveProduct: "${product.name}" (${product.id}) — list now has ${list.length} items`);
  await storeWrite("products", list);
}

export async function deleteProduct(id: string): Promise<void> {
  const list = (await getProducts()).filter(p => p.id !== id);
  log(`deleteProduct: ${id} — list now has ${list.length} items`);
  await storeWrite("products", list);
}

export async function getPages(): Promise<Record<string, PageConfig>> {
  return storeRead<Record<string, PageConfig>>("pages", {});
}

export async function savePage(page: string, config: PageConfig): Promise<void> {
  const pages = await getPages();
  pages[page] = config;
  await storeWrite("pages", pages);
}

// ─── Status (for admin diagnostics) ──────────────────────────────────────────

export function getStoreStatus(): {
  kv: boolean;
  blob: boolean;
  local: boolean;
  persistent: boolean;
} {
  const kv    = kvAvailable();
  const blob  = blobAvailable();
  const local = !IS_VERCEL;
  return {
    kv,
    blob,
    local,
    persistent: kv || blob || local,
  };
}
