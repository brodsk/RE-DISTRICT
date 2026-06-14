import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Product } from "@/lib/types";

const DATA_PATH = join(process.cwd(), "data", "products.json");

function readProducts(): Product[] {
  try {
    return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeProducts(products: Product[]) {
  writeFileSync(DATA_PATH, JSON.stringify(products, null, 2));
}

// GET /api/products — list all, optional ?category=custom&featured=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let products = readProducts();

  const category = searchParams.get("category");
  const featured  = searchParams.get("featured");
  const status    = searchParams.get("status");

  if (category) products = products.filter(p => p.category === category);
  if (featured === "true") products = products.filter(p => p.featured);
  if (status)  products = products.filter(p => p.status === status);

  return NextResponse.json(products);
}

// POST /api/products — create or update (admin only)
export async function POST(req: NextRequest) {
  // Simple auth check via header
  const auth = req.headers.get("x-admin-password");
  if (auth !== (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "redistrict2026")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const product: Product = await req.json();
  const products = readProducts();
  const idx = products.findIndex(p => p.id === product.id);

  if (idx >= 0) products[idx] = product;
  else products.unshift(product);

  writeProducts(products);
  return NextResponse.json({ ok: true });
}

// DELETE /api/products?id=xxx
export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "redistrict2026")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const products = readProducts().filter(p => p.id !== id);
  writeProducts(products);
  return NextResponse.json({ ok: true });
}
