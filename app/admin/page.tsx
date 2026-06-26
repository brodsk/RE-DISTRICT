"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, SavedOrder } from "@/lib/types";
import { useAdminLang } from "@/app/admin/layout";

/* ─────────────────────────────
   ORDER STATUS
──────────────────────────── */

type OrderStatus =
  | "checkout_created"
  | "unpaid"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/**
 * нормализация статуса из backend
 */
function resolveStatus(order: SavedOrder): OrderStatus {
  switch (order.status) {
    case "paid":
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
   STATUS UI
──────────────────────────────────────────── */

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  unpaid: { label: "UNPAID", className: "text-orange-400" },
  paid: { label: "PAID", className: "text-emerald-400" },
  packed: { label: "PACKED", className: "text-blue-400" },
  shipped: { label: "SHIPPED", className: "text-cyan-400" },
  delivered: { label: "DELIVERED", className: "text-white" },
  cancelled: { label: "CANCELLED", className: "text-red-400" },
  refunded: { label: "REFUNDED", className: "text-yellow-400" },
  checkout_created: { label: "NEW", className: "text-zinc-500" },
};

/* ─────────────────────────────
   PRICE FIX (ВАЖНО)
   backend хранит В ЦЕНТАХ
──────────────────────────────────────────── */

function formatPrice(value: number) {
  // защита от двойного деления
  const normalized = value > 1000 ? value / 100 : value;
  return `€${normalized.toFixed(2)}`;
}

/* ─────────────────────────────
   MAIN ADMIN
──────────────────────────────────────────── */

export default function AdminDashboard() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lang] = useAdminLang();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  /* ─────────────────────────────
     LOAD DATA
  ───────────────────────────── */

  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(setOrders);
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  /* ─────────────────────────────
     FILTER
  ───────────────────────────── */

  const filtered = useMemo(() => {
    return orders.filter(order => {
      const status = resolveStatus(order);

      const text = `
        ${order.customerName ?? ""}
        ${order.customerEmail ?? ""}
        ${order.country ?? ""}
        ${order.city ?? ""}
        ${order.address ?? ""}
        ${order.id}
      `.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (statusFilter === "all" || status === statusFilter)
      );
    });
  }, [orders, search, statusFilter]);

  /* ─────────────────────────────
     UPDATE STATUS (FIX: PERSIST)
  ───────────────────────────── */

  async function updateStatus(id: string, status: OrderStatus) {
    // ❗ важно: сохраняем в backend
    await fetch("/api/orders/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    // UI sync
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
  }

  /* ─────────────────────────────
     REFUND
  ───────────────────────────── */

  async function refundOrder(id: string) {
    await fetch("/api/orders/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: "refunded" } : o))
    );
  }

  /* ───────────────────────────── */

  return (
    <div className="p-10 bg-black text-white min-h-screen font-mono text-[16px]">

      {/* HEADER */}
      <h1 className="text-4xl font-light mb-2">RE:DISTRICT ADMIN v2</h1>
      <p className="text-zinc-500 mb-6">Orders control panel</p>

      {/* CONTROLS */}
      <div className="flex gap-3 mb-6 flex-wrap">

        <input
          className="bg-zinc-900 px-3 py-2"
          placeholder="Search orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="bg-zinc-900 px-3 py-2"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          {Object.keys(STATUS).map(s => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* ORDERS */}
      <div className="space-y-5">

        {filtered.map(order => {
          const status = resolveStatus(order);

          return (
            <div key={order.id} className="border border-zinc-800 p-5">

              {/* HEADER */}
              <div className="flex justify-between">

                <div>
                  <p className="text-2xl">
                    {order.customerName || "Unknown customer"}
                  </p>

                  <p className="text-zinc-400 text-sm">
                    {order.customerEmail || "no-email"} · {order.country} · {order.city}
                  </p>

                  <p className="text-zinc-600 text-xs mt-1">
                    {order.address || "No address"}
                  </p>
                </div>

                <div className={STATUS[status].className}>
                  {STATUS[status].label}
                </div>
              </div>

              {/* ITEMS */}
              <div className="mt-3 text-zinc-300 text-sm">
                {(order.items ?? []).map((i, idx) => (
                  <div key={idx}>
                    • {i.name} × {i.quantity}
                  </div>
                ))}
              </div>

              {/* TOTAL (FIXED PRICE) */}
              <div className="mt-4 text-xl">
                {formatPrice(order.grandTotal ?? order.total ?? 0)}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-4 flex-wrap">

                <button onClick={() => updateStatus(order.id, "paid")} className="px-2 py-1 bg-emerald-900">
                  Paid
                </button>

                <button onClick={() => updateStatus(order.id, "packed")} className="px-2 py-1 bg-blue-900">
                  Packed
                </button>

                <button onClick={() => updateStatus(order.id, "shipped")} className="px-2 py-1 bg-cyan-900">
                  Shipped
                </button>

                <button onClick={() => updateStatus(order.id, "delivered")} className="px-2 py-1 bg-white text-black">
                  Delivered
                </button>

                <button onClick={() => updateStatus(order.id, "cancelled")} className="px-2 py-1 bg-red-900">
                  Cancel
                </button>

                <button onClick={() => refundOrder(order.id)} className="px-2 py-1 bg-yellow-900">
                  Refund
                </button>

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
