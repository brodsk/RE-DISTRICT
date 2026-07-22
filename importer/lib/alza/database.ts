/**
 * RE:DISTRICT — Alza Database Layer
 * All Supabase read/write operations for supplier_products table.
 * Uses service key (server-side only).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AlzaProduct, SupplierProductRow } from "./types";
import { SUPPLIER_TABLE, SUPPLIER_NAME } from "./constants";
import { logger } from "./logger";

// ── Supabase admin client (service key) ───────────────────────────────────

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set for the importer");
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false },
  });

  return adminClient;
}

// ── Row mappers ────────────────────────────────────────────────────────────

function productToRow(
  product: AlzaProduct,
  storedImageUrls: string[],
  existingRow?: SupplierProductRow,
): Omit<SupplierProductRow, "created_at"> {
  const now = new Date().toISOString();

  return {
    id: existingRow?.id ?? crypto.randomUUID(),
    supplier: SUPPLIER_NAME,
    supplier_product_id: product.supplierProductId,
    supplier_url: product.url,

    name: product.name,
    brand: product.brand,

    price: product.price,
    original_price: product.originalPrice,
    currency: product.currency,

    availability: product.availability,
    stock_status: product.stockStatus,

    rating: product.rating,
    review_count: product.reviewCount,

    description: product.description,
    short_description: product.shortDescription,

    ean: product.ean,
    manufacturer: product.manufacturer,
    warranty: product.warranty,

    category: product.category,
    breadcrumbs: product.breadcrumbs,
    images: storedImageUrls.map((url, i) => ({
      url,
      alt: product.images[i]?.alt ?? "",
      position: i,
    })),
    parameters: product.parameters,

    store_product_id: existingRow?.store_product_id ?? null,
    is_available: product.stockStatus !== "discontinued" && product.stockStatus !== "out_of_stock",
    last_scraped_at: product.lastScrapedAt,
    updated_at: now,
  };
}

// ── Public database operations ─────────────────────────────────────────────

/**
 * Find an existing supplier product row by supplierProductId.
 */
export async function findExistingProduct(
  supplierProductId: string,
): Promise<SupplierProductRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from(SUPPLIER_TABLE)
    .select("*")
    .eq("supplier", SUPPLIER_NAME)
    .eq("supplier_product_id", supplierProductId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    logger.error(`DB findExistingProduct error`, { id: supplierProductId, error: error.message });
    return null;
  }

  return data as SupplierProductRow;
}

/**
 * Upsert a supplier product into Supabase.
 * Creates new or updates supplier-controlled fields only.
 * Never overwrites: store_product_id, or any store-controlled overrides.
 */
export async function upsertSupplierProduct(
  product: AlzaProduct,
  storedImageUrls: string[],
): Promise<{ action: "created" | "updated"; id: string }> {
  const supabase = getSupabaseAdmin();

  const existing = await findExistingProduct(product.supplierProductId);
  const row = productToRow(product, storedImageUrls, existing ?? undefined);

  if (existing) {
    // UPDATE — only supplier-controlled fields
    const { error } = await supabase
      .from(SUPPLIER_TABLE)
      .update({
        supplier_url:       row.supplier_url,
        name:               row.name,
        brand:              row.brand,
        price:              row.price,
        original_price:     row.original_price,
        currency:           row.currency,
        availability:       row.availability,
        stock_status:       row.stock_status,
        rating:             row.rating,
        review_count:       row.review_count,
        description:        row.description,
        short_description:  row.short_description,
        ean:                row.ean,
        manufacturer:       row.manufacturer,
        warranty:           row.warranty,
        category:           row.category,
        breadcrumbs:        row.breadcrumbs,
        images:             row.images,
        parameters:         row.parameters,
        is_available:       row.is_available,
        last_scraped_at:    row.last_scraped_at,
        updated_at:         row.updated_at,
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(`DB update failed for ${product.supplierProductId}: ${error.message}`);
    }

    logger.debug(`Updated supplier product: ${product.name} (${existing.id})`);
    return { action: "updated", id: existing.id };
  } else {
    // INSERT — full row
    const { error } = await supabase
      .from(SUPPLIER_TABLE)
      .insert({
        ...row,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`DB insert failed for ${product.supplierProductId}: ${error.message}`);
    }

    logger.debug(`Created supplier product: ${product.name} (${row.id})`);
    return { action: "created", id: row.id };
  }
}

/**
 * Get all supplier product IDs currently in the database for this supplier.
 * Used to detect products that disappeared from Alza.
 */
export async function getAllStoredProductIds(): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from(SUPPLIER_TABLE)
    .select("supplier_product_id")
    .eq("supplier", SUPPLIER_NAME);

  if (error) {
    logger.error("DB getAllStoredProductIds error", { error: error.message });
    return new Set();
  }

  return new Set((data ?? []).map((r: { supplier_product_id: string }) => r.supplier_product_id));
}

/**
 * Mark products as unavailable if they weren't seen in the current import.
 * Does NOT delete products.
 */
export async function markMissingProductsUnavailable(
  seenProductIds: Set<string>,
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const allIds = await getAllStoredProductIds();

  const missing: string[] = [];
  for (const id of allIds) {
    if (!seenProductIds.has(id)) {
      missing.push(id);
    }
  }

  if (missing.length === 0) return 0;

  const { error } = await supabase
    .from(SUPPLIER_TABLE)
    .update({
      is_available: false,
      stock_status: "out_of_stock",
      updated_at: new Date().toISOString(),
    })
    .eq("supplier", SUPPLIER_NAME)
    .in("supplier_product_id", missing);

  if (error) {
    logger.error("DB markMissingProductsUnavailable error", { error: error.message });
    return 0;
  }

  logger.info(`Marked ${missing.length} products as unavailable (not found in current import)`);
  return missing.length;
}

/**
 * Verify the supplier_products table exists by doing a test query.
 * Returns false if table doesn't exist.
 */
export async function verifyDatabaseSchema(): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from(SUPPLIER_TABLE)
    .select("id")
    .limit(1);

  if (error) {
    logger.error("Database schema verification failed", { error: error.message });
    logger.error(
      "Please run the following SQL in Supabase SQL Editor:\n" +
      "  See: scripts/create-supplier-tables.sql"
    );
    return false;
  }

  return true;
}
