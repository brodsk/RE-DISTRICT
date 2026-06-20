import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/types";
import { getProducts, saveProduct, deleteProduct, getStoreStatus } from "@/lib/store";

const AUTH     = process.env.ADMIN_PASSWORD ?? "redistrict2026";
const isAuth   = (req: NextRequest) => req.headers.get("x-admin-password") === AUTH;
const noCache  = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let products = await getProducts();

  const cat  = searchParams.get("category");
  const feat = searchParams.get("featured");
  const stat = searchParams.get("status");
  if (cat)            products = products.filter(p => p.category === cat);
  if (feat === "true") products = products.filter(p => p.featured);
  if (stat)           products = products.filter(p => p.status === stat);

  console.log(`[api/products GET] returning ${products.length} products`);
  return NextResponse.json(products, noCache);
}

export async function POST(req: NextRequest) {
  if (!isAuth(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let product: Product;
  try {
    product = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!product.id)   return NextResponse.json({ error: "Missing product.id" },   { status: 400 });
  if (!product.slug) return NextResponse.json({ error: "Missing product.slug" }, { status: 400 });
  if (!product.name) return NextResponse.json({ error: "Missing product.name" }, { status: 400 });

  product.createdAt = product.createdAt ?? new Date().toISOString();

  try {
    await saveProduct(product);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/products POST] saveProduct failed:", msg);
    return NextResponse.json({ error: `Storage failed: ${msg}` }, { status: 500 });
  }

  // Verify it was actually saved
  const list    = await getProducts();
  const saved   = list.find(p => p.id === product.id);
  const status  = getStoreStatus();

  console.log(`[api/products POST] saved "${product.name}" — list now ${list.length} items — backend: ${JSON.stringify(status)}`);

  return NextResponse.json({
    ok:           !!saved,
    id:           product.id,
    productCount: list.length,
    backend:      status.backend,
    persistent:   status.persistent,
    warning:      status.persistent ? null : "Products are NOT persistent — configure Vercel KV (Upstash).",
  });
}

export async function DELETE(req: NextRequest) {
  if (!isAuth(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await deleteProduct(id);
  const list = await getProducts();
  console.log(`[api/products DELETE] removed ${id} — list now ${list.length} items`);
  return NextResponse.json({ ok: true, productCount: list.length });
}
