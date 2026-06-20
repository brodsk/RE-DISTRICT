"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Product, ProductCategory } from "@/lib/types";
import { useLang } from "@/lib/lang";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useCart } from "@/lib/cart";

const cats = [
  { v: "all",      en: "All",       ru: "Все"         },
  { v: "custom",   en: "Custom",    ru: "Кастом"      },
  { v: "restored", en: "Restored",  ru: "Реставрация" },
  { v: "curated",  en: "Curated",   ru: "Подбор"      },
] as const;

const sorts = [
  { v: "default",    en: "Featured",        ru: "Избранное"       },
  { v: "price-asc",  en: "Price: Low–High", ru: "Цена: от низкой" },
  { v: "price-desc", en: "Price: High–Low", ru: "Цена: от высокой"},
  { v: "year-desc",  en: "Newest first",    ru: "Сначала новые"   },
];

function ProductCard({ p, index }: { p: Product; index: number }) {
  const { addItem } = useCart();
  const { t } = useLang();
  const statusLabel: Record<string, { en: string; ru: string }> = {
    available: { en: "Available", ru: "В наличии" },
    limited:   { en: "Limited",   ru: "Лимитировано" },
    sold:      { en: "Sold",      ru: "Продано" },
    concept:   { en: "Concept",   ru: "Концепт" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6, delay: index * 0.06 }}>
      <div className="group">
        <Link href={`/product/${p.slug}`}>
          <div className="relative overflow-hidden bg-zinc-950 aspect-square mb-4">
            {p.images[0]
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
              : <div className="w-full h-full flex items-center justify-center">
                  <span className="text-zinc-800 font-mono text-xs">No image</span>
                </div>
            }
            <div className="absolute top-3 left-3">
              <span className="text-[8px] tracking-[0.25em] uppercase font-mono text-zinc-400 bg-black/70 px-2 py-1">
                {p.category}
              </span>
            </div>
            {p.status === "sold" && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-[9px] tracking-[0.3em] uppercase font-mono text-white/50 border border-white/20 px-4 py-2">
                  {t("Sold","Продано")}
                </span>
              </div>
            )}
          </div>
        </Link>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="text-[9px] font-mono text-zinc-600 tracking-wider mb-0.5">{p.brand} · {p.year}</p>
            <Link href={`/product/${p.slug}`}>
              <h3 className="text-sm font-mono text-white hover:opacity-60 transition-opacity">{p.name}</h3>
            </Link>
          </div>
          <p className="text-sm font-mono text-zinc-300 shrink-0 tabular-nums">€{p.price}</p>
        </div>
        <p className="text-[9px] font-mono text-zinc-700 mb-3">
          {t(statusLabel[p.status]?.en ?? p.status, statusLabel[p.status]?.ru ?? p.status)}
        </p>
        {p.status !== "sold" && p.status !== "concept" && (
          <button
            onClick={() => addItem({ productId: p.id, name: `${p.brand} ${p.name}`, price: p.price, image: p.images[0], slug: p.slug })}
            className="w-full text-[9px] tracking-[0.3em] uppercase font-mono border border-white/10
                       hover:border-white/50 hover:bg-white hover:text-black text-zinc-500
                       py-2.5 transition-all duration-200">
            {t("Add to Cart","В корзину")}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ShopContent() {
  const sp = useSearchParams();
  const { t } = useLang();
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [cat,      setCat]        = useState<string>(sp.get("category") ?? "all");
  const [sort,     setSort]       = useState("default");
  const [search,   setSearch]     = useState("");

  useEffect(() => {
    fetch(`/api/products?t=${Date.now()}`, {
      cache:   "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then(r => r.json()).then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = cat === "all" ? products : products.filter(p => p.category === cat);
    if (search) list = list.filter(p =>
      `${p.brand} ${p.name} ${p.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase()));
    if (sort === "price-asc")  list = [...list].sort((a,b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a,b) => b.price - a.price);
    if (sort === "year-desc")  list = [...list].sort((a,b) => b.year - a.year);
    return list;
  }, [products, cat, sort, search]);

  const inp = "bg-transparent border border-white/10 hover:border-white/20 focus:border-white/40 outline-none px-4 py-2 text-xs text-white font-mono placeholder:text-zinc-800 transition-colors";

  return (
    <div className="min-h-screen bg-black pt-28 md:pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-screen-xl mx-auto">
        <AnimatedSection className="mb-12">
          <p className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono mb-3">
            {t("Current Selection","Текущий выбор")}
          </p>
          <h1 className="font-mono font-light text-white leading-none"
            style={{ fontSize: "clamp(2rem, 6vw, 5rem)", letterSpacing: "-0.02em" }}>
            {t("Shop.","Каталог.")}
          </h1>
        </AnimatedSection>

        {/* Controls */}
        <div className="border-y border-white/5 py-4 mb-10 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-5 overflow-x-auto">
            {cats.map(c => (
              <button key={c.v} onClick={() => setCat(c.v)}
                className={`text-[9px] tracking-[0.25em] uppercase font-mono transition-colors shrink-0
                  ${cat === c.v ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}>
                {t(c.en, c.ru)}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <input placeholder={t("Search…","Поиск…")} value={search}
              onChange={e => setSearch(e.target.value)} className={inp + " w-36"} />
            <select value={sort} onChange={e => setSort(e.target.value)}
              className={inp + " bg-black cursor-pointer"}>
              {sorts.map(s => <option key={s.v} value={s.v}>{t(s.en, s.ru)}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-zinc-700 font-mono text-xs tracking-widest">{t("Loading…","Загрузка…")}</p>
        ) : filtered.length === 0 ? (
          <p className="text-zinc-700 font-mono text-xs tracking-widest py-16 text-center">
            {t("Nothing found.","Ничего не найдено.")}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return <Suspense fallback={<div className="min-h-screen bg-black" />}><ShopContent /></Suspense>;
}
