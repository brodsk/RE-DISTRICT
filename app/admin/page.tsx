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

/* ─────────────────────────────────────────────
   ORDER STATUS LOGIC
───────────────────────────────────────────── */

type OrderStatus = "paid" | "pending" | "failed";

function resolveStatus(order: SavedOrder): OrderStatus {
  if (order.status === "paid") return "paid";
  if (order.status === "cancelled") return "failed";
  return "pending";
}

/* ─────────────────────────────────────────────
   ORDER CARD
───────────────────────────────────────────── */

function OrderCard({
  order,
  lang,
}: {
  order: SavedOrder;
  lang: "en" | "ru";
}) {
  const [expanded, setExpanded] = useState(false);
  const status = resolveStatus(order);

  const STATUS = {
    paid: {
      label: { en: "PAID", ru: "ОПЛАЧЕН" },
      class: "text-emerald-400",
    },
    pending: {
      label: { en: "PENDING", ru: "ОЖИДАЕТ" },
      class: "text-yellow-400",
    },
    failed: {
      label: { en: "FAILED", ru: "ОШИБКА" },
      class: "text-red-500",
    },
  };

  return (
    <div className="border-b border-white/5 py-5">
      {/* HEADER */}
      <div
        className="grid md:grid-cols-4 gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
            {L(lang, "Customer", "Клиент")}
          </p>
          <p className="text-sm font-mono text-white">
            {order.customerName || order.customerEmail || "—"}
          </p>
        </div>

        <div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
            {L(lang, "Status", "Статус")}
          </p>
          <p className={`text-sm font-mono ${STATUS[status].class}`}>
            {L(lang, STATUS[status].label.en, STATUS[status].label.ru)}
          </p>
        </div>

        <div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
            {L(lang, "Delivery", "Доставка")}
          </p>
          <p className="text-sm font-mono text-zinc-300">
            {order.deliveryMethod === "pickup"
              ? "Packeta Pickup"
              : "Home Delivery"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
            {L(lang, "Total", "Итого")}
          </p>
          <p className="text-sm font-mono text-white">
            €{((order.grandTotal ?? order.total ?? 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* EXPANDED */}
      {expanded && (
        <div className="mt-5 grid md:grid-cols-3 gap-6 text-[10px] font-mono text-zinc-400">
          <div>
            <p className="text-zinc-600 mb-2 uppercase tracking-widest">
              {L(lang, "Customer Info", "Клиент")}
            </p>
            <p>Name: {order.customerName || "—"}</p>
            <p>Email: {order.customerEmail || "—"}</p>
            <p>Phone: {order.customerPhone || "—"}</p>
          </div>

          <div>
            <p className="text-zinc-600 mb-2 uppercase tracking-widest">
              {L(lang, "Delivery", "Доставка")}
            </p>
            {order.deliveryMethod === "pickup" ? (
              <>
                <p>Pickup: {order.pickupPointName || "—"}</p>
                <p>{order.pickupPointAddress || "—"}</p>
                <p>ID: {order.pickupPointId || "—"}</p>
              </>
            ) : (
              <>
                <p>City: {order.city || "—"}</p>
                <p>Address: {order.address || "—"}</p>
              </>
            )}
          </div>

          <div>
            <p className="text-zinc-600 mb-2 uppercase tracking-widest">
              Items
            </p>
            {(order.items || []).map((i, idx) => (
              <p key={idx}>
                {i.name} × {i.quantity}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [lang] = useAdminLang();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch("/api/store-status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  return (
    <div className="pt-12">
      <h1 className="text-3xl font-light mb-8 font-serif">Dashboard</h1>

      {/* STATUS */}
      {status && (
        <div className="mb-8 border border-white/10 p-4 text-[10px] text-zinc-400">
          {status.backend} — {status.message}
        </div>
      )}

      {/* ORDERS */}
      <div className="mb-10">
        <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-4">
          {L(lang, "Recent Orders", "Последние заказы")}
        </p>

        <div className="border-t border-white/5">
          {orders.length === 0 ? (
            <p className="text-zinc-600 text-sm py-5">No orders yet</p>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} lang={lang} />
            ))
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/admin/products" className="text-xs text-zinc-400">
          Products
        </Link>
        <Link href="/shop" className="text-xs text-zinc-400">
          Shop
        </Link>
      </div>
    </div>
  );
}
