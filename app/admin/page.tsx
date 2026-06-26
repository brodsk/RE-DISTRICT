"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, SavedOrder } from "@/lib/types";

/* ─────────────────────────────
   STATUS MACHINE
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

function normalizeStatus(order: SavedOrder): OrderStatus {
  switch (order.status as any) {
    case "paid":
    case "processing":
    case "packed":
    case "shipped":
    case "delivered":
    case "cancelled":
    case "refunded":
      return order.status as OrderStatus;

    case "checkout_created":
      return "unpaid";

    default:
      return "unpaid";
  }
}

/* ─────────────────────────────
   UI STATUS
──────────────────────────── */

const STATUS: Record<OrderStatus, { label: string; class: string }> = {
  checkout_created: { label: "NEW", class: "text-zinc-500" },
  unpaid: { label: "UNPAID", class: "text-orange-400" },
  paid: { label: "PAID", class: "text-emerald-400" },
  processing: { label: "PROCESSING", class: "text-blue-400" },
  packed: { label: "PACKED", class: "text-indigo-400" },
  shipped: { label: "SHIPPED", class: "text-cyan-400" },
  delivered: { label: "DELIVERED", class: "text-white" },
  cancelled: { label: "CANCELLED", class: "text-red-400" },
  refunded: { label: "REFUNDED", class: "text-yellow-400" },
};

/* ───────────────────────────── */

export default function AdminDashboard() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<SavedOrder | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  /* ───────────────────────────── */

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.json())
      .then(setOrders)
      .catch(console.error);

    fetch("/api/products")
      .then(r => r.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  /* ─────────────────────────────
     FILTER
──────────────────────────── */

  const filtered = useMemo(() => {
    return orders.filter(order => {
      const status = normalizeStatus(order);

      const text = `
        ${order.customerName ?? ""}
        ${order.customerEmail ?? ""}
        ${order.country ?? ""}
        ${order.city ?? ""}
        ${order.address ?? ""}
        ${order.id}
        ${(order.items ?? []).map(i => i.name).join(" ")}
      `.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  /* ─────────────────────────────
     UPDATE STATUS (FIXED API)
──────────────────────────── */

  async function updateStatus(order: SavedOrder, newStatus: OrderStatus) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-status",
        id: order.id,
        status: newStatus,
      }),
    });

    if (!res.ok) {
      alert("Status update failed");
      return;
    }

    setOrders(prev =>
      prev.map(o =>
        o.id === order.id ? { ...o, status: newStatus as any } : o
      )
    );
  }

  /* ─────────────────────────────
     REFUND (FIXED API)
──────────────────────────── */

  async function refundOrder(order: SavedOrder) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "refund",
        id: order.id,
      }),
    });

    if (!res.ok) {
      alert("Refund failed");
      return;
    }

    setOrders(prev =>
      prev.map(o =>
        o.id === order.id ? { ...o, status: "refunded" as any } : o
      )
    );
  }

  /* ─────────────────────────────
     UI
──────────────────────────── */

  return (
    <div className="flex bg-black text-white min-h-screen font-mono">

      {/* LEFT */}
      <div className="flex-1 p-8">

        {/* SEARCH */}
        <div className="flex gap-3 mb-6">
          <input
            className="bg-zinc-900 px-3 py-2 w-full"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            className="bg-zinc-900 px-3 py-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="all">ALL</option>
            {Object.keys(STATUS).map(s => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* ORDERS */}
        <div className="space-y-4">
          {filtered.map(order => {
            const status = normalizeStatus(order);

            return (
              <div
                key={order.id}
                onClick={() => setSelected(order)}
                className="border border-zinc-800 p-4 cursor-pointer"
              >

                <div className="flex justify-between">
                  <div>
                    <p className="text-xl">{order.customerName}</p>

                    {/* EMAIL + LOCATION FIXED */}
                    <p className="text-zinc-500 text-sm">
                      {order.customerEmail} · {order.country} · {order.city}
                    </p>

                    {/* PACKETA LABEL (IMPORTANT FIX) */}
                    {order.pickupPointName && (
                      <p className="text-green-400 text-xs mt-1">
                        📦 Packeta: {order.pickupPointName}
                      </p>
                    )}

                    <p className="text-sm text-zinc-400 mt-2">
                      {order.address}
                    </p>
                  </div>

                  <div className={STATUS[status].class}>
                    {STATUS[status].label}
                  </div>
                </div>

                {/* PRICE FIX (NO DOUBLE DIVISION) */}
                <p className="mt-3 text-lg">
                  €{((order.grandTotal ?? order.total ?? 0) / 100).toFixed(2)}
                </p>

              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-[420px] border-l border-zinc-800 p-5">

        {!selected ? (
          <p className="text-zinc-600">Select order</p>
        ) : (
          <>
            <h2 className="text-2xl">{selected.customerName}</h2>

            <p className="text-zinc-400 text-sm">
              {selected.customerEmail}
            </p>

            <p className="text-zinc-500 text-sm mt-2">
              {selected.address}
            </p>

            <p className="text-zinc-500 text-sm">
              {selected.country} · {selected.city}
            </p>

            {/* PACKETA FIX (CLEAR INDICATOR) */}
            {selected.pickupPointName && (
              <div className="mt-4 border border-green-800 p-3">
                <p className="text-green-400">📦 Packeta Pickup Point</p>
                <p>{selected.pickupPointName}</p>
                <p className="text-zinc-500 text-sm">
                  {selected.pickupPointAddress}
                </p>
              </div>
            )}

            {/* ITEMS */}
            <div className="mt-4">
              {(selected.items ?? []).map((i, idx) => (
                <p key={idx} className="text-sm">
                  • {i.name} × {i.quantity}
                </p>
              ))}
            </div>

            {/* TOTAL FIX */}
            <p className="text-xl mt-4">
              €{((selected.grandTotal ?? selected.total ?? 0) / 100).toFixed(2)}
            </p>

            {/* ACTIONS */}
            <div className="mt-4 flex flex-wrap gap-2">

              {(["paid","processing","packed","shipped","delivered"] as OrderStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected, s)}
                  className="px-2 py-1 bg-zinc-800"
                >
                  {s}
                </button>
              ))}

              <button
                onClick={() => refundOrder(selected)}
                className="px-2 py-1 bg-yellow-900"
              >
                Refund
              </button>

              <button
                onClick={() => updateStatus(selected, "cancelled")}
                className="px-2 py-1 bg-red-900"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
