"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

interface StoreStatus {
  kv:           boolean;
  blob:         boolean;
  local:        boolean;
  persistent:   boolean;
  productCount: number;
  backend:      string;
  message:      string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status,   setStatus]   = useState<StoreStatus | null>(null);
  const [lang] = useAdminLang();

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});

    fetch("/api/store-status", { cache: "no-store" })
      .then(r => r.json()).then(setStatus).catch(() => {});
  }, []);

  const stats = {
    total:    products.length,
    active:   products.filter(p => p.status === "available" || p.status === "limited").length,
    sold:     products.filter(p => p.status === "sold").length,
    featured: products.filter(p => p.featured).length,
  };

  return (
    <div className="pt-12">
      <p className="text-[8px] tracking-[0.4em] uppercase text-zinc-600 mb-2">{L(lang,"Overview","Обзор")}</p>
      <h1 className="text-3xl font-light mb-8" style={{ fontFamily: "serif" }}>
        {L(lang,"Dashboard","Дашборд")}
      </h1>

      {/* Storage status banner */}
      {status && (
        <div className={`mb-8 border px-5 py-4 ${
          status.persistent
            ? "border-white/10 bg-white/[0.02]"
            : "border-red-900/50 bg-red-950/20"
        }`}>
          <div className="flex items-start gap-3">
            <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${status.persistent ? "bg-white/40" : "bg-red-700"} animate-pulse`} />
            <div>
              <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-zinc-500 mb-1">
                {L(lang,"Storage Backend","Хранилище")}:{" "}
                <span className="text-white">{status.backend}</span>
              </p>
              <p className="text-[9px] font-mono text-zinc-600 leading-relaxed">
                {status.message}
              </p>
              {!status.persistent && (
                <p className="text-[9px] font-mono text-red-600 mt-2 leading-relaxed">
                  {L(lang,
                    "Go to Vercel Dashboard → Storage → Create KV Database → copy KV_REST_API_URL and KV_REST_API_TOKEN to Environment Variables.",
                    "Vercel Dashboard → Storage → Create KV Database → скопируйте KV_REST_API_URL и KV_REST_API_TOKEN в Environment Variables."
                  )}
                </p>
              )}
              {status.blob && !status.kv && (
                <p className="text-[9px] font-mono text-zinc-500 mt-1">
                  {L(lang,"Blob storage active — products persist but read speed may vary.","Blob storage активен — товары сохраняются, но скорость чтения может варьироваться.")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 mb-10">
        {[
          { l:{en:"Total",ru:"Всего"},      v: stats.total    },
          { l:{en:"Active",ru:"Активных"},  v: stats.active   },
          { l:{en:"Sold",ru:"Продано"},      v: stats.sold     },
          { l:{en:"Featured",ru:"На главной"}, v: stats.featured },
        ].map(s => (
          <div key={s.l.en} className="bg-black p-6">
            <p className="text-[8px] tracking-[0.3em] uppercase text-zinc-600 mb-3">{L(lang,s.l.en,s.l.ru)}</p>
            <p className="text-4xl font-light tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {[
          { href:"/admin/products/new", en:"+ New Product",     ru:"+ Новый товар"         },
          { href:"/admin/products",     en:"All Products →",    ru:"Все товары →"           },
          { href:"/admin/builder",      en:"Page Builder →",    ru:"Редактор →"             },
          { href:"/shop",               en:"View Shop ↗",       ru:"Открыть магазин ↗"      },
        ].map(a => (
          <Link key={a.href} href={a.href}
            target={a.href === "/shop" ? "_blank" : undefined}
            className="text-[9px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/40 text-zinc-500 hover:text-white px-5 py-2.5 transition-all font-mono">
            {L(lang,a.en,a.ru)}
          </Link>
        ))}
      </div>
    </div>
  );
}
