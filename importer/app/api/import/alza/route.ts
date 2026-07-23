/**
 * RE:DISTRICT — Alza Import API Route
 * POST /api/import/alza
 *
 * Triggers an Alza category import from the admin dashboard.
 * Protected by ADMIN_PASSWORD header.
 *
 * Body: { url: string }
 * Returns: ImportReport (includes supplier_products + store sync stats)
 */

import { NextRequest, NextResponse } from "next/server";
import type { ImportReport } from "@/lib/alza/types";

const AUTH = process.env.ADMIN_PASSWORD ?? "redistrict2026";

function isAuthed(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === AUTH;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let url: string;
  try {
    const body = await req.json();
    url = body.url;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url in request body" }, { status: 400 });
  }

  if (!url.startsWith("https://www.alza.")) {
    return NextResponse.json(
      { error: "URL must be an Alza category URL (https://www.alza.sk/...)" },
      { status: 400 }
    );
  }

  try {
    // Dynamic import to avoid loading Playwright in non-import contexts
    const { importAlzaCategory } = await import("@/lib/alza/importer");
    const report: ImportReport = await importAlzaCategory(url);

    return NextResponse.json(
      {
        ...report,
        // Convenience summary for admin dashboard UI
        summary: {
          supplier: {
            found:       report.productsFound,
            created:     report.productsCreated,
            updated:     report.productsUpdated,
            unavailable: report.productsUnavailable,
            failed:      report.productsFailed,
          },
          store: {
            created: report.sync.storeCreated,
            updated: report.sync.storeUpdated,
            skipped: report.sync.storeSkipped,
            failed:  report.sync.storeFailed,
          },
          images: {
            downloaded: report.imagesDownloaded,
            skipped:    report.imagesSkipped,
          },
          durationMs:  report.durationMs,
          errorCount:  report.errors.length,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    console.error("[POST /api/import/alza]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: Check importer readiness and show current supplier stats
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const defaultUrl = process.env.ALZA_CATEGORY_URL ?? "https://www.alza.sk/beauty/casio/v1508.htm";

  // Try to read supplier_products stats
  let supplierStats: { total: number; available: number; lastSync: string | null } = {
    total: 0,
    available: 0,
    lastSync: null,
  };

  try {
    const { getSupabaseAdmin } = await import("@/lib/alza/database");
    const supabase = getSupabaseAdmin();

    const { count: total } = await supabase
      .from("supplier_products")
      .select("*", { count: "exact", head: true })
      .eq("supplier", "alza");

    const { count: available } = await supabase
      .from("supplier_products")
      .select("*", { count: "exact", head: true })
      .eq("supplier", "alza")
      .eq("is_available", true);

    const { data: lastRow } = await supabase
      .from("supplier_products")
      .select("last_scraped_at")
      .eq("supplier", "alza")
      .order("last_scraped_at", { ascending: false })
      .limit(1)
      .single();

    supplierStats = {
      total: total ?? 0,
      available: available ?? 0,
      lastSync: lastRow?.last_scraped_at ?? null,
    };
  } catch {
    // Non-fatal: just return without stats
  }

  return NextResponse.json({
    ready: true,
    defaultCategoryUrl: defaultUrl,
    supplierStats,
    envCheck: {
      supabaseUrl:      !!process.env.SUPABASE_URL,
      supabaseKey:      !!process.env.SUPABASE_SECRET_KEY,
      alzaCategoryUrl:  !!process.env.ALZA_CATEGORY_URL,
    },
  });
}
