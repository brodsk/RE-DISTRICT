import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/types";
import { getProducts, saveProduct, deleteProduct } from "@/lib/store";

const AUTH = process.env.ADMIN_PASSWORD ?? "redistrict2026";
const auth = (req: NextRequest) => req.headers.get("x-admin-password") === AUTH;
const no   = (msg: string, s = 401) => NextResponse.json({ error: msg }, { status: s });
const noCache = { headers: { "Cache-Control": "no-store, no-cache" } };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let products = await getProducts();
  const cat  = searchParams.get("category");
  const feat = searchParams.get("featured");
  const stat = searchParams.get("status");
  if (cat)          products = products.filter(p => p.category === cat);
  if (feat === "true") products = products.filter(p => p.featured);
  if (stat)         products = products.filter(p => p.status === stat);
  return NextResponse.json(products, noCache);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return no("Unauthorised");
  const product: Product = await req.json();
  if (!product.id || !product.slug) return no("Missing id or slug", 400);
  product.createdAt = product.createdAt ?? new Date().toISOString();
  await saveProduct(product);
  return NextResponse.json({ ok: true, id: product.id });
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return no("Unauthorised");
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return no("Missing id", 400);
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
