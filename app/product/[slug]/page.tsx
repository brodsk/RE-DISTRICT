"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";

const statusLabel: Record<string, string> = {
  available: "Available",
  sold:      "Sold",
  limited:   "Limited",
  concept:   "Concept",
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product,  setProduct]  = useState<Product | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const { addItem, setOpen }    = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then((data: Product[]) => {
        const found = data.find(p => p.slug === slug) ?? null;
        setProduct(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-black" />;
  if (!product) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-zinc-700 text-xs tracking-widest mb-6">Product not found.</p>
        <Link href="/shop" className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-500 hover:text-white transition-colors">
          ← Back to Shop
        </Link>
      </div>
    </div>
  );

  const available = product.status === "available" || product.status === "limited";

  return (
    <div className="min-h-screen bg-black">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-12 pt-28 md:pt-32 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-700 tracking-wider mb-12">
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span>/</span>
          <span className="capitalize text-zinc-600">{product.category}</span>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Images */}
          <div>
            <motion.div
              key={imgIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square bg-zinc-950 overflow-hidden mb-3"
            >
              {product.images[imgIndex] && (
                <Image
                  src={product.images[imgIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`relative w-16 h-16 overflow-hidden transition-all
                      ${imgIndex === i ? "border border-white/40" : "border border-white/10 opacity-50 hover:opacity-80"}`}
                  >
                    <Image src={img} alt="" fill className="object-cover grayscale" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Status + category */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[8px] font-mono tracking-[0.3em] uppercase border border-white/10 text-zinc-500 px-2.5 py-1">
                {product.category}
              </span>
              <span className={`text-[8px] font-mono tracking-[0.3em] uppercase
                ${product.status === "available" ? "text-white" :
                  product.status === "limited"   ? "text-zinc-300" : "text-zinc-700"}`}>
                {statusLabel[product.status]}
              </span>
            </div>

            <p className="text-[9px] font-mono text-zinc-600 tracking-[0.25em] uppercase mb-2">
              {product.brand} · {product.year}
            </p>
            <h1
              className="font-light text-white mb-3 leading-tight"
              style={{
                fontFamily: "var(--font-display, serif)",
                fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
              }}
            >
              {product.name}
            </h1>
            <p className="text-sm font-mono text-zinc-500 italic mb-6">{product.tagline}</p>

            <div className="w-12 h-px bg-white/10 mb-6" />

            <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-8">{product.description}</p>

            {/* Price + Add to Cart */}
            <div className="mt-auto">
              <p className="text-2xl font-mono text-white tabular-nums mb-4">${product.price}</p>
              {available ? (
                <button
                  onClick={() => { addItem(product); }}
                  className="w-full text-[10px] tracking-[0.4em] uppercase font-mono
                             bg-white text-black hover:bg-zinc-200 py-4 transition-colors mb-3"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="w-full text-center text-[10px] tracking-[0.4em] uppercase font-mono
                                border border-white/10 text-zinc-600 py-4 mb-3">
                  {statusLabel[product.status]}
                </div>
              )}
              <Link
                href="/contact"
                className="block w-full text-center text-[9px] tracking-[0.3em] uppercase font-mono
                           text-zinc-600 hover:text-white border border-white/8 hover:border-white/25
                           py-3 transition-all"
              >
                Inquire via Instagram
              </Link>
            </div>
          </div>
        </div>

        {/* Story */}
        {product.story && (
          <div className="mt-16 pt-16 border-t border-white/5 max-w-2xl">
            <p className="text-[9px] font-mono tracking-[0.35em] uppercase text-zinc-600 mb-4">The Story</p>
            <p className="text-sm font-mono text-zinc-400 leading-relaxed">{product.story}</p>
          </div>
        )}

        {/* Specs */}
        <div className="mt-12 pt-12 border-t border-white/5">
          <p className="text-[9px] font-mono tracking-[0.35em] uppercase text-zinc-600 mb-6">Specifications</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(product.specifications).map(([k, v]) => (
              <div key={k} className="border-b border-white/5 pb-4">
                <p className="text-[8px] font-mono text-zinc-700 tracking-[0.25em] uppercase mb-1 capitalize">
                  {k.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="text-xs font-mono text-zinc-300">{v}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
