import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PagesConfig } from "@/lib/types";

const DATA_PATH = join(process.cwd(), "data", "pages.json");

function readPages(): PagesConfig {
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writePages(pages: PagesConfig) {
  writeFileSync(DATA_PATH, JSON.stringify(pages, null, 2));
}

// GET /api/pages?page=home
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");
  const pages = readPages();

  if (page) return NextResponse.json(pages[page] ?? { blocks: [] });
  return NextResponse.json(pages);
}

// POST /api/pages — save page config
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "redistrict2026")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { page, config } = await req.json();
  const pages = readPages();
  pages[page] = config;
  writePages(pages);
  return NextResponse.json({ ok: true });
}
