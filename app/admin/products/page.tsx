"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

const statColor: Record<string, string> = {
  available: "text-white", limited: "text-zinc-300", sold: "text-zinc-600", concept: "text-zinc-700",
};
const statL: Record<string, { en: string; ru: string }> = {
  available: { en:"Available",    ru:"В наличии"      },
  limited:   { en:"Limited",      ru:"Лимитировано"   },
  sold:      { en:"Sold",         ru:"Продано"        },
  concept:   { en:"Concept",      ru:"Концепт"        },
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [lang] = useAdminLang();

  const load = () => {
    setLoading(true);
    fetch("/api/products", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const del = async (id: string, name: string) => {
    if (!confirm(L(lang, `Delete "${name}"?`, `Удалить "${name}"?`))) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE", headers: { "x-admin-password": "redistrict2026" } });
    load();
  };

  return (
    <div className="pt-12">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[8px] tracking-[0.4em] uppercase text-zinc-600 mb-2">{L(lang,"Manage","Управление")}</p>
          <h1 className="text-3xl font-light" style={{ fontFamily: "serif" }}>{L(lang,"Products","Товары")}</h1>
        </div>
        <Link href="/admin/products/new"
          className="text-[9px] tracking-[0.3em] uppercase bg-white text-black px-5 py-2.5 hover:bg-zinc-200 transition-colors">
          + {L(lang,"New","Новый")}
        </Link>
      </div>

      {loading ? (
        <p className="text-zinc-700 text-xs tracking-widest">{L(lang,"Loading…","Загрузка…")}</p>
      ) : (
        <div className="border-t border-white/5">
          {products.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-zinc-700 text-xs font-mono tracking-widest mb-4">{L(lang,"No products.","Товаров нет.")}</p>
              <Link href="/admin/products/new" className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-600 hover:text-white transition-colors">
                {L(lang,"Create first →","Создать первый →")}
              </Link>
            </div>
          )}
          {products.map(p => (
            <div key={p.id} className="border-b border-white/5 py-4 flex items-center gap-4">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.status === "available" || p.status === "limited" ? "bg-white/40" : "bg-zinc-800"}`} />
              {p.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt="" className="w-10 h-10 object-cover shrink-0 border border-white/5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-sm text-white font-mono truncate">{p.brand} {p.name}</span>
                  {p.featured && (
                    <span className="text-[7px] tracking-[0.25em] uppercase text-zinc-600 border border-white/10 px-1.5 py-0.5">
                      {L(lang,"Featured","На главной")}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider">{p.category}</span>
                  <span className="text-zinc-800">·</span>
                  <span className={`text-[8px] font-mono uppercase tracking-wider ${statColor[p.status]}`}>
                    {L(lang, statL[p.status]?.en ?? p.status, statL[p.status]?.ru ?? p.status)}
                  </span>
                  <span className="text-zinc-800">·</span>
                  <span className="text-[8px] font-mono text-zinc-500 tabular-nums">€{p.price}</span>
                </div>
              </div>
              <div className="flex gap-4 shrink-0">
                <Link href={`/product/${p.slug}`} target="_blank"
                  className="text-[8px] tracking-wider uppercase font-mono text-zinc-700 hover:text-white transition-colors">
                  {L(lang,"View ↗","Смотреть ↗")}
                </Link>
                <Link href={`/admin/products/${p.id}`}
                  className="text-[8px] tracking-wider uppercase font-mono text-zinc-500 hover:text-white transition-colors">
                  {L(lang,"Edit","Ред.")}
                </Link>
                <button onClick={() => del(p.id, `${p.brand} ${p.name}`)}
                  className="text-[8px] tracking-wider uppercase font-mono text-zinc-800 hover:text-red-700 transition-colors">
                  {L(lang,"Delete","Удалить")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
