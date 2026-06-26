// lib/types.ts

export type ProductCategory = "custom" | "restored" | "curated";
export type ProductStatus   = "available" | "reserved" | "sold" | "limited" | "concept";
export type ProductGrade    = "A" | "B" | "C";

// Category prefixes for RD ID system
export const CATEGORY_PREFIX: Record<ProductCategory, string> = {
  custom:   "CST",
  restored: "RST",
  curated:  "CRT",
};

export interface ProductCondition {
  case:   string;  // e.g. "Excellent – minor scratches"
  glass:  string;  // e.g. "Mint – no scratches"
  strap:  string;  // e.g. "Good – light wear"
}

export interface Product {
  id:             string;
  rdWatchId?:     string;       // RD-CST-0001 / RD-RST-0001 / RD-CRT-0001
  name:           string;
  brand:          string;
  slug:           string;
  tagline:        string;
  description:    string;
  story?:         string;
  price:          number;
  images:         string[];
  status:         ProductStatus;
  category:       ProductCategory;
  tags:           string[];
  stock:          number;
  featured:       boolean;
  year:           number;
  specifications: Record<string, string>;
  // Passport fields
  grade?:          ProductGrade;
  serviceSummary?: string;
  module?:         string;      // e.g. "Casio 3157"
  movementType?:   string;      // e.g. "Quartz LCD"
  condition?:      ProductCondition;
  createdAt?:      string;
}

export interface CartItem {
  productId: string;
  name:      string;
  price:     number;
  image?:    string;
  quantity:  number;
  slug:      string;
}

export interface CheckoutItem {
  productId: string;
  name:      string;
  price:     number;
  image?:    string;
  quantity:  number;
}

export interface ShippingOption {
  id:             string;
  label:          string;
  country:        string;
  price:          number;
  days:           string;
  carrier:        string;
  deliveryMethod: DeliveryMethod;
}

export type DeliveryMethod = "home" | "pickup";

export interface OrderData {
  name:                string;
  email:               string;
  phone:               string;
  country:             string;
  city:                string;
  address:             string;
  shippingId:          string;
  deliveryMethod:      DeliveryMethod;
  pickupPointId?:      string;
  pickupPointName?:    string;
  pickupPointAddress?: string;
}

export interface SavedOrder {
  id:                  string;
  stripeSessionId:     string;
  export type OrderStatus =
  | "checkout_created"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface SavedOrder {
  id: string;
  stripeSessionId: string;
  status: OrderStatus;
  createdAt: string;

  items: any[];

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
  deliveryMethod: string;

  pickupPointId?: string;
  pickupPointName?: string;
  pickupPointAddress?: string;
}
  createdAt:           string;
  items:               CheckoutItem[];
  total:               number;
  shippingPrice:       number;
  grandTotal:          number;
  customerName:        string;
  customerEmail:       string;
  customerPhone:       string;
  country:             string;
  city:                string;
  address:             string;
  shippingId:          string;
  deliveryMethod:      DeliveryMethod;
  pickupPointId?:      string;
  pickupPointName?:    string;
  pickupPointAddress?: string;
}

// Block builder types
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
  id:   string;
  type: BlockType;
  data: Record<string, unknown>;
}

export interface PageConfig {
  blocks: PageBlock[];
}

export type PagesConfig = Record<string, PageConfig>;
