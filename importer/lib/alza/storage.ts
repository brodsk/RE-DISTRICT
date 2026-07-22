/**
 * RE:DISTRICT — Alza Storage Sync
 * Synchronizes imported supplier products with the RE:DISTRICT product store.
 * Handles the supplier_products → products bridge.
 *
 * Supplier-controlled fields (price, images, availability) are always updated.
 * Store-controlled fields (slug, tags, featured, custom description) are preserved.
 */

import type { AlzaProduct } from "./types";
import type { Product } from "@/lib/types";
import { getProducts, saveProduct } from "@/lib/store";
import { mapAlzaToProduct } from "./mapper";
import { logger } from "./logger";

// ── Sync single product ────────────────────────────────────────────────────

export interface SyncResult {
  productId: string;
  action: "created" | "updated" | "skipped";
  name: string;
}

/**
 * Synchronize a single Alza product into the RE:DISTRICT product store.
 * Updates supplier-controlled fields; preserves store-controlled fields.
 */
export async function syncProductToStore(
  alzaProduct: AlzaProduct,
  storedImageUrls: string[],
): Promise<SyncResult> {
  const existingProducts = await getProducts();
  const alzaId = `alza-${alzaProduct.supplierProductId}`;

  // Find by Alza-derived ID or by name match
  const existing = existingProducts.find(p =>
    p.id === alzaId ||
    p.name.toLowerCase() === alzaProduct.name.toLowerCase()
  );

  const mappedProduct = mapAlzaToProduct(alzaProduct, storedImageUrls, existing);

  if (existing) {
    // Merge: keep store-controlled fields, update supplier-controlled fields
    const updated: Product = {
      ...existing,               // All existing store fields
      // Supplier-controlled: always overwrite
      name:           mappedProduct.name,
      brand:          mappedProduct.brand,
      price:          mappedProduct.price,
      images:         storedImageUrls.length > 0 ? storedImageUrls : existing.images,
      status:         mappedProduct.status,
      stock:          mappedProduct.stock,
      specifications: mappedProduct.specifications,
      // Store-controlled: preserve existing unless blank
      slug:           existing.slug || mappedProduct.slug,
      tagline:        existing.tagline || mappedProduct.tagline,
      description:    existing.description || mappedProduct.description,
      tags:           existing.tags.length > 0 ? existing.tags : mappedProduct.tags,
      featured:       existing.featured,
      category:       existing.category,
      year:           existing.year || mappedProduct.year,
      movementType:   existing.movementType || mappedProduct.movementType,
      module:         existing.module || mappedProduct.module,
    };

    await saveProduct(updated);
    logger.debug(`Store sync: updated "${existing.name}"`);
    return { productId: existing.id, action: "updated", name: existing.name };
  } else {
    // New product from Alza
    await saveProduct(mappedProduct);
    logger.debug(`Store sync: created "${mappedProduct.name}"`);
    return { productId: mappedProduct.id, action: "created", name: mappedProduct.name };
  }
}

/**
 * Sync multiple products to the store in sequence.
 * Returns summary of actions taken.
 */
export async function syncProductsToStore(
  products: Array<{ alzaProduct: AlzaProduct; imageUrls: string[] }>,
): Promise<{ created: number; updated: number; failed: number }> {
  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const { alzaProduct, imageUrls } of products) {
    try {
      const result = await syncProductToStore(alzaProduct, imageUrls);
      if (result.action === "created") created++;
      else if (result.action === "updated") updated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Store sync failed for ${alzaProduct.name}`, { error: msg });
      failed++;
    }
  }

  return { created, updated, failed };
}
