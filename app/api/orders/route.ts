import { NextRequest, NextResponse } from "next/server";
import { getOrders, updateOrderStatus } from "@/lib/orders";

const NO_CACHE = { headers: { "Cache-Control": "no-store" } };

// ── GET /api/orders ─────────────────────────────────────────────────────────
// Returns all orders from Supabase, sorted by created_at DESC.

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders, NO_CACHE);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch orders";
    console.error("[GET /api/orders]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── POST /api/orders ─────────────────────────────────────────────────────────
// Supported actions:
//   { action: "update-status", id, status }
//   { action: "refund", id }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id } = body as { action: string; id: string; status?: string };

    if (!action || !id) {
      return NextResponse.json({ error: "Missing action or id" }, { status: 400 });
    }

    if (action === "update-status") {
      const status = body.status as string;
      if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 });
      await updateOrderStatus(id, status as never);
      return NextResponse.json({ ok: true }, NO_CACHE);
    }

    if (action === "refund") {
      await updateOrderStatus(id, "refunded");
      return NextResponse.json({ ok: true }, NO_CACHE);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Order action failed";
    console.error("[POST /api/orders]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
