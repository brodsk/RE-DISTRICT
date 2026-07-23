-- ============================================================
-- RE:DISTRICT — Migration: Add Supplier Fields to Products
-- Run ONLY if you have a products table in Supabase.
-- (Current setup uses Upstash Redis — this is for future Supabase migration)
--
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks).
-- Does NOT drop or alter any existing columns.
-- ============================================================

-- If you create a products table in Supabase later, add these columns:
-- (The importer stores supplier fields directly on the Product object
--  which is serialized to Upstash Redis as JSON)

-- ── For future Supabase products table ────────────────────────────────────

DO $$
BEGIN
  -- supplier: which supplier owns this product (null = manually created)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'supplier'
  ) THEN
    ALTER TABLE public.products ADD COLUMN supplier TEXT NULL;
    COMMENT ON COLUMN public.products.supplier IS 'Supplier name, e.g. "alza". NULL for manually created products.';
  END IF;

  -- supplier_product_id: supplier internal ID (matches supplier_products.supplier_product_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'supplier_product_id'
  ) THEN
    ALTER TABLE public.products ADD COLUMN supplier_product_id TEXT NULL;
    COMMENT ON COLUMN public.products.supplier_product_id IS 'Supplier product ID. Links to supplier_products table.';
  END IF;

  -- supplier_price: latest price from supplier (for margin tracking)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'supplier_price'
  ) THEN
    ALTER TABLE public.products ADD COLUMN supplier_price NUMERIC NULL;
    COMMENT ON COLUMN public.products.supplier_price IS 'Latest price from supplier. May differ from store price.';
  END IF;

  -- supplier_stock: supplier stock level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'supplier_stock'
  ) THEN
    ALTER TABLE public.products ADD COLUMN supplier_stock INT NULL DEFAULT 0;
    COMMENT ON COLUMN public.products.supplier_stock IS '1 = in stock at supplier, 0 = out of stock.';
  END IF;

  -- supplier_url: direct link to product on supplier site
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'supplier_url'
  ) THEN
    ALTER TABLE public.products ADD COLUMN supplier_url TEXT NULL;
    COMMENT ON COLUMN public.products.supplier_url IS 'Direct URL to product on supplier website.';
  END IF;

  -- last_supplier_sync: when this product was last synced from supplier
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'last_supplier_sync'
  ) THEN
    ALTER TABLE public.products ADD COLUMN last_supplier_sync TIMESTAMPTZ NULL;
    COMMENT ON COLUMN public.products.last_supplier_sync IS 'Timestamp of last successful supplier sync.';
  END IF;

END $$;

-- ── Index for fast supplier product lookup ────────────────────────────────

CREATE INDEX IF NOT EXISTS products_supplier_product_id_idx
  ON public.products (supplier, supplier_product_id)
  WHERE supplier_product_id IS NOT NULL;

-- ── View: Products with supplier status ───────────────────────────────────

CREATE OR REPLACE VIEW public.products_with_supplier AS
SELECT
  p.*,
  sp.price          AS current_supplier_price,
  sp.stock_status   AS current_stock_status,
  sp.is_available   AS supplier_available,
  sp.last_scraped_at
FROM public.products p
LEFT JOIN public.supplier_products sp
  ON sp.supplier = p.supplier
  AND sp.supplier_product_id = p.supplier_product_id;

COMMENT ON VIEW public.products_with_supplier IS
  'Products joined with live supplier data. Read-only.';
