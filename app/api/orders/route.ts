import { NextResponse } from "next/server";

/* ─────────────────────────────
   SIMPLE IN-MEMORY DB (Vercel safe MVP)
──────────────────────────── */

const store = globalThis as any;

function getOrders() {
  if (!store.__orders) store.__orders = {};
  return store.__orders;
}

/* ─────────────────────────────
   TYPES
──────────────────────────── */

type OrderStatus =
  | "checkout_created"
  | "unpaid"
  | "paid"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/* ─────────────────────────────
   STATUS FLOW (SHOPIFY STYLE)
──────────────────────────── */

function canTransition(from: OrderStatus, to: OrderStatus) {
  const map: Record<OrderStatus, OrderStatus[]> = {
    checkout_created: ["unpaid"],
    unpaid: ["paid", "cancelled"],
    paid: ["processing", "packed", "cancelled"],
    processing: ["packed", "cancelled"],
    packed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: ["refunded"],
    refunded: [],
  };

  return map[from]?.includes(to);
}

/* ─────────────────────────────
   GET ORDERS
──────────────────────────── */

export async function GET() {
  const orders = Object.values(getOrders());
  return NextResponse.json(orders);
}

/* ─────────────────────────────
   POST ROUTER (UPDATE STATUS / REFUND / CREATE)
──────────────────────────── */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, status } = body;

    const db = getOrders();

    const order = db[id];

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    /* ───────────── UPDATE STATUS ───────────── */

    if (action === "update-status") {
      if (!status) {
        return NextResponse.json({ error: "Missing status" }, { status: 400 });
      }

      if (!canTransition(order.status, status)) {
        return NextResponse.json(
          { error: "Invalid status transition" },
          { status: 403 }
        );
      }

      order.status = status;
      order.updatedAt = new Date().toISOString();

      order.activity = order.activity || [];
      order.activity.push({
        id: crypto.randomUUID(),
        message: `Status → ${status}`,
        time: Date.now(),
      });

      db[id] = order;

      return NextResponse.json({ ok: true, order });
    }

    /* ───────────── REFUND (placeholder) ───────────── */

    if (action === "refund") {
      order.status = "refunded";

      order.activity = order.activity || [];
      order.activity.push({
        id: crypto.randomUUID(),
        message: "Refund issued",
        time: Date.now(),
      });

      db[id] = order;

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
