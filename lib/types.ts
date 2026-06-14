// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductStatus = "available" | "sold" | "limited" | "concept";
export type ProductCategory = "custom" | "restored" | "curated";

export interface ProductSpec {
  case?:           string;
  display?:        string;
  movement?:       string;
  battery?:        string;
  waterResistance?: string;
  strap?:          string;
  [key: string]:   string | undefined;
}

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
  specifications: ProductSpec;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  quantity:  number;
  // snapshot at add-time (price can't change mid-cart)
  name:      string;
  price:     number;
  image:     string;
  slug:      string;
}

// ─── Page Blocks ─────────────────────────────────────────────────────────────

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

export interface BlockBase {
  id:   string;
  type: BlockType;
}

export interface HeroBlock extends BlockBase {
  type: "hero";
  data: { headline: string; subline?: string; cta?: string; ctaHref?: string };
}

export interface ManifestoBlock extends BlockBase {
  type: "manifesto";
  data: { text: string };
}

export interface ProductGridBlock extends BlockBase {
  type: "productGrid";
  data: { title?: string; productIds?: string[]; showAll?: boolean };
}

export interface ProductHighlightBlock extends BlockBase {
  type: "productHighlight";
  data: { productId: string };
}

export interface GalleryBlock extends BlockBase {
  type: "gallery";
  data: { images: string[] };
}

export interface ProcessBlock extends BlockBase {
  type: "process";
  data: { steps: { number: string; title: string; description: string }[] };
}

export interface CollectionBlock extends BlockBase {
  type: "collection";
  data: { title: string; subtitle?: string; productIds: string[] };
}

export interface TextBlock extends BlockBase {
  type: "textBlock";
  data: { content: string };
}

export interface CtaBlock extends BlockBase {
  type: "cta";
  data: { text: string; href: string; sub?: string };
}

export type Block =
  | HeroBlock
  | ManifestoBlock
  | ProductGridBlock
  | ProductHighlightBlock
  | GalleryBlock
  | ProcessBlock
  | CollectionBlock
  | TextBlock
  | CtaBlock;

export interface PageConfig {
  blocks: Block[];
}

export interface PagesConfig {
  [page: string]: PageConfig;
}

// ─── Stripe ──────────────────────────────────────────────────────────────────

export interface CheckoutItem {
  productId: string;
  name:      string;
  price:     number;
  quantity:  number;
  image?:    string;
}
