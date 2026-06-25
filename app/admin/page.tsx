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
   ORDER STATUS FIX (REAL BACKEND MATCH)
───────────────────────────────────────────── */

type UIOrderStatus = "paid" | "pending" | "failed" | "unpaid";

function resolveStatus(order: SavedOrder): UIOrderStatus {
  switch (order.status) {
    case "paid":
      return "paid";

    case "checkout_created":
      return "pending";

    case "cancelled":
      return "failed";

    default:
      return "unpaid";
  }
}

/* ───────────────────────────────────────────── */

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [status, setStatus] = useState<StoreStatus | null>(null);
  const [lang] = useAdminLang();

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch("/api/store-status", { cache: "no-store" })
      .then(r => r.json())
      .then(setStatus)
      .catch(() => {});

    fetch("/api/orders", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === "available" || p.status === "limited").length,
    sold: products.filter(p => p.status === "sold").length,
    featured: products.filter(p => p.featured).length,
  };

  return (
    <div className="pt-12 text-[14px]">
      {/* HEADER */}
      <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 mb-2">
        {L(lang, "Overview", "Обзор")}
      </p>

      <h1 className="text-4xl font-light mb-10">
        {L(lang, "Dashboard", "Дашборд")}
      </h1>

      {/* STATUS */}
      {status && (
        <div className="mb-8 border border-white/10 bg-white/[0.02] px-5 py-4">
          <p className="text-[11px] text-zinc-400">
            {status.backend} — {status.message}
          </p>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 mb-10">
        {[
          { l: { en: "Total", ru: "Всего" }, v: stats.total },
          { l: { en: "Active", ru: "Активных" }, v: stats.active },
          { l: { en: "Sold", ru: "Продано" }, v: stats.sold },
          { l: { en: "Featured", ru: "На главной" }, v: stats.featured },
        ].map(s => (
          <div key={s.l.en} className="bg-black p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">
              {L(lang, s.l.en, s.l.ru)}
            </p>
            <p className="text-5xl font-light mt-3">{s.v}</p>
          </div>
        ))}
      </div>

      {/* ORDERS */}
      <div className="mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 mb-5">
          {L(lang, "Recent Orders", "Последние заказы")}
        </p>

        <div className="border-t border-white/10">
          {orders.length === 0 ? (
            <p className="text-zinc-600 py-6">
              {L(lang, "No orders yet", "Заказов пока нет")}
            </p>
          ) : (
            orders.slice(0, 10).map(order => {
              const status = resolveStatus(order);

              return (
                <div
                  key={order.id}
                  className="border-b border-white/5 py-6 grid md:grid-cols-6 gap-4 text-[14px]"
                >
                  {/* CUSTOMER */}
                  <div className="md:col-span-2">
                    <p className="text-white text-[16px] font-medium">
                      {order.customerName || "Unknown"}
                    </p>
                    <p className="text-zinc-500 text-[13px]">
                      {order.customerEmail}
                    </p>
                    <p className="text-zinc-600 text-[12px] mt-1">
                      {order.country || "—"} · {order.city || "—"}
                    </p>
                  </div>

                  {/* STATUS */}
                  <div>
                    <p className="text-zinc-600 text-[11px] uppercase tracking-[0.2em]">
                      Status
                    </p>
                    <p
                      className={`mt-1 text-[13px] ${
                        status === "paid"
                          ? "text-green-400"
                          : status === "pending"
                          ? "text-yellow-400"
                          : status === "failed"
                          ? "text-red-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {status.toUpperCase()}
                    </p>
                  </div>

                  {/* DELIVERY */}
                  <div>
                    <p className="text-zinc-600 text-[11px] uppercase">
                      Delivery
                    </p>
                    <p className="text-zinc-300 text-[13px]">
                      {order.deliveryMethod}
                    </p>
                  </div>

                  {/* TOTAL */}
                  <div>
                    <p className="text-zinc-600 text-[11px] uppercase">
                      Total
                    </p>
                    <p className="text-white text-[16px] font-light">
                      €{((order.grandTotal ?? order.total ?? 0) / 100).toFixed(2)}
                    </p>
                  </div>

                  {/* DATE */}
                  <div>
                    <p className="text-zinc-600 text-[11px] uppercase">
                      Date
                    </p>
                    <p className="text-zinc-400 text-[13px]">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/admin/products" className="text-zinc-400 hover:text-white">
          All Products
        </Link>
        <Link href="/shop" className="text-zinc-400 hover:text-white">
          View Shop
        </Link>
      </div>
    </div>
  );
}
