/**
 * RE:DISTRICT — Alza Importer Constants
 */

export const ALZA_BASE_URL = "https://www.alza.sk";

export const SUPPLIER_NAME = "alza" as const;

// Supabase Storage bucket for supplier images
export const SUPPLIER_IMAGE_BUCKET = "supplier-images";

// Supabase table for raw supplier products
export const SUPPLIER_TABLE = "supplier_products";

// Concurrency limits
export const MAX_CONCURRENT_PRODUCT_PAGES = 2;
export const MAX_CONCURRENT_IMAGE_DOWNLOADS = 3;

// Retry settings
export const MAX_RETRIES = 3;
export const RETRY_BASE_DELAY_MS = 1_000;
export const RETRY_MAX_DELAY_MS = 15_000;

// Throttling: random delay range between requests (ms)
export const REQUEST_DELAY_MIN_MS = 800;
export const REQUEST_DELAY_MAX_MS = 2_500;

// Browser navigation timeout
export const PAGE_TIMEOUT_MS = 30_000;

// Minimum price to consider a product valid (filter out €0 listings)
export const MIN_VALID_PRICE = 0.01;

// Playwright user agent
export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

// Alza product URL marker (helps identify product pages vs category)
export const PRODUCT_URL_MARKER = "/p/";

// Selectors used for crawling (multiple fallbacks for resilience)
export const SELECTORS = {
  // Product listing items on category page
  productItem: [
    "div.browsingItem",
    "div[data-testid='product-item']",
    ".product-box",
    "article.box",
  ],

  // Product link inside listing item
  productLink: [
    "a.pc[href]",
    "a[data-testid='product-title'][href]",
    "h3 a[href]",
    "a.name[href]",
  ],

  // Pagination: next page or page numbers
  paginationNext: [
    "a.nextlink[href]",
    "a[data-testid='pagination-next'][href]",
    ".pagination a.next[href]",
  ],
  paginationPages: [
    "span.pagescnt",
    "span[data-testid='pages-count']",
    ".pagination .last a",
  ],

  // Product page: name
  productName: [
    "h1#h1Nazev",
    "h1[data-testid='product-name']",
    "h1.nameHeader",
    "h1",
  ],

  // Product page: price
  productPrice: [
    "span.price-box__price",
    "span[data-testid='product-price']",
    ".pd-price .price",
    "span.price",
  ],

  // Product page: original price (before discount)
  productOriginalPrice: [
    "span.price-box__price--crossed",
    "span[data-testid='original-price']",
    ".crossedPrice",
    "span.oldPrice",
  ],

  // Product page: availability text
  productAvailability: [
    "span.avl-text",
    "span[data-testid='availability-text']",
    ".availability span",
    ".availText",
  ],

  // Product page: short description
  productShortDesc: [
    "div.pb-perex",
    "div[data-testid='short-description']",
    ".pd-perex",
    ".shortDesc",
  ],

  // Product page: full description
  productDescription: [
    "div#detailText",
    "div[data-testid='product-description']",
    ".pd-desc",
    "#popis",
  ],

  // Product page: gallery images
  productImages: [
    "div#pd-gallery img[src]",
    "div.gallery img[src]",
    "div[data-testid='product-gallery'] img[src]",
    ".pd-img-section img[src]",
  ],

  // Product page: parameters table
  parametersTable: [
    "table.params",
    "table[data-testid='parameters-table']",
    "#parametry table",
    ".specTable",
  ],

  // Product page: breadcrumbs
  breadcrumbs: [
    "div#breadcrumbs a[href]",
    "nav[aria-label='breadcrumb'] a[href]",
    ".breadcrumb a[href]",
  ],

  // Product page: rating
  productRating: [
    "span.ratingValue",
    "span[data-testid='rating-value']",
    ".rating-value",
    "[itemprop='ratingValue']",
  ],

  // Product page: review count
  productReviewCount: [
    "span.ratingCount",
    "span[data-testid='review-count']",
    ".cnt-reviews",
    "[itemprop='reviewCount']",
  ],

  // Product page: EAN
  productEan: [
    "span[data-testid='ean']",
    ".ean-code",
    "td:contains('EAN') + td",
  ],
} as const;
