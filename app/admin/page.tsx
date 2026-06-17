"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lang] = useAdminLang();

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const stats = {
    total:    products.length,
    active:   products.filter(p => p.status === "available" || p.status === "limited").length,
    sold:     products.filter(p => p.status === "sold").length,
    featured: products.filter(p => p.featured).length,
  };

  const actions = [
    { href: "/admin/products/new", en: "+ New Product",     ru: "+ Новый товар" },
    { href: "/admin/products",     en: "All Products →",    ru: "Все товары →"  },
    { href: "/admin/builder",      en: "Page Builder →",    ru: "Редактор →"    },
    { href: "/shop",               en: "View Shop ↗",       ru: "Открыть магазин ↗", target: "_blank" },
  ];

  return (
    <div className="pt-12">
      <p className="text-[8px] tracking-[0.4em] uppercase text-zinc-600 mb-2">{L(lang,"Overview","Обзор")}</p>
      <h1 className="text-3xl font-light mb-10" style={{ fontFamily: "serif" }}>
        {L(lang,"Dashboard","Дашборд")}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 mb-12">
        {[
          { l: { en:"Total",    ru:"Всего"      }, v: stats.total    },
          { l: { en:"Active",   ru:"Активных"   }, v: stats.active   },
          { l: { en:"Sold",     ru:"Продано"    }, v: stats.sold     },
          { l: { en:"Featured", ru:"На главной" }, v: stats.featured },
        ].map(s => (
          <div key={s.l.en} className="bg-black p-6">
            <p className="text-[8px] tracking-[0.3em] uppercase text-zinc-600 mb-3">{L(lang, s.l.en, s.l.ru)}</p>
            <p className="text-4xl font-light tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.map(a => (
          <Link key={a.href} href={a.href} target={(a as { target?: string }).target}
            className="text-[9px] tracking-[0.25em] uppercase border border-white/10 hover:border-white/40 text-zinc-500 hover:text-white px-5 py-2.5 transition-all">
            {L(lang, a.en, a.ru)}
          </Link>
        ))}
      </div>
    </div>
  );
}
