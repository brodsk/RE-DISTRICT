"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Product, SavedOrder } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

/* ─────────────────────────────────────────────
   ORDER STATUS (SHOPIFY-LIKE)
──────────────────────────────────────────── */

type OrderStatus =
  | "checkout_created"
  | "paid"
  | "processing"
  | "shipped"
  | "refunded"
  | "cancelled";

function normalizeStatus(order: SavedOrder): OrderStatus {
  return (order.status as OrderStatus) || "checkout_created";
}

/* ─────────────────────────────────────────────
   UI HELPERS
──────────────────────────────────────────── */

const STATUS_LABEL: Record<OrderStatus, string> = {
  checkout_created: "PENDING",
  paid: "PAID",
  processing: "PROCESSING",
  shipped: "SHIPPED",
  refunded: "REFUNDED",
  cancelled: "CANCELLED",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  checkout_created: "text-yellow-400",
  paid: "text-emerald-400",
  processing: "text-blue-400",
  shipped: "text-indigo-400",
  refunded: "text-purple-400",
  cancelled: "text-red-400",
};

/* ─────────────────────────────────────────────
   MAIN
──────────────────────────────────────────── */

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [lang] = useAdminLang();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts).catch(() => {});
    fetch("/api/orders").then(r => r.json()).then(setOrders).catch(() => {});
  }, []);

  /* ─────────────────────────────
     FILTERED ORDERS
  ───────────────────────────── */

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => {
        const status = normalizeStatus(o);

        const matchStatus =
          statusFilter === "all" || status === statusFilter;

        const matchCountry =
          countryFilter === "all" || o.country === countryFilter;

        const matchSearch =
          o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
          o.id.toLowerCase().includes(search.toLowerCase());

        return matchStatus && matchCountry && matchSearch;
      })
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [orders, search, statusFilter, countryFilter]);

  /* ─────────────────────────────
     STATS
  ───────────────────────────── */

  const stats = {
    total: orders.length,
    paid: orders.filter(o => normalizeStatus(o) === "paid").length,
    pending: orders.filter(o => normalizeStatus(o) === "checkout_created").length,
    refunded: orders.filter(o => normalizeStatus(o) === "refunded").length,
  };

  /* ─────────────────────────────
     UI
  ───────────────────────────── */

  return (
    <div className="pt-16 px-6 md:px-10 text-[14px]">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight">
          {L(lang, "Admin Panel", "Админ панель")}
        </h1>
        <p className="text-zinc-500 mt-2">
          Shopify-style order management system
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          ["Total", stats.total],
          ["Paid", stats.paid],
          ["Pending", stats.pending],
          ["Refunded", stats.refunded],
        ].map(([label, value]) => (
          <div key={label} className="border border-white/10 p-4">
            <p className="text-zinc-500 text-xs">{label}</p>
            <p className="text-2xl font-light">{value}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-6">

        <input
          placeholder="Search orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-black border border-white/10 px-3 py-2 text-sm w-64"
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-black border border-white/10 px-3 py-2"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="checkout_created">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          className="bg-black border border-white/10 px-3 py-2"
        >
          <option value="all">All countries</option>
          <option value="SK">Slovakia</option>
          <option value="CZ">Czech</option>
          <option value="DE">Germany</option>
          <option value="PL">Poland</option>
        </select>

      </div>

      {/* ORDERS */}
      <div className="border border-white/10">

        {filteredOrders.length === 0 ? (
          <div className="p-6 text-zinc-500">No orders</div>
        ) : (
          filteredOrders.map(order => {
            const status = normalizeStatus(order);

            return (
              <div
                key={order.id}
                className="border-b border-white/10 p-5 hover:bg-white/[0.02]"
              >

                {/* TOP ROW */}
                <div className="flex justify-between">

                  <div>
                    <p className="font-mono text-sm">{order.id}</p>
                    <p className="text-zinc-500 text-sm">
                      {order.customerName} · {order.customerEmail}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`font-medium ${STATUS_COLOR[status]}`}>
                      {STATUS_LABEL[status]}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {(order.grandTotal / 100).toFixed(2)} €
                    </p>
                  </div>

                </div>

                {/* INFO GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-zinc-400">

                  <div>
                    <p className="text-zinc-600 text-xs">Country</p>
                    <p>{order.country || "-"}</p>
                  </div>

                  <div>
                    <p className="text-zinc-600 text-xs">City</p>
                    <p>{order.city || "-"}</p>
                  </div>

                  <div>
                    <p className="text-zinc-600 text-xs">Address</p>
                    <p>{order.address || "-"}</p>
                  </div>

                  <div>
                    <p className="text-zinc-600 text-xs">Items</p>
                    <p>{order.items?.length || 0}</p>
                  </div>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* ACTIONS */}
      <div className="mt-8 flex gap-3">
        <Link href="/admin/products" className="border px-4 py-2 text-sm">
          Products
        </Link>
        <Link href="/admin" className="border px-4 py-2 text-sm">
          Refresh
        </Link>
      </div>

    </div>
  );
}
