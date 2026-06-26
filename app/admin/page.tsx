"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, SavedOrder } from "@/lib/types";
import { useAdminLang } from "@/app/admin/layout";

/* ─────────────────────────────────────────────
   ORDER STATUS
──────────────────────────────────────────── */

type OrderStatus =
  | "checkout_created"
  | "unpaid"
  | "paid"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

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

/* ─────────────────────────────────────────────
   STATUS UI
──────────────────────────────────────────── */

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  unpaid:    { label: "UNPAID",    className: "text-orange-400" },
  paid:      { label: "PAID",      className: "text-emerald-400" },
  packed:    { label: "PACKED",    className: "text-blue-400" },
  shipped:   { label: "SHIPPED",   className: "text-cyan-400" },
  delivered: { label: "DELIVERED", className: "text-white" },
  cancelled: { label: "CANCELLED", className: "text-red-400" },
  refunded:  { label: "REFUNDED",  className: "text-yellow-400" },
  checkout_created: { label: "NEW", className: "text-zinc-500" },
};

/* ─────────────────────────────────────────────
   ADMIN DASHBOARD
──────────────────────────────────────────── */

export default function AdminDashboard() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lang] = useAdminLang();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(setOrders).catch(() => {});
    fetch("/api/products").then(r => r.json()).then(setProducts).catch(() => {});
  }, []);

  /* ───────────────────────────────────────────── */

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

      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  /* ───────────────────────────────────────────── */

  return (
    <div className="p-10 bg-black text-white min-h-screen font-mono text-[16px]">

      {/* HEADER */}
      <h1 className="text-4xl font-light mb-2">RE:DISTRICT ADMIN</h1>
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
              <div className="flex justify-between items-start">

                <div>
                  <p className="text-2xl">
                    {order.customerName || "Unknown customer"}
                  </p>

                  {/* EMAIL + LOCATION */}
                  <p className="text-zinc-400 text-sm">
                    {order.customerEmail || "no-email"} · {order.country || "—"} · {order.city || "—"}
                  </p>

                  {/* ADDRESS */}
                  <p className="text-zinc-600 text-xs mt-1">
                    {order.address || "No address provided"}
                  </p>

                  {/* PHONE */}
                  <p className="text-zinc-700 text-xs mt-1">
                    {order.customerPhone || "No phone"}
                  </p>
                </div>

                {/* STATUS */}
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

              {/* TOTAL */}
<div className="mt-4 text-xl">
  €{((order.grandTotal ?? order.total ?? 0) * 10).toFixed(2)}
</div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
