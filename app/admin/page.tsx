"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Product, SavedOrder } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

/* ─────────────────────────────────────────────
   ORDER LIFECYCLE (SHOPIFY STYLE)
──────────────────────────────────────────── */

type OrderStatus =
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
    case "shipped":
    case "cancelled":
      return order.status as OrderStatus;

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
  a.download = "redistrict-orders.csv";
  a.click();
}

/* ─────────────────────────────────────────────
   MAIN ADMIN
──────────────────────────────────────────── */

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [lang] = useAdminLang();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [countryFilter, setCountryFilter] = useState("all");

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts);
    fetch("/api/orders").then(r => r.json()).then(setOrders);
  }, []);

  /* ───────────────────────────────────────── */

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const status = resolveStatus(o);

      const matchSearch =
        o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        (o.items ?? []).some(i => i.name.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === "all" || status === statusFilter;
      const matchCountry = countryFilter === "all" || o.country === countryFilter;

      return matchSearch && matchStatus && matchCountry;
    });
  }, [orders, search, statusFilter, countryFilter]);

  const countries = Array.from(new Set(orders.map(o => o.country).filter(Boolean)));

  /* ─────────────────────────────────────────
     ACTIONS (API HOOKS)
  ───────────────────────────────────────── */

  async function updateStatus(id: string, status: OrderStatus) {
    await fetch("/api/orders/update-status", {
      method: "POST",
      body: JSON.stringify({ id, status }),
    });

    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
  }

  async function refundOrder(id: string) {
    await fetch("/api/orders/refund", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  /* ───────────────────────────────────────── */

  return (
    <div className="p-10 bg-black text-white min-h-screen font-mono text-[15px]">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-light">RE:DISTRICT ADMIN v3</h1>
        <p className="text-zinc-500">Shopify-level order system</p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3 mb-6">

        <input
          className="bg-zinc-900 px-3 py-2"
          placeholder="Search orders, items, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="bg-zinc-900 px-3 py-2"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All statuses</option>
          {Object.keys(STATUS).map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>

        <select
          className="bg-zinc-900 px-3 py-2"
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
        >
          <option value="all">All countries</option>
          {countries.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={() => exportCSV(filtered)}
          className="bg-white text-black px-3 py-2"
        >
          Export CSV
        </button>

      </div>

      {/* ORDERS */}
      <div className="space-y-5">

        {filtered.map(order => {
          const status = resolveStatus(order);

          return (
            <div key={order.id} className="border border-zinc-800 p-5">

              {/* TOP */}
              <div className="flex justify-between">

                <div>
                  <p className="text-xl">{order.customerName || "Unknown"}</p>
                  <p className="text-zinc-500">
                    {order.email || order.customerEmail} · {order.country} · {order.city}
                  </p>
                </div>

                <div className={STATUS[status].className}>
                  {STATUS[status].label}
                </div>

              </div>

              {/* ITEMS */}
              <div className="mt-3 text-zinc-300">
                {(order.items ?? []).map((i, idx) => (
                  <div key={idx}>
                    • {i.name} × {i.quantity}
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="mt-3 text-white text-lg">
                €{((order.grandTotal ?? order.total ?? 0) / 100).toFixed(2)}
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-2 mt-4">

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
