-- ============================================================
-- RE:DISTRICT — Supplier Products Table
-- Run this in Supabase SQL Editor before first import.
-- ============================================================

-- supplier_products: raw data from suppliers (Alza, etc.)
-- This is the "source of truth" for all supplier-sourced product data.
-- The products table (managed by store) links to this via store_product_id.

CREATE TABLE IF NOT EXISTS public.supplier_products (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  supplier              TEXT        NOT NULL,       -- 'alza'
  supplier_product_id   TEXT        NOT NULL,       -- Alza internal ID (from URL)
  supplier_url          TEXT        NOT NULL,       -- Full Alza product URL

  -- Product content (supplier-controlled)
  name                  TEXT        NOT NULL DEFAULT '',
  brand                 TEXT        NOT NULL DEFAULT '',
  price                 NUMERIC     NOT NULL DEFAULT 0,
  original_price        NUMERIC     NULL,
  currency              TEXT        NOT NULL DEFAULT 'EUR',

  -- Availability (supplier-controlled)
  availability          TEXT        NOT NULL DEFAULT '',
  stock_status          TEXT        NOT NULL DEFAULT 'unknown',
  is_available          BOOLEAN     NOT NULL DEFAULT true,

  -- Ratings
  rating                NUMERIC     NULL,
  review_count          INT         NOT NULL DEFAULT 0,

  -- Content
  description           TEXT        NOT NULL DEFAULT '',
  short_description     TEXT        NOT NULL DEFAULT '',

  -- Identifiers
  ean                   TEXT        NULL,
  manufacturer          TEXT        NOT NULL DEFAULT '',
  warranty              TEXT        NULL,

  -- Classification
  category              TEXT        NOT NULL DEFAULT '',
  breadcrumbs           JSONB       NOT NULL DEFAULT '[]',

  -- Media (stored in Supabase Storage, not Alza links)
  images                JSONB       NOT NULL DEFAULT '[]',

  -- Specifications
  parameters            JSONB       NOT NULL DEFAULT '[]',

  -- Link to RE:DISTRICT store product (null = not yet mapped)
  store_product_id      TEXT        NULL,

  -- Timestamps
  last_scraped_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one row per supplier + supplier product ID
CREATE UNIQUE INDEX IF NOT EXISTS supplier_products_supplier_id_idx
  ON public.supplier_products (supplier, supplier_product_id);

-- Index for fast lookup by store product
CREATE INDEX IF NOT EXISTS supplier_products_store_product_idx
  ON public.supplier_products (store_product_id)
  WHERE store_product_id IS NOT NULL;

-- Index for filtering by availability
CREATE INDEX IF NOT EXISTS supplier_products_available_idx
  ON public.supplier_products (supplier, is_available);

-- Index for ordering by last scraped
CREATE INDEX IF NOT EXISTS supplier_products_scraped_at_idx
  ON public.supplier_products (last_scraped_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────
-- Only the service role (importer) can write.
-- Public can read available products.

ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

-- Service role has full access (importer uses service key)
CREATE POLICY "service_role_full_access" ON public.supplier_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anonymous/authenticated can only read available products
CREATE POLICY "public_read_available" ON public.supplier_products
  FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

-- ── Updated_at trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS supplier_products_updated_at ON public.supplier_products;

CREATE TRIGGER supplier_products_updated_at
  BEFORE UPDATE ON public.supplier_products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ── Helpful view: latest supplier prices ──────────────────────────────────

CREATE OR REPLACE VIEW public.supplier_product_summary AS
SELECT
  id,
  supplier,
  supplier_product_id,
  name,
  brand,
  price,
  original_price,
  currency,
  stock_status,
  is_available,
  store_product_id,
  jsonb_array_length(images) AS image_count,
  jsonb_array_length(parameters) AS param_count,
  last_scraped_at,
  created_at
FROM public.supplier_products
ORDER BY last_scraped_at DESC;

-- ── Done ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.supplier_products IS
  'Raw supplier product data from Alza and future suppliers. '
  'Importer writes here. Frontend never reads this directly. '
  'Maps to store products via store_product_id.';
