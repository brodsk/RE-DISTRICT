"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Product, SavedOrder } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

interface StoreStatus {
  kv: boolean;
  blob: boolean;
  local: boolean;
  persistent: boolean;
  productCount: number;
  backend: string;
  message: string;
}

/**
 * Нормализованный статус заказа (единая логика)
 */
type OrderStatus = "paid" | "pending" | "unpaid" | "failed";

function resolveStatus(order: SavedOrder): OrderStatus {
  if (order.status === "paid") return "paid";

  if (order.status === "failed" || order.status === "cancelled") {
    return "failed";
  }

  // checkout_created = создан, но не оплачен
  if (order.status === "checkout_created") return "pending";

  return "unpaid";
}

const STATUS_LABEL: Record<OrderStatus, { en: string; ru: string }> = {
  paid: { en: "PAID", ru: "ОПЛАЧЕН" },
  pending: { en: "PENDING", ru: "ОЖИДАЕТ ОПЛАТЫ" },
  unpaid: { en: "UNPAID", ru: "БЕЗ ОПЛАТЫ" },
  failed: { en: "FAILED", ru: "ОТМЕНЁН" },
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  paid: "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60",
  pending: "bg-yellow-950/60 text-yellow-400 border border-yellow-800/60",
  unpaid: "bg-zinc-900 text-zinc-400 border border-zinc-800",
  failed: "bg-red-950/60 text-red-500 border border-red-800/60",
};

const STATUS_DOT: Record<OrderStatus, string> = {
  paid: "bg-emerald-400",
  pending: "bg-yellow-400 animate-pulse",
  unpaid: "bg-zinc-500",
  failed: "bg-red-500",
};

function OrderCard({ order, lang }: { order: SavedOrder; lang: "en" | "ru" }) {
  const [expanded, setExpanded] = useState(false);
  const status = resolveStatus(order);

  const date = new Date(order.createdAt);

  const total = ((order.grandTotal ?? order.total ?? 0) / 100).toFixed(2);
  const shipping = ((order.shippingPrice ?? 0) / 100).toFixed(2);

  return (
    <div className="border-b border-white/5 text-[12px]">
      <div
        className="py-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 cursor-pointer"
        onClick={() => setExpanded(p => !p)}
      >
        {/* LEFT */}
        <div className="flex flex-wrap gap-6 items-start">

          <div>
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Order</p>
            <p className="font-mono text-white">{order.id}</p>
          </div>

          <div>
            <span className={`px-2 py-1 text-[10px] font-mono ${STATUS_STYLE[status]}`}>
              <span className={`inline-block w-2 h-2 mr-2 ${STATUS_DOT[status]}`} />
              {STATUS_LABEL[status].en}
            </span>
          </div>

          <div>
            <p className="text-[9px] text-zinc-600 uppercase">Customer</p>
            <p className="text-white">{order.customerName || "—"}</p>
            <p className="text-zinc-500 text-[11px]">{order.customerEmail || "—"}</p>
          </div>

          <div>
            <p className="text-[9px] text-zinc-600 uppercase">Location</p>
            <p className="text-zinc-300">
              {order.city || "—"}, {order.country || "—"}
            </p>
          </div>

        </div>

        {/* RIGHT */}
        <div className="text-right">
          <p className="text-[9px] text-zinc-600 uppercase">Total</p>
          <p className="text-xl font-light text-white">€{total}</p>
        </div>
      </div>

      {/* EXPANDED */}
      {expanded && (
        <div className="pb-6 pt-4 grid md:grid-cols-3 gap-6 text-[11px] text-zinc-300">

          <div>
            <p className="text-zinc-600 uppercase text-[9px] mb-2">Customer Info</p>
            <p>Name: {order.customerName || "—"}</p>
            <p>Email: {order.customerEmail || "—"}</p>
            <p>Phone: {order.customerPhone || "—"}</p>
          </div>

          <div>
            <p className="text-zinc-600 uppercase text-[9px] mb-2">Delivery</p>
            <p>{order.deliveryMethod}</p>
            <p>{order.address || order.pickupPointAddress || "—"}</p>
            <p>{order.city}, {order.country}</p>
          </div>

          <div>
            <p className="text-zinc-600 uppercase text-[9px] mb-2">Payment</p>
            <p>Subtotal: €{total}</p>
            <p>Shipping: €{shipping}</p>
            <p className="text-white mt-2">Date: {date.toLocaleString()}</p>
          </div>

        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [lang] = useAdminLang();

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts);
    fetch("/api/orders").then(r => r.json()).then(setOrders);
    fetch("/api/store-status").then(r => r.json()).then(setStatus);
  }, []);

  const filtered =
    filter === "all"
      ? orders
      : orders.filter(o => resolveStatus(o) === filter);

  return (
    <div className="pt-12 text-[13px]">
      <h1 className="text-4xl font-light mb-10">Dashboard</h1>

      {/* ORDERS */}
      <div className="mb-6 flex gap-3">
        {(["all", "paid", "pending", "unpaid", "failed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 border text-[11px] ${
              filter === f ? "bg-white text-black" : "text-white border-white/20"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="border-t border-white/10">
        {filtered.map(o => (
          <OrderCard key={o.id} order={o} lang={lang} />
        ))}
      </div>

      {/* ACTIONS */}
      <div className="mt-10 flex gap-3 text-[11px]">
        <Link href="/admin/products" className="border px-3 py-2">
          Products
        </Link>
        <Link href="/shop" className="border px-3 py-2">
          Shop
        </Link>
      </div>
    </div>
  );
}
