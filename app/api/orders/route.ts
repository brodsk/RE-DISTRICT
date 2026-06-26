import { NextResponse } from "next/server";

/* ─────────────────────────────
   BACKWARD COMPAT STORAGE FIX
──────────────────────────── */

const store = globalThis as any;

/* поддержка старых ключей */
function getOrders() {
  if (!store.__orders && store.orders) {
    store.__orders = store.orders;
  }

  if (!store.__orders) {
    store.__orders = store.orders || {};
  }

  return store.__orders;
}

/* ───────────────────────────── */

export async function GET() {
  const orders = Object.values(getOrders());
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action, id, status } = body;

  const db = getOrders();
  const order = db[id];

  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  if (action === "update-status") {
    order.status = status;

    order.activity = order.activity || [];
    order.activity.push({
      id: crypto.randomUUID(),
      message: `Status → ${status}`,
      time: Date.now(),
    });

    db[id] = order;

    return NextResponse.json({ ok: true, order });
  }

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
}
