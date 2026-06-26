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
      return "paid";
    case "packed":
      return "packed";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    case "refunded":
      return "refunded";
    case "checkout_created":
      return "unpaid";
    default:
      return "unpaid";
  }
}

/* ─────────────────────────────
   STATUS UI
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
   TYPES
──────────────────────────── */

type Activity = {
  id: string;
  orderId: string;
  message: string;
  time: number;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<SavedOrder | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const [activity, setActivity] = useState<Activity[]>([]);

  /* ───────────────────────────── */

  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(setOrders);
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  /* ─────────────────────────────
     KPI CALC
  ───────────────────────────── */

  const kpi = useMemo(() => {
    const totalRevenue = orders.reduce(
      (acc, o) => acc + ((o.grandTotal ?? o.total ?? 0) / 100),
      0
    );

    const unpaid = orders.filter(o => normalizeStatus(o) === "unpaid").length;
    const paid = orders.filter(o => normalizeStatus(o) === "paid").length;

    return {
      revenue: totalRevenue,
      orders: orders.length,
      unpaid,
      paid,
    };
  }, [orders]);

  /* ─────────────────────────────
     FILTERED ORDERS
  ───────────────────────────── */

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

      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  /* ─────────────────────────────
     ACTIONS
──────────────────────────── */

  function addActivity(orderId: string, message: string) {
    setActivity(prev => [
      {
        id: crypto.randomUUID(),
        orderId,
        message,
        time: Date.now(),
      },
      ...prev,
    ]);
  }

  async function updateStatus(order: SavedOrder, newStatus: OrderStatus) {
    await fetch("/api/orders/update-status", {
      method: "POST",
      body: JSON.stringify({ id: order.id, status: newStatus }),
    });

    setOrders(prev =>
      prev.map(o =>
        o.id === order.id ? { ...o, status: newStatus as any } : o
      )
    );

    addActivity(order.id, `Status → ${newStatus}`);
  }

  /* ─────────────────────────────
     UI
──────────────────────────── */

  return (
    <div className="flex bg-black text-white min-h-screen font-mono">

      {/* LEFT */}
      <div className="flex-1 p-8">

        {/* KPI */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <KPI label="Revenue" value={`€${kpi.revenue.toFixed(2)}`} />
          <KPI label="Orders" value={kpi.orders} />
          <KPI label="Unpaid" value={kpi.unpaid} />
          <KPI label="Paid" value={kpi.paid} />
        </div>

        {/* SEARCH */}
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

                <p className="mt-2 text-lg">
                  €{((order.grandTotal ?? order.total ?? 0) / 100).toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
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

            {/* PACKETA INFO */}
            {(selected as any).pickupPointName && (
              <div className="mt-4 border border-zinc-700 p-3">
                <p className="text-green-400">Packeta Pickup</p>
                <p>{(selected as any).pickupPointName}</p>
                <p className="text-zinc-500 text-sm">
                  {(selected as any).pickupPointAddress}
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

            {/* TOTAL */}
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

            {/* ACTIVITY LOG */}
            <div className="mt-6">
              <p className="text-zinc-400 mb-2">Activity</p>

              {activity
                .filter(a => a.orderId === selected.id)
                .map(a => (
                  <p key={a.id} className="text-xs text-zinc-500">
                    {new Date(a.time).toLocaleTimeString()} · {a.message}
                  </p>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── */

function KPI({ label, value }: any) {
  return (
    <div className="bg-zinc-900 p-3">
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className="text-xl">{value}</p>
    </div>
  );
}
