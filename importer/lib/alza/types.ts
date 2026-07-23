/**
 * RE:DISTRICT — Alza Supplier Types
 * Strict TypeScript models for supplier data, independent of store models.
 */

// ── Alza product as scraped ────────────────────────────────────────────────

export interface AlzaImage {
  url: string;
  alt: string;
  position: number;
}

export interface AlzaParameter {
  name: string;
  value: string;
  group: string;
}

export interface AlzaBreadcrumb {
  name: string;
  url: string;
}

export type AlzaStockStatus =
  | "in_stock"
  | "out_of_stock"
  | "pre_order"
  | "discontinued"
  | "unknown";

export interface AlzaProduct {
  supplier: "alza";
  supplierProductId: string;
  url: string;

  name: string;
  brand: string;

  price: number;
  originalPrice: number | null;
  currency: string;

  availability: string;
  stockStatus: AlzaStockStatus;

  rating: number | null;
  reviewCount: number;

  description: string;
  shortDescription: string;

  ean: string | null;
  manufacturer: string;
  warranty: string | null;

  category: string;
  breadcrumbs: AlzaBreadcrumb[];

  images: AlzaImage[];
  parameters: AlzaParameter[];

  lastScrapedAt: string;
}

// ── Scraping internals ─────────────────────────────────────────────────────

export interface AlzaProductStub {
  url: string;
  name: string;
  supplierProductId: string;
}

export interface CategoryCrawlResult {
  categoryUrl: string;
  totalPages: number;
  productStubs: AlzaProductStub[];
}

// ── Import report ──────────────────────────────────────────────────────────

export interface SyncStats {
  storeCreated: number;
  storeUpdated: number;
  storeSkipped: number;
  storeFailed: number;
}

export interface ImportReport {
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  categoryUrl: string;
  pagesFound: number;
  pagesCrawled: number;
  // supplier_products stats
  productsFound: number;
  productsCreated: number;
  productsUpdated: number;
  productsUnavailable: number;
  productsFailed: number;
  imagesDownloaded: number;
  imagesSkipped: number;
  // products (store) sync stats
  sync: SyncStats;
  errors: ImportError[];
}

export interface ImportError {
  url: string;
  message: string;
  phase: "crawl" | "scrape" | "image" | "database";
}

// ── Supplier DB row ────────────────────────────────────────────────────────

export interface SupplierProductRow {
  id: string;
  supplier: string;
  supplier_product_id: string;
  supplier_url: string;
  name: string;
  brand: string;
  price: number;
  original_price: number | null;
  currency: string;
  availability: string;
  stock_status: string;
  rating: number | null;
  review_count: number;
  description: string;
  short_description: string;
  ean: string | null;
  manufacturer: string;
  warranty: string | null;
  category: string;
  breadcrumbs: AlzaBreadcrumb[];
  images: AlzaImage[];
  parameters: AlzaParameter[];
  store_product_id: string | null;
  is_available: boolean;
  last_scraped_at: string;
  created_at: string;
  updated_at: string;
}
