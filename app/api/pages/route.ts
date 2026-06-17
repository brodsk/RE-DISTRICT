import { NextRequest, NextResponse } from "next/server";
import { PageConfig } from "@/lib/types";
import { getPages, savePage } from "@/lib/store";

const AUTH = process.env.ADMIN_PASSWORD ?? "redistrict2026";
const noCache = { headers: { "Cache-Control": "no-store, no-cache" } };

export async function GET(req: NextRequest) {
  const page  = new URL(req.url).searchParams.get("page");
  const pages = await getPages();
  const data  = page ? (pages[page] ?? { blocks: [] }) : pages;
  return NextResponse.json(data, noCache);
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-password") !== AUTH) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const { page, config }: { page: string; config: PageConfig } = await req.json();
  await savePage(page, config);
  return NextResponse.json({ ok: true });
}
