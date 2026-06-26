"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, SavedOrder } from "@/lib/types";

/* ─────────────────────────────
   STATUS MACHINE (SHOPIFY STYLE)
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
      return order.status;

    case "checkout_created":
      return "unpaid";

    default:
      return "unpaid";
  }
}

/* ─────────────────────────────
   STATUS UI (НЕ ТРОГАЕМ UI)
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

/* ─────────────────────────────
   SAFE PRICE FIX
──────────────────────────── */

function normalizePrice(value: number) {
  if (!value) return 0;

  // если уже евро (маленькое число)
  if (value < 1000) return value;

  // если центы
  return value / 100;
}

/* ─────────────────────────────
   MAIN DASHBOARD
──────────────────────────── */

export default function AdminDashboard() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selected, setSelected] = useState<SavedOrder | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(setOrders);
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  /* ───────────────────────────── */

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const status = normalizeStatus(o);

      const text = `
        ${o.customerName ?? ""}
        ${o.customerEmail ?? ""}
        ${o.country ?? ""}
        ${o.city ?? ""}
        ${o.address ?? ""}
        ${o.id}
        ${(o.items ?? []).map(i => i.name).join(" ")}
      `.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (statusFilter === "all" || status === statusFilter)
      );
    });
  }, [orders, search, statusFilter]);

  /* ─────────────────────────────
     FIXED STATUS UPDATE (KEY FIX)
  ───────────────────────────── */

  async function updateStatus(order: SavedOrder, newStatus: OrderStatus) {
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: order.id,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      setOrders(prev =>
        prev.map(o =>
          o.id === order.id ? { ...o, status: newStatus as any } : o
        )
      );

      setSelected(prev =>
        prev && prev.id === order.id
          ? { ...prev, status: newStatus as any }
          : prev
      );
    } catch (e) {
      console.error(e);
      alert("Status update failed");
    }
  }

  /* ───────────────────────────── */

  return (
    <div className="flex bg-black text-white min-h-screen font-mono">

      {/* LEFT */}
      <div className="flex-1 p-8">

        <div className="flex gap-3 mb-6">
          <input
            className="bg-zinc-900 px-3 py-2 w-full"
            placeholder="Search orders, email, city, product..."
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
                className="border border-zinc-800 p-4 cursor-pointer hover:border-zinc-600"
              >

                <div className="flex justify-between">
                  <div>
                    <p className="text-xl">
                      {order.customerName || "Unknown"}
                    </p>

                    <p className="text-zinc-500 text-sm">
                      {order.customerEmail} · {order.country} · {order.city}
                    </p>
                  </div>

                  <div className={STATUS[status].class}>
                    {STATUS[status].label}
                  </div>
                </div>

                <p className="mt-2 text-sm text-zinc-400">
                  {order.address}
                </p>

                {/* PRICE FIX */}
                <p className="mt-2 text-lg">
                  €{normalizePrice(order.grandTotal ?? order.total ?? 0).toFixed(2)}
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
            <h2 className="text-2xl mb-2">{selected.customerName}</h2>

            <p className="text-zinc-400 text-sm mb-4">
              {selected.customerEmail}
            </p>

            <p className="text-zinc-500 text-sm">
              {selected.address}
            </p>

            <div className="mt-3 text-sm text-zinc-400">
              {selected.country} · {selected.city}
            </div>

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
              €{normalizePrice(selected.grandTotal ?? selected.total ?? 0).toFixed(2)}
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
                onClick={() => updateStatus(selected, "refunded")}
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
