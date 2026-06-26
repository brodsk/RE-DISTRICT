// lib/types.ts

/* ─────────────────────────────
   PRODUCTS
──────────────────────────── */

export type ProductCategory = "custom" | "restored" | "curated";
export type ProductStatus = "available" | "reserved" | "sold" | "limited" | "concept";
export type ProductGrade = "A" | "B" | "C";

export const CATEGORY_PREFIX: Record<ProductCategory, string> = {
  custom: "CST",
  restored: "RST",
  curated: "CRT",
};

export interface ProductCondition {
  case: string;
  glass: string;
  strap: string;
}

export interface Product {
  id: string;
  rdWatchId?: string;
  name: string;
  brand: string;
  slug: string;
  tagline: string;
  description: string;
  story?: string;
  price: number;
  images: string[];
  status: ProductStatus;
  category: ProductCategory;
  tags: string[];
  stock: number;
  featured: boolean;
  year: number;
  specifications: Record<string, string>;

  grade?: ProductGrade;
  serviceSummary?: string;
  module?: string;
  movementType?: string;
  condition?: ProductCondition;

  createdAt?: string;
}

/* ─────────────────────────────
   CART / CHECKOUT
──────────────────────────── */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  slug: string;
}

export interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

/* ─────────────────────────────
   SHIPPING
──────────────────────────── */

export type DeliveryMethod = "home" | "pickup";

export interface ShippingOption {
  id: string;
  label: string;
  country: string;
  price: number;
  days: string;
  carrier: string;
  deliveryMethod: DeliveryMethod;
}

/* ─────────────────────────────
   ORDERS (SHOPIFY v3 CORE FIX)
──────────────────────────── */

export type OrderStatus =
  | "checkout_created"
  | "unpaid"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderData {
  name: string;
  email: string;
  phone: string;

  country: string;
  city: string;
  address: string;

  shippingId: string;
  deliveryMethod: DeliveryMethod;

  pickupPointId?: string;
  pickupPointName?: string;
  pickupPointAddress?: string;
}

export interface SavedOrder {
  id: string;
  stripeSessionId: string;

  status: OrderStatus;
  createdAt: string;

  items: CheckoutItem[];

  total: number;
  shippingPrice: number;
  grandTotal: number;

  customerName: string;
  customerEmail: string;
  customerPhone: string;

  country: string;
  city: string;
  address: string;

  shippingId: string;
  deliveryMethod: DeliveryMethod;

  pickupPointId?: string;
  pickupPointName?: string;
  pickupPointAddress?: string;
}

/* ─────────────────────────────
   PAGE BUILDER
──────────────────────────── */

export type BlockType =
  | "hero"
  | "manifesto"
  | "productGrid"
  | "productHighlight"
  | "gallery"
  | "process"
  | "collection"
  | "textBlock"
  | "cta";

export interface PageBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export interface PageConfig {
  blocks: PageBlock[];
}

export type PagesConfig = Record<string, PageConfig>;
