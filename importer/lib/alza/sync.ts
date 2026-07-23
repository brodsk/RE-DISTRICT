/**
 * RE:DISTRICT — Supplier → Store Sync Engine
 *
 * Reads from supplier_products (Supabase), writes to products (Supabase / Upstash).
 *
 * Matching key: supplier + supplier_product_id
 *
 * Supplier-controlled fields (always updated):
 *   name, brand, price, supplierPrice, supplierStock, supplierUrl,
 *   images, stock, status, specifications
 *
 * Store-controlled fields (never overwritten if already set):
 *   slug, tagline, description, tags, featured, category,
 *   year, movementType, module, grade, rdWatchId, story
 */

import type { Product } from "@/lib/types";
import type { SupplierProductRow, SyncStats } from "./types";
import { getSupabaseAdmin } from "./database";
import { SUPPLIER_TABLE, SUPPLIER_NAME } from "./constants";
import { getProducts, saveProduct, generateRdId } from "@/lib/store";
import { mapAlzaToProduct } from "./mapper";
import { logger } from "./logger";
import { slugify } from "./utils";
import type { AlzaProduct } from "./types";

// ── Row → AlzaProduct shim ─────────────────────────────────────────────────

/**
 * Convert a SupplierProductRow back into an AlzaProduct for the mapper.
 * The mapper already knows how to produce a clean Product from AlzaProduct.
 */
function rowToAlzaProduct(row: SupplierProductRow): AlzaProduct {
  return {
    supplier: "alza",
    supplierProductId: row.supplier_product_id,
    url: row.supplier_url,
    name: row.name,
    brand: row.brand,
    price: row.price,
    originalPrice: row.original_price,
    currency: row.currency,
    availability: row.availability,
    stockStatus: row.stock_status as AlzaProduct["stockStatus"],
    rating: row.rating,
    reviewCount: row.review_count,
    description: row.description,
    shortDescription: row.short_description,
    ean: row.ean,
    manufacturer: row.manufacturer,
    warranty: row.warranty,
    category: row.category,
    breadcrumbs: row.breadcrumbs,
    images: row.images,
    parameters: row.parameters,
    lastScrapedAt: row.last_scraped_at,
  };
}

// ── Supplier-controlled field update ──────────────────────────────────────

/**
 * Merge supplier-controlled fields into an existing Product.
 * Never touches store-controlled fields that are already set.
 */
function mergeSupplierFields(
  existing: Product,
  alzaProduct: AlzaProduct,
  storedImageUrls: string[],
): Product {
  return {
    ...existing,
    // ── Supplier-controlled: always update ──
    name:             alzaProduct.name,
    brand:            alzaProduct.brand,
    price:            alzaProduct.price,
    supplierPrice:    alzaProduct.price,
    supplierStock:    alzaProduct.stockStatus === "in_stock" ? 1 : 0,
    supplierUrl:      alzaProduct.url,
    supplierProductId: alzaProduct.supplierProductId,
    supplier:         "alza",
    lastSupplierSync: new Date().toISOString(),
    stock:            alzaProduct.stockStatus === "in_stock" ? 1 : 0,
    status:           alzaProduct.stockStatus === "in_stock" ? "available"
                    : alzaProduct.stockStatus === "pre_order" ? "limited"
                    : "sold",
    specifications:   Object.fromEntries(
      alzaProduct.parameters.map(p => [p.name, p.value])
    ),
    // Update images only if no custom images have been set
    images: storedImageUrls.length > 0 ? storedImageUrls : existing.images,

    // ── Store-controlled: preserve existing non-empty values ──
    slug:          existing.slug || slugify(alzaProduct.name),
    tagline:       existing.tagline || alzaProduct.shortDescription.slice(0, 100) || alzaProduct.name,
    description:   existing.description || alzaProduct.description || alzaProduct.shortDescription,
    tags:          existing.tags.length > 0 ? existing.tags : [],
    featured:      existing.featured,
    category:      existing.category,
    year:          existing.year || new Date().getFullYear(),
    movementType:  existing.movementType,
    module:        existing.module,
    grade:         existing.grade,
    rdWatchId:     existing.rdWatchId,
    story:         existing.story,
  };
}

/**
 * Build a brand new Product from supplier data.
 */
async function buildNewProduct(
  alzaProduct: AlzaProduct,
  storedImageUrls: string[],
): Promise<Product> {
  const mapped = mapAlzaToProduct(alzaProduct, storedImageUrls);

  // Generate stable ID from supplier ID (idempotent across runs)
  const id = `alza-${alzaProduct.supplierProductId}`;

  // Auto-assign rdWatchId
  const rdWatchId = await generateRdId(mapped.category);

  return {
    ...mapped,
    id,
    rdWatchId,
    supplier:          "alza",
    supplierProductId: alzaProduct.supplierProductId,
    supplierPrice:     alzaProduct.price,
    supplierStock:     alzaProduct.stockStatus === "in_stock" ? 1 : 0,
    supplierUrl:       alzaProduct.url,
    lastSupplierSync:  new Date().toISOString(),
    createdAt:         new Date().toISOString(),
  };
}

// ── Link supplier_products row back to store ──────────────────────────────

async function linkSupplierRow(supplierRowId: string, storeProductId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from(SUPPLIER_TABLE)
    .update({ store_product_id: storeProductId, updated_at: new Date().toISOString() })
    .eq("id", supplierRowId);
}

// ── Single product sync ────────────────────────────────────────────────────

export interface ProductSyncResult {
  action: "created" | "updated" | "skipped";
  productId: string;
  name: string;
  error?: string;
}

/**
 * Sync a single supplier_products row into the RE:DISTRICT product store.
 * Matches by supplier + supplier_product_id.
 */
export async function syncOneProduct(
  row: SupplierProductRow,
  allStoreProducts: Product[],
): Promise<ProductSyncResult> {
  const alzaProduct = rowToAlzaProduct(row);

  // Extract stored image URLs from the row
  const storedImageUrls = (row.images as Array<{ url: string }>).map(i => i.url);

  // ── Match by supplier + supplierProductId ──────────────────────────────

  const existing = allStoreProducts.find(p =>
    p.supplier === SUPPLIER_NAME &&
    p.supplierProductId === row.supplier_product_id
  ) ?? allStoreProducts.find(p =>
    // Fallback: match by the deterministic alza- prefix ID used on first creation
    p.id === `alza-${row.supplier_product_id}`
  );

  if (existing) {
    const merged = mergeSupplierFields(existing, alzaProduct, storedImageUrls);
    await saveProduct(merged);
    await linkSupplierRow(row.id, merged.id);

    logger.debug(`Sync updated: "${merged.name}" (${merged.id})`);
    return { action: "updated", productId: merged.id, name: merged.name };
  }

  // ── Create new product ─────────────────────────────────────────────────

  const newProduct = await buildNewProduct(alzaProduct, storedImageUrls);
  await saveProduct(newProduct);
  await linkSupplierRow(row.id, newProduct.id);

  logger.debug(`Sync created: "${newProduct.name}" (${newProduct.id})`);
  return { action: "created", productId: newProduct.id, name: newProduct.name };
}

// ── Batch sync: supplier_products → products ──────────────────────────────

/**
 * Read all available supplier_products and sync them into the product store.
 *
 * This is the primary sync engine.
 * Called by importAlzaCategory() after Phase 5.
 *
 * @param categoryUrl - optional filter: only sync rows from this category
 */
export async function syncProducts(categoryUrl?: string): Promise<SyncStats> {
  logger.setPhase("sync");
  logger.info("Sync engine: reading supplier_products from Supabase...");

  const supabase = getSupabaseAdmin();

  // Load supplier rows — optionally scoped to a specific crawled category
  let query = supabase
    .from(SUPPLIER_TABLE)
    .select("*")
    .eq("supplier", SUPPLIER_NAME)
    .eq("is_available", true)
    .order("last_scraped_at", { ascending: false });

  // Filter by category URL scope if provided (match breadcrumb URLs)
  // We can't filter SQL by breadcrumb content easily, so we pull all and filter client-side
  // when categoryUrl is set. For full imports, categoryUrl is undefined — sync everything.

  const { data: rows, error } = await query;

  if (error) {
    logger.error("Sync: failed to read supplier_products", { error: error.message });
    return { storeCreated: 0, storeUpdated: 0, storeSkipped: 0, storeFailed: 0 };
  }

  const supplierRows = (rows ?? []) as SupplierProductRow[];
  logger.info(`Sync engine: ${supplierRows.length} supplier rows to process`);

  if (supplierRows.length === 0) {
    return { storeCreated: 0, storeUpdated: 0, storeSkipped: 0, storeFailed: 0 };
  }

  // Load all store products ONCE (avoid N+1 reads from Upstash)
  const allStoreProducts = await getProducts();
  logger.info(`Sync engine: ${allStoreProducts.length} products currently in store`);

  let storeCreated = 0;
  let storeUpdated = 0;
  let storeSkipped = 0;
  let storeFailed = 0;

  for (const row of supplierRows) {
    // Optional: if categoryUrl provided, check breadcrumb URL match
    if (categoryUrl) {
      const breadcrumbUrls: string[] = (row.breadcrumbs as Array<{ url: string }>).map(b => b.url);
      const matchesCategory = breadcrumbUrls.some(u => u.includes(categoryUrl.replace("https://www.alza.sk", "")));
      const urlPathMatch = row.supplier_url.includes(row.supplier_product_id);
      // If we can't confirm category match from breadcrumbs, still sync (safe default)
      if (breadcrumbUrls.length > 0 && !matchesCategory && !urlPathMatch) {
        storeSkipped++;
        continue;
      }
    }

    try {
      const result = await syncOneProduct(row, allStoreProducts);
      if (result.action === "created") {
        storeCreated++;
        // Add new product to our in-memory list so subsequent iterations can see it
        const newProds = await getProducts();
        allStoreProducts.push(...newProds.filter(p => p.id === result.productId));
      } else if (result.action === "updated") {
        storeUpdated++;
      } else {
        storeSkipped++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Sync failed for supplier_product ${row.supplier_product_id}`, { error: msg });
      storeFailed++;
    }
  }

  logger.success("Sync engine complete", { storeCreated, storeUpdated, storeSkipped, storeFailed });

  return { storeCreated, storeUpdated, storeSkipped, storeFailed };
}
