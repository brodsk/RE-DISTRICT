"use client";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";
import Link from "next/link";

const statusLabel: Record<string, { en: string; ru: string }> = {
  available: { en: "Available",  ru: "В наличии" },
  limited:   { en: "Limited",    ru: "Лимитировано" },
  sold:      { en: "Sold",       ru: "Продано" },
  concept:   { en: "Concept",    ru: "Концепт" },
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { t } = useLang();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState(0);
  const [added,   setAdded]   = useState(false);

  useEffect(() => {
    fetch(`/api/products?t=${Date.now()}`, {
      cache:   "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then(r => r.json())
      .then((list: Product[]) => {
        const found = list.find(p => p.slug === slug);
        setProduct(found ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-black" />;
  if (!product) return notFound();

  const handleAdd = () => {
    addItem({ productId: product.id, name: `${product.brand} ${product.name}`, price: product.price, image: product.images[0], slug: product.slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const canBuy = product.status === "available" || product.status === "limited";

  return (
    <div className="min-h-screen bg-black pt-24 pb-24">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 py-4 border-b border-white/5 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-700 tracking-wider">
          <Link href="/shop" className="hover:text-white transition-colors">{t("Shop","Каталог")}</Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-zinc-500">{product.name}</span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Images */}
          <div>
            <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="relative aspect-square bg-zinc-950 overflow-hidden mb-3">
              {product.images[active]
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={product.images[active]} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <span className="text-zinc-800 font-mono text-xs">No image</span>
                  </div>
              }
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActive(i)}
                    className={`w-16 h-16 overflow-hidden border transition-all ${active === i ? "border-white/50" : "border-white/10 opacity-50 hover:opacity-80"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 border border-white/10 px-2.5 py-1">
                {product.category}
              </span>
              <span className="text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600">
                {t(statusLabel[product.status]?.en, statusLabel[product.status]?.ru)}
              </span>
            </div>

            <p className="text-[9px] font-mono text-zinc-600 tracking-wider mb-1">{product.brand} · {product.year}</p>
            <h1 className="font-light text-white mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}>
              {product.name}
            </h1>
            <p className="text-sm font-mono text-zinc-500 italic mb-6">{product.tagline}</p>

            <div className="border-t border-white/5 pt-5 mb-6">
              <p className="text-2xl font-mono text-white tabular-nums">€{product.price}</p>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-8 font-mono" style={{ whiteSpace: "pre-line" }}>{product.description}</p>

            {canBuy ? (
              <button onClick={handleAdd}
                className={`w-full text-[10px] tracking-[0.35em] uppercase font-mono py-4 transition-all duration-200
                  ${added ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"}`}>
                {added ? t("✓ Added","✓ Добавлено") : t("Add to Cart","В корзину")}
              </button>
            ) : (
              <div className="w-full text-[10px] tracking-[0.35em] uppercase font-mono py-4 text-center border border-white/10 text-zinc-600">
                {t(statusLabel[product.status]?.en, statusLabel[product.status]?.ru)}
              </div>
            )}

            {/* Story */}
            {product.story && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-3">{t("Story","История")}</p>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed italic" style={{ whiteSpace: "pre-line" }}>{product.story}</p>
              </div>
            )}

            {/* Specs */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-4">{t("Specifications","Характеристики")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="border-b border-white/5 pb-3">
                      <p className="text-[7px] tracking-[0.3em] uppercase font-mono text-zinc-700 mb-1 capitalize">{k}</p>
                      <p className="text-[10px] font-mono text-white">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
