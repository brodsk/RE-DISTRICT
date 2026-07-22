/**
 * RE:DISTRICT — Alza HTML Parser
 * Parses product page HTML using Cheerio.
 * NO Playwright selectors here — pure DOM parsing.
 */

import * as cheerio from "cheerio";
import type { AlzaProduct, AlzaImage, AlzaParameter, AlzaBreadcrumb, AlzaStockStatus } from "./types";
import { ALZA_BASE_URL, SELECTORS, SUPPLIER_NAME } from "./constants";
import { cleanText, parsePrice, parseNumber, normalizeAlzaUrl, extractSupplierProductId, getFileExtension } from "./utils";
import { logger } from "./logger";

// ── Individual field parsers ───────────────────────────────────────────────

function parseName($: cheerio.CheerioAPI): string {
  for (const sel of SELECTORS.productName) {
    const text = cleanText($(sel).first().text());
    if (text) return text;
  }
  return "";
}

function parsePriceField($: cheerio.CheerioAPI): { price: number; originalPrice: number | null; currency: string } {
  let price = 0;
  let originalPrice: number | null = null;
  let currency = "EUR";

  for (const sel of SELECTORS.productPrice) {
    const el = $(sel).first();
    if (el.length) {
      const raw = cleanText(el.text());
      const parsed = parsePrice(raw);
      if (parsed !== null && parsed > 0) {
        price = parsed;
        // Detect currency
        if (raw.includes("€") || raw.includes("EUR")) currency = "EUR";
        else if (raw.includes("Kč") || raw.includes("CZK")) currency = "CZK";
        break;
      }
    }
  }

  for (const sel of SELECTORS.productOriginalPrice) {
    const el = $(sel).first();
    if (el.length) {
      const raw = cleanText(el.text());
      const parsed = parsePrice(raw);
      if (parsed !== null && parsed > 0) {
        originalPrice = parsed;
        break;
      }
    }
  }

  return { price, originalPrice, currency };
}

function parseAvailability($: cheerio.CheerioAPI): { availability: string; stockStatus: AlzaStockStatus } {
  let availability = "";

  for (const sel of SELECTORS.productAvailability) {
    const text = cleanText($(sel).first().text());
    if (text) {
      availability = text;
      break;
    }
  }

  if (!availability) {
    // Try common availability indicators
    const addToCart = $("button[id*='buy'], button[data-testid*='add-to-cart'], #btnBuy").length > 0;
    availability = addToCart ? "Skladom" : "Nedostupné";
  }

  const lower = availability.toLowerCase();
  let stockStatus: AlzaStockStatus = "unknown";

  if (lower.includes("skladom") || lower.includes("na sklade") || lower.includes("in stock")) {
    stockStatus = "in_stock";
  } else if (lower.includes("predpredaj") || lower.includes("pre-order") || lower.includes("predobjednávka")) {
    stockStatus = "pre_order";
  } else if (lower.includes("vypredaný") || lower.includes("nedostupný") || lower.includes("out of stock")) {
    stockStatus = "out_of_stock";
  } else if (lower.includes("ukončen") || lower.includes("discontinued")) {
    stockStatus = "discontinued";
  } else if (lower.includes("dostupn")) {
    stockStatus = "in_stock";
  }

  return { availability, stockStatus };
}

function parseImages($: cheerio.CheerioAPI): AlzaImage[] {
  const images: AlzaImage[] = [];
  const seen = new Set<string>();

  // Try each image selector
  for (const sel of SELECTORS.productImages) {
    $(sel).each((i, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
      const alt = cleanText($(el).attr("alt"));

      if (!src) return;

      // Skip tiny thumbnails, spacers, icons
      if (src.includes("spacer") || src.includes("1x1") || src.includes("pixel")) return;
      if (src.endsWith(".svg")) return;

      const absoluteUrl = normalizeAlzaUrl(src, ALZA_BASE_URL);

      // Upgrade to larger image if URL contains size params
      const largeUrl = upgradeThumbnailUrl(absoluteUrl);

      if (seen.has(largeUrl)) return;
      seen.add(largeUrl);

      images.push({ url: largeUrl, alt: alt || "", position: images.length });
    });

    if (images.length > 0) break;
  }

  // Also look for data-zoom-image or data-image attributes
  $("[data-zoom-image], [data-full-image], [data-large-image]").each((_, el) => {
    const src = $(el).attr("data-zoom-image") || $(el).attr("data-full-image") || $(el).attr("data-large-image");
    if (!src) return;
    const abs = normalizeAlzaUrl(src, ALZA_BASE_URL);
    if (!seen.has(abs)) {
      seen.add(abs);
      images.push({ url: abs, alt: "", position: images.length });
    }
  });

  return images;
}

function upgradeThumbnailUrl(url: string): string {
  // Alza uses size params like ?width=200 — upgrade to larger
  try {
    const u = new URL(url);
    if (u.searchParams.has("width")) u.searchParams.set("width", "800");
    if (u.searchParams.has("height")) u.searchParams.set("height", "800");
    return u.toString();
  } catch {
    return url;
  }
}

function parseParameters($: cheerio.CheerioAPI): AlzaParameter[] {
  const params: AlzaParameter[] = [];

  for (const tableSel of SELECTORS.parametersTable) {
    const table = $(tableSel).first();
    if (!table.length) continue;

    let currentGroup = "General";

    table.find("tr, .param-row").each((_, row) => {
      const cells = $(row).find("td, th");

      // Group heading row
      if (cells.length === 1) {
        const text = cleanText($(row).text());
        if (text) currentGroup = text;
        return;
      }

      if (cells.length >= 2) {
        const name = cleanText(cells.eq(0).text());
        const value = cleanText(cells.eq(1).text());
        if (name && value) {
          params.push({ name, value, group: currentGroup });
        }
      }
    });

    if (params.length > 0) break;
  }

  // Fallback: look for definition lists
  if (params.length === 0) {
    $("dl.params, .spec-list dl, .pd-params dl").each((_, dl) => {
      const terms = $(dl).find("dt");
      const defs = $(dl).find("dd");

      terms.each((i, dt) => {
        const name = cleanText($(dt).text());
        const value = cleanText(defs.eq(i).text());
        if (name && value) {
          params.push({ name, value, group: "General" });
        }
      });
    });
  }

  return params;
}

function parseBreadcrumbs($: cheerio.CheerioAPI): AlzaBreadcrumb[] {
  const crumbs: AlzaBreadcrumb[] = [];

  for (const sel of SELECTORS.breadcrumbs) {
    $(sel).each((_, el) => {
      const href = $(el).attr("href");
      const name = cleanText($(el).text());
      if (name && href && !name.toLowerCase().includes("alza")) {
        crumbs.push({
          name,
          url: normalizeAlzaUrl(href, ALZA_BASE_URL),
        });
      }
    });

    if (crumbs.length > 0) break;
  }

  return crumbs;
}

function parseRating($: cheerio.CheerioAPI): { rating: number | null; reviewCount: number } {
  let rating: number | null = null;
  let reviewCount = 0;

  for (const sel of SELECTORS.productRating) {
    const text = cleanText($(sel).first().text());
    const num = parseNumber(text);
    if (num !== null && num >= 0 && num <= 5) {
      rating = num;
      break;
    }
  }

  for (const sel of SELECTORS.productReviewCount) {
    const text = cleanText($(sel).first().text());
    const num = parseNumber(text.replace(/[^\d]/g, ""));
    if (num !== null && num >= 0) {
      reviewCount = Math.round(num);
      break;
    }
  }

  return { rating, reviewCount };
}

function parseBrand($: cheerio.CheerioAPI, name: string): string {
  // Try brand-specific elements
  const brandEl = $("[data-testid='brand-name'], .brand-name, [itemprop='brand'] [itemprop='name'], .pd-brand a").first();
  if (brandEl.length) return cleanText(brandEl.text());

  // Try Open Graph
  const ogBrand = $("meta[property='product:brand']").attr("content");
  if (ogBrand) return cleanText(ogBrand);

  // Infer from first word of product name
  const firstWord = name.split(" ")[0];
  if (firstWord && firstWord.length > 1) return firstWord;

  return "";
}

function parseEan($: cheerio.CheerioAPI): string | null {
  for (const sel of SELECTORS.productEan) {
    const el = $(sel).first();
    if (el.length) {
      const text = cleanText(el.text());
      const eanMatch = text.match(/\d{8,14}/);
      if (eanMatch) return eanMatch[0];
    }
  }

  // Search all text for EAN pattern
  const fullText = $("body").text();
  const eanInText = fullText.match(/EAN[:\s]+(\d{8,14})/i);
  if (eanInText) return eanInText[1];

  return null;
}

function parseWarranty($: cheerio.CheerioAPI): string | null {
  const warrantyEl = $("[data-testid='warranty'], .warranty-info, td:contains('Záruka') + td, .warrantyInfo").first();
  if (warrantyEl.length) return cleanText(warrantyEl.text()) || null;

  // Search params for warranty
  const paramRow = $("td, th").filter((_, el) => {
    return $(el).text().toLowerCase().includes("záruka") || $(el).text().toLowerCase().includes("warranty");
  }).first().next();

  if (paramRow.length) return cleanText(paramRow.text()) || null;

  return null;
}

function parseDescription($: cheerio.CheerioAPI): string {
  for (const sel of SELECTORS.productDescription) {
    const el = $(sel).first();
    if (el.length) {
      const text = cleanText(el.text());
      if (text.length > 20) return text;
    }
  }
  return "";
}

function parseShortDescription($: cheerio.CheerioAPI): string {
  for (const sel of SELECTORS.productShortDesc) {
    const el = $(sel).first();
    if (el.length) {
      const text = cleanText(el.text());
      if (text.length > 5) return text;
    }
  }
  return "";
}

function parseCategory($: cheerio.CheerioAPI, breadcrumbs: AlzaBreadcrumb[]): string {
  // Use second-to-last breadcrumb as category
  if (breadcrumbs.length >= 2) {
    return breadcrumbs[breadcrumbs.length - 2].name;
  }
  if (breadcrumbs.length === 1) {
    return breadcrumbs[0].name;
  }

  // Fallback: Open Graph category
  const og = $("meta[property='product:category']").attr("content");
  if (og) return cleanText(og);

  return "Watches";
}

// ── Main parser ────────────────────────────────────────────────────────────

/**
 * Parse a complete Alza product page HTML into an AlzaProduct.
 * Returns null if the page doesn't look like a valid product.
 */
export function parseProductPage(html: string, url: string): AlzaProduct | null {
  const $ = cheerio.load(html);

  const name = parseName($);
  if (!name) {
    logger.warn(`Could not parse product name from: ${url}`);
    return null;
  }

  const { price, originalPrice, currency } = parsePriceField($);
  if (price <= 0) {
    logger.warn(`Invalid price (${price}) for: ${url}`);
  }

  const { availability, stockStatus } = parseAvailability($);
  const brand = parseBrand($, name);
  const images = parseImages($);
  const parameters = parseParameters($);
  const breadcrumbs = parseBreadcrumbs($);
  const { rating, reviewCount } = parseRating($);
  const description = parseDescription($);
  const shortDescription = parseShortDescription($);
  const ean = parseEan($);
  const warranty = parseWarranty($);
  const category = parseCategory($, breadcrumbs);
  const supplierProductId = extractSupplierProductId(url);

  // Manufacturer from params or brand
  const manufacturerParam = parameters.find(p =>
    p.name.toLowerCase().includes("výrobca") ||
    p.name.toLowerCase().includes("manufacturer") ||
    p.name.toLowerCase().includes("značka")
  );
  const manufacturer = manufacturerParam?.value ?? brand;

  const product: AlzaProduct = {
    supplier: SUPPLIER_NAME,
    supplierProductId,
    url,
    name,
    brand,
    price,
    originalPrice,
    currency,
    availability,
    stockStatus,
    rating,
    reviewCount,
    description,
    shortDescription,
    ean,
    manufacturer,
    warranty,
    category,
    breadcrumbs,
    images,
    parameters,
    lastScrapedAt: new Date().toISOString(),
  };

  logger.debug(`Parsed product: ${name}`, {
    price,
    images: images.length,
    params: parameters.length,
  });

  return product;
}
