"use client";

import { useEffect, useMemo, useState } from "react";
import { Product, SavedOrder } from "@/lib/types";
import { useAdminLang } from "@/app/admin/layout";
import { createClient } from '@supabase/supabase-js';  // ← Добавь

/* ─────────────────────────────────────────────
   Realtime Supabase Client
──────────────────────────────────────────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ─────────────────────────────────────────────
   ORDER STATUS
──────────────────────────────────────────── */

type OrderStatus = "checkout_created" | "unpaid" | "paid" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";

const ALL_STATUSES: OrderStatus[] = ["checkout_created", "unpaid", "paid", "packed", "shipped", "delivered", "cancelled", "refunded"];

function resolveStatus(order: SavedOrder): OrderStatus {
  return (order.status as OrderStatus) || "unpaid";
}

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

export default function AdminDashboard() {
  const [orders, setOrders]     = useState<SavedOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lang]                  = useAdminLang();
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  // ── Load initial data ──────────────────────────────────────────────────────
  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
  };

  useEffect(() => {
    loadOrders();

    // Realtime subscription
    const channel = supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          console.log('Change received!', payload);
          loadOrders(); // Перезагружаем список
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
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
      await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('id', id);
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

  return (
    <div className="p-10 bg-black text-white min-h-screen font-mono text-[16px]">
      {/* HEADER */}
      <h1 className="text-4xl font-light mb-2">RE:DISTRICT ADMIN</h1>
      <p className="text-zinc-500 mb-6">Orders control panel • Realtime</p>

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
          onClick={loadOrders}
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
              {/* ... (остальной JSX заказа остаётся без изменений) ... */}
              {/* HEADER ROW, ITEMS, TOTAL, STATUS CONTROLS — всё как было */}
              
              {/* (Я могу дать полный код, если нужно, но для экономии места оставил структуру) */}

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
