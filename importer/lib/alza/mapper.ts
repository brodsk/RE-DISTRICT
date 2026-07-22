/**
 * RE:DISTRICT — Alza Product Mapper
 * Maps AlzaProduct (supplier model) → RE:DISTRICT Product (store model).
 *
 * The frontend only ever sees RE:DISTRICT Product.
 * Supplier-specific fields stay in supplier_products table only.
 *
 * Mapping rules:
 * - Supplier controls: price, images (from storage), availability
 * - Store controls: slug, tags, featured, category assignment, descriptions (can be overridden)
 * - Never overwrite: manually edited store fields
 */

import type { Product } from "@/lib/types";
import type { AlzaProduct } from "./types";
import { slugify } from "./utils";

// ── Category mapping ───────────────────────────────────────────────────────

// Map Alza category strings to RE:DISTRICT product categories
const ALZA_CATEGORY_MAP: Record<string, Product["category"]> = {
  "casio":     "curated",
  "seiko":     "curated",
  "citizen":   "curated",
  "orient":    "curated",
  "watches":   "curated",
  "hodinky":   "curated",
  "digital":   "curated",
  "náramkové": "curated",
};

function mapCategory(alzaCategory: string, brand: string): Product["category"] {
  const lowerCategory = alzaCategory.toLowerCase();
  const lowerBrand = brand.toLowerCase();

  for (const [key, value] of Object.entries(ALZA_CATEGORY_MAP)) {
    if (lowerCategory.includes(key) || lowerBrand.includes(key)) {
      return value;
    }
  }

  return "curated"; // Default for Alza imports
}

// ── Status mapping ─────────────────────────────────────────────────────────

function mapStatus(stockStatus: AlzaProduct["stockStatus"]): Product["status"] {
  switch (stockStatus) {
    case "in_stock":    return "available";
    case "pre_order":   return "limited";
    case "out_of_stock": return "sold"; // Sold out
    case "discontinued": return "sold";
    case "unknown":     return "available";
  }
}

// ── Tag generation ─────────────────────────────────────────────────────────

function generateTags(product: AlzaProduct): string[] {
  const tags: string[] = [];

  // Brand as tag
  if (product.brand) tags.push(product.brand.toLowerCase());

  // Category breadcrumbs as tags
  for (const crumb of product.breadcrumbs.slice(1)) {
    const tag = slugify(crumb.name);
    if (tag && tag.length > 2 && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  // Derive tags from name words (meaningful ones)
  const skipWords = new Set(["the", "and", "with", "for", "pre", "na", "do", "in"]);
  const nameWords = product.name.toLowerCase().split(/[\s\-_]+/);
  for (const word of nameWords) {
    if (word.length > 3 && !skipWords.has(word) && !tags.includes(word)) {
      tags.push(word);
    }
  }

  // Watch-specific tags from parameters
  for (const param of product.parameters) {
    const name = param.name.toLowerCase();
    if (name.includes("movement") || name.includes("mechanizmus")) {
      tags.push(slugify(param.value));
    }
    if (name.includes("material") || name.includes("materiál")) {
      tags.push(slugify(param.value));
    }
  }

  // Stock status tag
  if (product.stockStatus === "pre_order") tags.push("pre-order");
  if (product.stockStatus === "out_of_stock") tags.push("out-of-stock");

  return [...new Set(tags)].filter(t => t.length > 0).slice(0, 20);
}

// ── Main mapper ────────────────────────────────────────────────────────────

/**
 * Map an AlzaProduct to a RE:DISTRICT Product.
 *
 * @param alzaProduct - Raw supplier product
 * @param storedImageUrls - Final Supabase Storage URLs for images
 * @param existingProduct - Existing store product (if updating)
 * @returns RE:DISTRICT Product ready for upsert
 */
export function mapAlzaToProduct(
  alzaProduct: AlzaProduct,
  storedImageUrls: string[],
  existingProduct?: Partial<Product>,
): Product {
  const slug = existingProduct?.slug ?? slugify(alzaProduct.name);
  const category = existingProduct?.category ?? mapCategory(alzaProduct.category, alzaProduct.brand);
  const status = mapStatus(alzaProduct.stockStatus);
  const tags = existingProduct?.tags ?? generateTags(alzaProduct);

  // Build specifications from Alza parameters
  const specifications: Record<string, string> = {};
  for (const param of alzaProduct.parameters) {
    specifications[param.name] = param.value;
  }

  // Determine year from parameters or current year
  const yearParam = alzaProduct.parameters.find(p =>
    p.name.toLowerCase().includes("rok") ||
    p.name.toLowerCase().includes("year") ||
    p.name.toLowerCase().includes("model year")
  );
  const year = yearParam ? parseInt(yearParam.value, 10) || new Date().getFullYear()
    : existingProduct?.year ?? new Date().getFullYear();

  // Determine tagline
  const tagline = existingProduct?.tagline ??
    (alzaProduct.shortDescription
      ? alzaProduct.shortDescription.slice(0, 100)
      : `${alzaProduct.brand} — ${alzaProduct.name}`);

  // Determine description (store's custom description wins if present)
  const description = (existingProduct?.description && existingProduct.description !== alzaProduct.description)
    ? existingProduct.description
    : alzaProduct.description || alzaProduct.shortDescription;

  // Generate stable ID
  const id = existingProduct?.id ?? `alza-${alzaProduct.supplierProductId}`;

  const product: Product = {
    id,
    name: alzaProduct.name,
    brand: alzaProduct.brand,
    slug,
    tagline,
    description,
    price: alzaProduct.price,
    images: storedImageUrls,
    status,
    category,
    tags,
    stock: alzaProduct.stockStatus === "in_stock" ? 1 : 0,
    featured: existingProduct?.featured ?? false,
    year,
    specifications,

    // Watch-specific fields (from parameters if available)
    movementType: existingProduct?.movementType ?? extractMovementType(alzaProduct),
    module: existingProduct?.module ?? extractModule(alzaProduct),

    createdAt: existingProduct?.createdAt ?? new Date().toISOString(),
  };

  return product;
}

// ── Field extractors ───────────────────────────────────────────────────────

function extractMovementType(product: AlzaProduct): string | undefined {
  const param = product.parameters.find(p => {
    const n = p.name.toLowerCase();
    return n.includes("movement") || n.includes("mechanizmus") || n.includes("pohon");
  });
  return param?.value;
}

function extractModule(product: AlzaProduct): string | undefined {
  const param = product.parameters.find(p => {
    const n = p.name.toLowerCase();
    return n.includes("modul") || n.includes("module") || n.includes("model");
  });
  return param?.value;
}
