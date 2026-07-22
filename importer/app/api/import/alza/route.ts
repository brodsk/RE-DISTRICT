/**
 * RE:DISTRICT — Alza Import API Route
 * POST /api/import/alza
 *
 * Triggers an Alza category import from the admin dashboard.
 * Protected by ADMIN_PASSWORD header.
 *
 * Body: { url: string }
 * Returns: ImportReport
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

    return NextResponse.json(report, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    console.error("[POST /api/import/alza]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: Check if importer is available
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const defaultUrl = process.env.ALZA_CATEGORY_URL ?? "https://www.alza.sk/beauty/casio/v1508.htm";

  return NextResponse.json({
    ready: true,
    defaultCategoryUrl: defaultUrl,
    envCheck: {
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_SECRET_KEY,
      alzaCategoryUrl: !!process.env.ALZA_CATEGORY_URL,
    },
  });
}
