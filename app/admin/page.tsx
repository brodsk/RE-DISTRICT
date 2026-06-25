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
   ORDER STATUS (fixed logic)
───────────────────────────────────────────── */

type OrderStatus = "paid" | "unpaid" | "failed";

function resolveStatus(order: SavedOrder): OrderStatus {
  // если позже добавишь webhook — будет order.status === "paid"
  if (order.status === "paid") return "paid";

  if (order.status === "cancelled" || order.status === "failed") {
    return "failed";
  }

  // checkout_created / undefined → это НЕ paid
  return "unpaid";
}

const STATUS = {
  paid: {
    label: { en: "PAID", ru: "ОПЛАЧЕН" },
    class: "text-emerald-400 bg-emerald-950/40 border-emerald-800",
    dot: "bg-emerald-400",
  },
  unpaid: {
    label: { en: "UNPAID", ru: "НЕ ОПЛАЧЕН" },
    class: "text-yellow-400 bg-yellow-950/40 border-yellow-800",
    dot: "bg-yellow-400 animate-pulse",
  },
  failed: {
    label: { en: "FAILED", ru: "ОШИБКА" },
    class: "text-red-400 bg-red-950/40 border-red-800",
    dot: "bg-red-500",
  },
};

/* ───────────────────────────────────────────── */

function money(amount?: number) {
  return `€${((amount ?? 0) / 100).toFixed(2)}`;
}

/* ───────────────────────────────────────────── */

function OrderCard({
  order,
  lang,
}: {
  order: SavedOrder;
  lang: "en" | "ru";
}) {
  const status = resolveStatus(order);

  return (
    <div className="border-b border-white/5 py-6 text-[13px]">
      {/* HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">

        {/* CUSTOMER */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
            {L(lang, "Customer", "Клиент")}
          </p>
          <p className="text-white font-medium">
            {order.customerName || "—"}
          </p>
          <p className="text-zinc-500 text-[12px]">
            {order.customerEmail || "—"}
          </p>
        </div>

        {/* LOCATION */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
            {L(lang, "Location", "Локация")}
          </p>
          <p className="text-white">
            {order.city || "—"}
          </p>
          <p className="text-zinc-500 text-[12px]">
            {order.country || "—"}
          </p>
        </div>

        {/* DELIVERY */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
            {L(lang, "Delivery", "Доставка")}
          </p>
          <p className="text-white">
            {order.deliveryMethod === "pickup"
              ? "Packeta Pickup"
              : "Home Delivery"}
          </p>
        </div>

        {/* STATUS + TOTAL */}
        <div className="flex justify-between md:justify-end md:flex-col gap-2">
          <span
            className={`px-2 py-1 text-[10px] border rounded-md w-fit ${STATUS[status].class}`}
          >
            {STATUS[status].label[lang]}
          </span>

          <p className="text-white text-[16px] font-semibold">
            {money(order.grandTotal)}
          </p>
        </div>
      </div>

      {/* PICKUP / ADDRESS */}
      <div className="mt-4 text-zinc-500 text-[12px]">
        {order.deliveryMethod === "pickup" ? (
          <>
            <p>{order.pickupPointName || "—"}</p>
            <p>{order.pickupPointAddress || "—"}</p>
          </>
        ) : (
          <p>{order.address || "—"}</p>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [lang] = useAdminLang();

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts).catch(() => {});
    fetch("/api/store-status").then(r => r.json()).then(setStatus).catch(() => {});
    fetch("/api/orders").then(r => r.json()).then(setOrders).catch(() => {});
  }, []);

  return (
    <div className="pt-10 text-[14px]">

      {/* TITLE */}
      <h1 className="text-4xl font-light mb-10">
        {L(lang, "Dashboard", "Дашборд")}
      </h1>

      {/* ORDERS */}
      <div>
        <p className="text-[11px] text-zinc-500 uppercase mb-4">
          {L(lang, "Recent Orders", "Последние заказы")}
        </p>

        <div className="border-t border-white/10">
          {orders.length === 0 ? (
            <p className="text-zinc-600 py-6">No orders yet</p>
          ) : (
            orders.map(order => (
              <OrderCard key={order.id} order={order} lang={lang} />
            ))
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-10 flex gap-3 flex-wrap">
        <Link className="px-4 py-2 border text-sm" href="/admin/products/new">
          + New Product
        </Link>
        <Link className="px-4 py-2 border text-sm" href="/admin/products">
          All Products
        </Link>
        <Link className="px-4 py-2 border text-sm" href="/shop">
          View Shop
        </Link>
      </div>
    </div>
  );
}
