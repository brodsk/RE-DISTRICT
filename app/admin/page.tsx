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

const ALL_STATUSES: OrderStatus[] = [
  "checkout_created",
  "unpaid",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

function resolveStatus(order: SavedOrder): OrderStatus {
  switch (order.status) {
    case "paid":
    case "packed":
    case "shipped":
    case "delivered":
    case "cancelled":
    case "refunded":
    case "checkout_created":
    case "unpaid":
      return order.status;
    default:
      return "unpaid";
  }
}

/* ─────────────────────────────────────────────
   STATUS UI
──────────────────────────────────────────── */

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  unpaid:           { label: "UNPAID",    className: "text-orange-400" },
  paid:             { label: "PAID",      className: "text-emerald-400" },
  packed:           { label: "PACKED",    className: "text-blue-400" },
  shipped:          { label: "SHIPPED",   className: "text-cyan-400" },
  delivered:        { label: "DELIVERED", className: "text-white" },
  cancelled:        { label: "CANCELLED", className: "text-red-400" },
  refunded:         { label: "REFUNDED",  className: "text-yellow-400" },
  checkout_created: { label: "NEW",       className: "text-zinc-500" },
};

/* ─────────────────────────────────────────────
   ADMIN DASHBOARD
──────────────────────────────────────────── */

export default function AdminDashboard() {
  const [orders, setOrders]     = useState<SavedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lang]                  = useAdminLang();
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────

  const reload = () => {
    fetch("/api/orders", { cache: "no-store" })
      .then(r => r.json())
      .then(setOrders)
      .catch(console.error);
  };

  useEffect(() => {
    reload();
    fetch("/api/products").then(r => r.json()).then(setProducts).catch(() => {});
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-status", id, status }),
      });
      // Optimistic update
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, status: status as SavedOrder["status"] } : o))
      );
    } catch (e) {
      console.error("updateStatus failed:", e);
    } finally {
      setUpdating(null);
    }
  };

  const refund = async (id: string) => {
    if (!confirm("Mark this order as REFUNDED?")) return;
    setUpdating(id);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refund", id }),
      });
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, status: "refunded" } : o))
      );
    } catch (e) {
      console.error("refund failed:", e);
    } finally {
      setUpdating(null);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return orders.filter(order => {
      const status = resolveStatus(order);
      const text = [
        order.customerName,
        order.customerEmail,
        order.country,
        order.city,
        order.address,
        order.id,
        order.pickupPointName,
        order.pickupPointAddress,
      ].join(" ").toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-10 bg-black text-white min-h-screen font-mono text-[16px]">

      {/* HEADER */}
      <h1 className="text-4xl font-light mb-2">RE:DISTRICT ADMIN</h1>
      <p className="text-zinc-500 mb-6">Orders control panel</p>

      {/* CONTROLS */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <input
          className="bg-zinc-900 px-3 py-2"
          placeholder="Search orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="bg-zinc-900 px-3 py-2"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as OrderStatus | "all")}
        >
          <option value="all">All</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>

        <button
          className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-sm transition-colors"
          onClick={reload}
        >
          ↻ Refresh
        </button>

        <span className="text-zinc-600 text-sm">{filtered.length} orders</span>
      </div>

      {/* ORDERS */}
      <div className="space-y-5">
        {filtered.map(order => {
          const status = resolveStatus(order);
          const isUpdating = updating === order.id;
          const isPickup = order.deliveryMethod === "pickup";

          return (
            <div key={order.id} className="border border-zinc-800 p-5">

              {/* HEADER ROW */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-2xl truncate">
                    {order.customerName || "Unknown customer"}
                  </p>

                  <p className="text-zinc-400 text-sm mt-0.5">
                    {order.customerEmail || "no-email"}
                    {order.country ? ` · ${order.country}` : ""}
                    {order.city ? ` · ${order.city}` : ""}
                  </p>

                  {/* DELIVERY ADDRESS or PACKETA PICKUP */}
                  {isPickup ? (
                    <div className="mt-2 border-l-2 border-zinc-700 pl-3">
                      <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">
                        📦 Packeta Pickup Point
                      </p>
                      {order.pickupPointName && (
                        <p className="text-zinc-300 text-xs">{order.pickupPointName}</p>
                      )}
                      {order.pickupPointAddress && (
                        <p className="text-zinc-600 text-xs">{order.pickupPointAddress}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-zinc-600 text-xs mt-1">
                      {order.address || "No address provided"}
                    </p>
                  )}

                  <p className="text-zinc-700 text-xs mt-1">
                    {order.customerPhone || "No phone"}
                  </p>

                  <p className="text-zinc-800 text-xs mt-1">
                    {order.id} · {new Date(order.createdAt).toLocaleString("sk-SK")}
                  </p>
                </div>

                {/* STATUS BADGE */}
                <div className={`${STATUS[status].className} text-right shrink-0`}>
                  <div className="text-lg font-bold">{STATUS[status].label}</div>
                </div>
              </div>

              {/* ITEMS */}
              <div className="mt-3 text-zinc-300 text-sm">
                {(order.items ?? []).map((i, idx) => (
                  <div key={idx}>• {i.name} × {i.quantity}</div>
                ))}
              </div>

              {/* TOTAL — prices already divided by 100 in lib/orders.ts */}
              <div className="mt-4 text-xl">
                €{(order.grandTotal ?? order.total ?? 0).toFixed(2)}
                {order.shippingPrice > 0 && (
                  <span className="text-zinc-600 text-sm ml-2">
                    (shipping €{order.shippingPrice.toFixed(2)})
                  </span>
                )}
              </div>

              {/* STATUS CONTROLS */}
              <div className="mt-4 flex flex-wrap gap-2">
                {ALL_STATUSES.filter(s => s !== "checkout_created" && s !== status).map(s => (
                  <button
                    key={s}
                    disabled={isUpdating}
                    onClick={() => updateStatus(order.id, s)}
                    className="px-3 py-1 text-xs bg-zinc-900 border border-zinc-700 hover:border-zinc-400 disabled:opacity-40 transition-colors"
                  >
                    → {s.toUpperCase()}
                  </button>
                ))}

                {status !== "refunded" && (
                  <button
                    disabled={isUpdating}
                    onClick={() => refund(order.id)}
                    className="px-3 py-1 text-xs bg-zinc-900 border border-yellow-900 text-yellow-500 hover:border-yellow-400 disabled:opacity-40 transition-colors ml-auto"
                  >
                    REFUND
                  </button>
                )}
              </div>

              {isUpdating && (
                <p className="text-zinc-600 text-xs mt-2">Saving…</p>
              )}

            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-zinc-700 text-sm">No orders found.</p>
        )}
      </div>
    </div>
  );
}
