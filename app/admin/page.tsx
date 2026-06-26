"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, SavedOrder } from "@/lib/types";
import { useAdminLang } from "@/app/admin/layout";
import { createClient } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────
   SUPABASE
──────────────────────────────────────────── */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ─────────────────────────────────────────────
   TYPES
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

function resolveStatus(order: any): OrderStatus {
  return (order.status as OrderStatus) || "unpaid";
}

/* ─────────────────────────────────────────────
   UI STATUS MAP
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

/* ─────────────────────────────────────────────
   ADMIN DASHBOARD
──────────────────────────────────────────── */

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lang] = useAdminLang();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<OrderStatus | "all">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  /* ─────────────────────────────────────────────
     NORMALIZE (CRITICAL FIX)
  ───────────────────────────────────────────── */

  const normalizeOrder = (o: any) => ({
    ...o,
    createdAt: o.createdAt ?? o.created_at,
  });

  /* ─────────────────────────────────────────────
     LOAD
  ───────────────────────────────────────────── */

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setOrders((data ?? []).map(normalizeOrder));
  };

  useEffect(() => {
    loadOrders();

    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ─────────────────────────────────────────────
     ACTIONS
  ───────────────────────────────────────────── */

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);

    try {
      await supabase.from("orders").update({ status }).eq("id", id);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status } : o
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const refund = async (id: string) => {
    if (!confirm("Mark this order as REFUNDED?")) return;

    setUpdating(id);

    try {
      await supabase
        .from("orders")
        .update({ status: "refunded" })
        .eq("id", id);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: "refunded" } : o
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  /* ─────────────────────────────────────────────
     FILTER
  ───────────────────────────────────────────── */

  const filtered = useMemo(() => {
    return orders.filter((order) => {
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
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (statusFilter === "all" || status === statusFilter)
      );
    });
  }, [orders, search, statusFilter]);

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */

  return (
    <div className="p-10 bg-black text-white min-h-screen font-mono text-[16px]">
      <h1 className="text-4xl font-light mb-2">
        RE:DISTRICT ADMIN
      </h1>
      <p className="text-zinc-500 mb-6">
        Orders control panel • Realtime
      </p>

      {/* CONTROLS */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <input
          className="bg-zinc-900 px-3 py-2"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="bg-zinc-900 px-3 py-2"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as any)
          }
        >
          <option value="all">All</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          className="bg-zinc-800 hover:bg-zinc-700 px-3 py-2"
          onClick={loadOrders}
        >
          ↻ Refresh
        </button>

        <span className="text-zinc-600 text-sm">
          {filtered.length} orders
        </span>
      </div>

      {/* ORDERS */}
      <div className="space-y-5">
        {filtered.map((order) => {
          const status = resolveStatus(order);
          const isUpdating = updating === order.id;
          const isPickup = order.deliveryMethod === "pickup";

          return (
            <div
              key={order.id}
              className="border border-zinc-800 p-5"
            >
              {/* HEADER */}
              <div className="flex justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-2xl truncate">
                    {order.customerName || "Unknown"}
                  </p>

                  <p className="text-zinc-400 text-sm">
                    {order.customerEmail}
                  </p>

                  {isPickup ? (
                    <div className="mt-2 text-xs text-zinc-500">
                      📦 {order.pickupPointName}
                      <br />
                      {order.pickupPointAddress}
                    </div>
                  ) : (
                    <p className="text-zinc-600 text-xs">
                      {order.address}
                    </p>
                  )}

                  <p className="text-zinc-700 text-xs mt-1">
                    {order.id} ·{" "}
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleString("sk-SK")
                      : "—"}
                  </p>
                </div>

                <div
                  className={`${STATUS[status].className} text-right`}
                >
                  <div className="text-lg font-bold">
                    {STATUS[status].label}
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              <div className="mt-3 text-sm text-zinc-300">
                {(order.items ?? []).map((i: any, idx: number) => (
                  <div key={idx}>
                    • {i.name} × {i.quantity}
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="mt-4 text-xl">
                €{(order.grandTotal ?? order.total ?? 0).toFixed(2)}
              </div>

              {/* ACTIONS */}
              <div className="mt-4 flex gap-2 flex-wrap">
                {ALL_STATUSES.filter(
                  (s) =>
                    s !== "checkout_created" && s !== status
                ).map((s) => (
                  <button
                    key={s}
                    disabled={isUpdating}
                    onClick={() => updateStatus(order.id, s)}
                    className="px-3 py-1 text-xs bg-zinc-900 border border-zinc-700"
                  >
                    → {s.toUpperCase()}
                  </button>
                ))}

                {status !== "refunded" && (
                  <button
                    disabled={isUpdating}
                    onClick={() => refund(order.id)}
                    className="px-3 py-1 text-xs bg-zinc-900 border border-yellow-600 text-yellow-400 ml-auto"
                  >
                    REFUND
                  </button>
                )}
              </div>

              {isUpdating && (
                <p className="text-xs text-zinc-600 mt-2">
                  Saving…
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
