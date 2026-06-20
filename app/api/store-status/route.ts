import { NextResponse } from "next/server";
import { getStoreStatus, getProducts } from "@/lib/store";

export async function GET() {
  const status   = getStoreStatus();
  const products = await getProducts();
  return NextResponse.json({
    ...status,
    productCount: products.length,
    backend: status.kv ? "vercel-kv" : status.blob ? "vercel-blob" : status.local ? "local-file" : "seed-only",
    message: status.persistent
      ? "Store is persistent."
      : "⚠️ No persistent backend. Set KV_REST_API_URL+KV_REST_API_TOKEN in Vercel to persist products.",
  }, { headers: { "Cache-Control": "no-store" } });
}
