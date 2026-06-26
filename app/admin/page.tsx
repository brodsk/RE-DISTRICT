"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Product, SavedOrder } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

/* ─────────────────────────────────────────────
   TYPES / STATUS
──────────────────────────────────────────── */

type OrderStatus = "paid" | "pending" | "failed" | "shipped" | "unpaid";

function resolveStatus(order: SavedOrder): OrderStatus {
  switch (order.status) {
    case "paid":
    case "shipped":
      return order.status;

    case "cancelled":
      return "failed";

    case "checkout_created":
      return "unpaid";

    default:
      return "pending";
  }
}

/* ─────────────────────────────────────────────
   STATUS UI
──────────────────────────────────────────── */

const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  paid:     { label: "PAID",     color: "text-emerald-400" },
  shipped:  { label: "SHIPPED",  color: "text-blue-400" },
  pending:  { label: "PENDING",  color: "text-yellow-400" },
  unpaid:   { label: "UNPAID",   color: "text-orange-400" },
  failed:   { label: "FAILED",   color: "text-red-400" },
};

/* ─────────────────────────────────────────────
   CSV EXPORT
──────────────────────────────────────────── */

function exportCSV(orders: SavedOrder[]) {
  const rows = [
    [
      "id",
      "name",
      "email",
      "phone",
      "country",
      "city",
      "address",
      "status",
      "total",
      "items"
    ],
    ...orders.map(o => [
      o.id,
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      o.country,
      o.city,
      o.address,
      o.status,
      ((o.grandTotal ?? o.total ?? 0) / 100).toFixed(2),
      (o.items ?? []).map(i => `${i.name} x${i.quantity}`).join(" | ")
    ])
  ];

  const csv = rows.map(r => r.map(x => `"${x ?? ""}"`).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.csv";
  a.click();
}

/* ─────────────────────────────────────────────
   MAIN
──────────────────────────────────────────── */

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [lang] = useAdminLang();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts);
    fetch("/api/orders").then(r => r.json()).then(setOrders);
  }, []);

  /* ── FILTERED ORDERS ───────────────────── */

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const status = resolveStatus(o);

      const matchSearch =
        o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus = filter === "all" || status === filter;
      const matchCountry = countryFilter === "all" || o.country === countryFilter;

      return matchSearch && matchStatus && matchCountry;
    });
  }, [orders, search, filter, countryFilter]);

  const countries = Array.from(new Set(orders.map(o => o.country).filter(Boolean)));

  /* ── ACTIONS (HOOKS) ───────────────────── */

  async function updateStatus(id: string, status: OrderStatus) {
    await fetch("/api/orders/update-status", {
      method: "POST",
      body: JSON.stringify({ id, status }),
    });
  }

  async function refundOrder(id: string) {
    await fetch("/api/orders/refund", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  /* ───────────────────────────────────────── */

  return (
    <div className="p-10 text-[15px] font-mono bg-black text-white min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-light">RE:DISTRICT ADMIN</h1>
        <p className="text-zinc-500 text-sm">Shopify-like control panel</p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3 mb-6">

        <input
          className="bg-zinc-900 px-3 py-2 text-sm"
          placeholder="Search orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="bg-zinc-900 px-3 py-2 text-sm"
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="unpaid">Unpaid</option>
          <option value="failed">Failed</option>
          <option value="shipped">Shipped</option>
        </select>

        <select
          className="bg-zinc-900 px-3 py-2 text-sm"
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
        >
          <option value="all">All countries</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={() => exportCSV(filtered)}
          className="bg-white text-black px-3 py-2 text-sm"
        >
          Export CSV
        </button>

      </div>

      {/* ORDERS */}
      <div className="space-y-4">

        {filtered.map(order => {
          const status = resolveStatus(order);

          return (
            <div key={order.id} className="border border-zinc-800 p-4">

              {/* TOP */}
              <div className="flex justify-between">

                <div>
                  <p className="text-lg">{order.customerName || "No name"}</p>
                  <p className="text-zinc-500 text-sm">
                    {order.country} · {order.city} · {order.address}
                  </p>
                </div>

                <div className={STATUS_META[status].color}>
                  {STATUS_META[status].label}
                </div>

              </div>

              {/* ITEMS */}
              <div className="mt-3 text-sm text-zinc-300">
                {order.items?.map((i, idx) => (
                  <div key={idx}>
                    {i.name} × {i.quantity}
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="mt-3 text-white">
                Total: €{((order.grandTotal ?? order.total ?? 0) / 100).toFixed(2)}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => updateStatus(order.id, "paid")}
                  className="text-xs px-2 py-1 bg-emerald-900"
                >
                  Mark Paid
                </button>

                <button
                  onClick={() => updateStatus(order.id, "shipped")}
                  className="text-xs px-2 py-1 bg-blue-900"
                >
                  Shipped
                </button>

                <button
                  onClick={() => updateStatus(order.id, "failed")}
                  className="text-xs px-2 py-1 bg-red-900"
                >
                  Cancel
                </button>

                <button
                  onClick={() => refundOrder(order.id)}
                  className="text-xs px-2 py-1 bg-yellow-900"
                >
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
