"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/lang";
import { useCart } from "@/lib/cart";
import { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

const statusLabel: Record<string, string> = {
  available: "Available",
  sold:      "Sold",
  limited:   "Limited",
  concept:   "Concept",
};

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  const available = product.status === "available" || product.status === "limited";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="group">
        {/* Image */}
        <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-zinc-950 overflow-hidden mb-4">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            />
          )}
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={`text-[8px] font-mono tracking-[0.25em] uppercase px-2 py-1 bg-black/70
              ${product.status === "limited" ? "text-white" : "text-zinc-500"}`}>
              {statusLabel[product.status]}
            </span>
          </div>
        </Link>

        {/* Info */}
        <div className="space-y-1 mb-3">
          <p className="text-[9px] font-mono text-zinc-600 tracking-[0.2em] uppercase">
            {product.brand} · {product.year}
          </p>
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-sm font-mono text-white hover:opacity-60 transition-opacity">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs font-mono text-zinc-600 italic">{product.tagline}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-zinc-300 tabular-nums">${product.price}</span>
          {available ? (
            <button
              onClick={() => addItem(product)}
              className="text-[8px] font-mono tracking-[0.25em] uppercase border border-white/15
                         text-zinc-500 hover:border-white/50 hover:text-white px-3 py-1.5
                         transition-all duration-200"
            >
              Add
            </button>
          ) : (
            <span className="text-[8px] font-mono text-zinc-700 tracking-[0.25em] uppercase">
              {statusLabel[product.status]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const { t } = useLang();
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "all");
  const [sort,      setSort]      = useState("default");
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "all") list = list.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(tag => tag.includes(q))
      );
    }
    if (sort === "price-asc")  list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCategory, sort, search]);

  const categories = ["all", "custom", "restored", "curated"];

  return (
    <div className="min-h-screen bg-black pt-24 pb-24 px-6 md:px-12">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-14 md:mb-16 pt-8 md:pt-10"
        >
          <p className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono mb-3">
            {t("Current Selection", "Текущий выбор")}
          </p>
          <h1
            className="font-light text-white leading-none"
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "clamp(2rem, 7vw, 5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            {t("Shop", "Каталог")}
          </h1>
        </motion.div>

        {/* Controls */}
        <div className="border-y border-white/5 py-4 mb-10 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex gap-5 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[9px] tracking-[0.3em] uppercase font-mono shrink-0 pb-0.5 transition-colors
                  ${activeCategory === cat
                    ? "text-white border-b border-white"
                    : "text-zinc-600 hover:text-zinc-300"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={t("Search", "Поиск") + "..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border border-white/8 focus:border-white/30 outline-none
                         px-3 py-2 text-[10px] font-mono text-white placeholder:text-zinc-700
                         w-36 transition-colors"
            />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-black border border-white/8 outline-none px-3 py-2
                         text-[10px] font-mono text-zinc-500 cursor-pointer"
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
            </select>
          </div>
        </div>

        {/* Count */}
        <p className="text-[9px] font-mono text-zinc-700 tracking-wider mb-8">
          {loading ? "—" : `${filtered.length} piece${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-24 text-zinc-700 font-mono text-xs tracking-widest">Loading…</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-zinc-700 font-mono text-xs tracking-widest">Nothing found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ShopContent />
    </Suspense>
  );
}
