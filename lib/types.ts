// lib/types.ts

export type ProductCategory = "custom" | "restored" | "curated";
export type ProductStatus   = "available" | "limited" | "sold" | "concept";

export interface Product {
  id:             string;
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
  createdAt?:     string;
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
  id:       string;
  label:    string;
  country:  string;
  price:    number;
  days:     string;
  carrier:  string;
}

export interface OrderData {
  name:          string;
  email:         string;
  phone:         string;
  country:       string;
  city:          string;
  address:       string;
  shippingId:    string;
  pickupPointId?: string;
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
