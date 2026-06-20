import { NextResponse } from "next/server";
import { getStoreStatus, getProducts } from "@/lib/store";

export async function GET() {
  const status   = getStoreStatus();
  const products = await getProducts();
  return NextResponse.json({
    backend:      status.backend,
    persistent:   status.persistent,
    redis:        status.redis,
    local:        status.local,
    productCount: products.length,
    message:      status.persistent
      ? `Store is persistent (${status.backend}).`
      : "⚠️ No persistent backend. Set redistrict_KV_REST_API_URL and redistrict_KV_REST_API_TOKEN in Vercel.",
  }, { headers: { "Cache-Control": "no-store" } });
}
