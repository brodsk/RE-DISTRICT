import { NextResponse } from "next/server";
import { getOrders } from "@/lib/store";

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json(orders, { headers: { "Cache-Control": "no-store" } });
}
