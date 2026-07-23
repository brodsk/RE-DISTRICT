/**
 * RE:DISTRICT — Alza Storage Compatibility Shim
 *
 * The main sync engine is now lib/alza/sync.ts (supplier_products → products).
 * This file is kept for backwards compatibility and re-exports from sync.ts.
 *
 * Direct callers (if any) should migrate to sync.ts directly.
 */

export { syncProducts, syncOneProduct } from "./sync";
export type { ProductSyncResult } from "./sync";
