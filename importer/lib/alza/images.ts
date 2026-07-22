/**
 * RE:DISTRICT — Alza Image Handler
 * Downloads images from Alza, uploads to Supabase Storage.
 * Never hotlinks Alza images on the frontend.
 */

import type { AlzaImage } from "./types";
import { SUPPLIER_IMAGE_BUCKET, MAX_CONCURRENT_IMAGE_DOWNLOADS, MAX_RETRIES, SUPPLIER_NAME } from "./constants";
import { logger } from "./logger";
import { withRetry, buildImageStoragePath, getFileExtension, sleep } from "./utils";
import { getSupabaseAdmin } from "./database";

// ── Image download ─────────────────────────────────────────────────────────

async function downloadImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; redistrict-importer/1.0)",
      "Referer": "https://www.alza.sk/",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for image: ${url}`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length < 100) {
    throw new Error(`Image too small (${buffer.length} bytes), likely invalid: ${url}`);
  }

  return { buffer, contentType };
}

// ── Supabase Storage upload ────────────────────────────────────────────────

async function fileExistsInStorage(storagePath: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(SUPPLIER_IMAGE_BUCKET)
    .list(storagePath.substring(0, storagePath.lastIndexOf("/")));

  if (error || !data) return false;

  const fileName = storagePath.split("/").pop() ?? "";
  return data.some(file => file.name === fileName);
}

async function uploadToStorage(
  buffer: Buffer,
  storagePath: string,
  contentType: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage
    .from(SUPPLIER_IMAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: false,
      cacheControl: "31536000",
    });

  if (error) {
    if (error.message.includes("already exists") || error.message.includes("The resource already exists")) {
      // File already exists — get its public URL
    } else {
      throw new Error(`Storage upload failed: ${error.message}`);
    }
  }

  const { data } = supabase.storage
    .from(SUPPLIER_IMAGE_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

// ── Public image processing ────────────────────────────────────────────────

export interface ImageResult {
  originalUrl: string;
  storedUrl: string | null;
  storagePath: string | null;
  downloaded: boolean;
  skipped: boolean;
  error: string | null;
}

/**
 * Download and store a single image.
 * Returns existing URL if image already in storage.
 */
export async function processImage(
  image: AlzaImage,
  supplierProductId: string,
): Promise<ImageResult> {
  const ext = getFileExtension(image.url);
  const storagePath = buildImageStoragePath(SUPPLIER_NAME, supplierProductId, image.position, ext);

  // Check if already uploaded
  const exists = await fileExistsInStorage(storagePath);
  if (exists) {
    const supabase = getSupabaseAdmin();
    const { data } = supabase.storage.from(SUPPLIER_IMAGE_BUCKET).getPublicUrl(storagePath);
    logger.debug(`Image already exists, skipping: ${storagePath}`);
    return {
      originalUrl: image.url,
      storedUrl: data.publicUrl,
      storagePath,
      downloaded: false,
      skipped: true,
      error: null,
    };
  }

  // Download and upload
  try {
    const { buffer, contentType } = await withRetry(
      () => downloadImageBuffer(image.url),
      MAX_RETRIES,
      `downloadImage(${image.url})`,
    );

    const publicUrl = await withRetry(
      () => uploadToStorage(buffer, storagePath, contentType),
      MAX_RETRIES,
      `uploadImage(${storagePath})`,
    );

    logger.debug(`Image uploaded: ${storagePath} (${buffer.length} bytes)`);

    return {
      originalUrl: image.url,
      storedUrl: publicUrl,
      storagePath,
      downloaded: true,
      skipped: false,
      error: null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`Image processing failed: ${image.url}`, { error: msg });
    return {
      originalUrl: image.url,
      storedUrl: null,
      storagePath,
      downloaded: false,
      skipped: false,
      error: msg,
    };
  }
}

/**
 * Process all images for a product.
 * Returns array of stored public URLs (null entries where download failed).
 */
export async function processProductImages(
  images: AlzaImage[],
  supplierProductId: string,
): Promise<{ storedUrls: string[]; downloaded: number; skipped: number; failed: number }> {
  if (images.length === 0) {
    return { storedUrls: [], downloaded: 0, skipped: 0, failed: 0 };
  }

  const results: ImageResult[] = [];
  let inFlight: Promise<void>[] = [];
  const queue = [...images];

  async function processOne(image: AlzaImage): Promise<void> {
    // Small delay between image downloads
    await sleep(200 + Math.random() * 300);
    const result = await processImage(image, supplierProductId);
    results.push(result);
  }

  while (queue.length > 0 || inFlight.length > 0) {
    while (inFlight.length < MAX_CONCURRENT_IMAGE_DOWNLOADS && queue.length > 0) {
      const image = queue.shift()!;
      const p = processOne(image).then(() => {
        inFlight = inFlight.filter(x => x !== p);
      });
      inFlight.push(p);
    }
    if (inFlight.length > 0) await Promise.race(inFlight);
  }

  const storedUrls = results
    .filter(r => r.storedUrl !== null)
    .sort((a, b) => {
      const aIdx = images.findIndex(i => i.url === a.originalUrl);
      const bIdx = images.findIndex(i => i.url === b.originalUrl);
      return aIdx - bIdx;
    })
    .map(r => r.storedUrl!);

  const downloaded = results.filter(r => r.downloaded).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => r.error !== null).length;

  return { storedUrls, downloaded, skipped, failed };
}

/**
 * Ensure the supplier-images bucket exists in Supabase Storage.
 */
export async function ensureImageBucket(): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === SUPPLIER_IMAGE_BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(SUPPLIER_IMAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB per image
    });

    if (error && !error.message.includes("already exists")) {
      throw new Error(`Failed to create image bucket: ${error.message}`);
    }

    logger.info(`Created Supabase Storage bucket: ${SUPPLIER_IMAGE_BUCKET}`);
  }
}
