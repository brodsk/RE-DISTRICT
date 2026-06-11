"use client";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { watches } from "@/lib/data";
import WatchCard from "@/components/ui/WatchCard";

const categoryLabel: Record<string, string> = {
  custom: "Custom Build",
  restored: "Restored Vintage",
  curated: "Curated Pre-owned",
};

const conditionLabel: Record<string, string> = {
  mint: "Mint",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const watch = watches.find((w) => w.slug === slug);

  const [activeImage, setActiveImage] = useState(0);

  if (!watch) return notFound();

  const related = watches
    .filter((w) => w.id !== watch.id && w.category === watch.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-black pt-24">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 py-6 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto flex items-center gap-3 text-xs text-zinc-600 font-mono tracking-wider">
          <Link href="/shop" className="hover:text-white transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="capitalize">{watch.category}</span>
          <span>/</span>
          <span className="text-zinc-400">{watch.name}</span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Images */}
          <div>
            {/* Main image */}
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-square overflow-hidden bg-zinc-950 mb-4"
            >
              <Image
                src={watch.images[activeImage]}
                alt={watch.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </motion.div>

            {/* Thumbnails */}
            {watch.images.length > 1 && (
              <div className="flex gap-3">
                {watch.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 overflow-hidden transition-all duration-200 ${
                      activeImage === i
                        ? "border border-white/60"
                        : "border border-white/10 hover:border-white/30 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${watch.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Category & condition */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-zinc-500 border border-white/10 px-3 py-1.5">
                {categoryLabel[watch.category]}
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-zinc-500">
                {conditionLabel[watch.condition]}
              </span>
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs tracking-[0.25em] uppercase text-zinc-600 font-mono mb-2">
                {watch.brand} · {watch.year}
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-light leading-none mb-3">
                {watch.name}
              </h1>
              <p className="font-display text-xl italic text-zinc-400 mb-8">
                {watch.tagline}
              </p>
            </motion.div>

            {/* Price */}
            <div className="border-t border-white/8 pt-8 mb-8">
              <p className="text-3xl font-mono text-white">
                {watch.price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-400 leading-relaxed mb-8">
              {watch.description}
            </p>

            {/* CTA */}
            {!watch.sold ? (
              <Link
                href="/contact"
                className="inline-flex items-center gap-4 w-full md:w-auto"
              >
                <span className="flex-1 md:flex-none text-center text-xs tracking-[0.3em] uppercase text-black bg-white hover:bg-zinc-200 px-10 py-5 transition-colors font-medium">
                  Inquire to Purchase
                </span>
              </Link>
            ) : (
              <div className="text-xs tracking-[0.3em] uppercase text-zinc-600 border border-white/10 px-10 py-5 text-center md:inline-block">
                Sold
              </div>
            )}

            {/* Story */}
            {watch.story && (
              <div className="mt-10 pt-10 border-t border-white/8">
                <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-600 font-mono mb-4">
                  The Story
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed italic font-display text-lg">
                  {watch.story}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div className="border-t border-white/8 pt-16 mb-24">
          <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-600 font-mono mb-10">
            Specifications
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(watch.specifications).map(([key, val]) => (
              <div
                key={key}
                className="border-b border-white/8 pb-5"
              >
                <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono mb-1 capitalize">
                  {key}
                </p>
                <p className="text-sm text-white">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Restoration notes */}
        {watch.restorationNotes && (
          <div className="bg-zinc-950 p-8 md:p-12 mb-24">
            <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-600 font-mono mb-4">
              Restoration Notes
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {watch.restorationNotes}
            </p>
          </div>
        )}

        {/* Custom modifications */}
        {watch.customModifications && (
          <div className="bg-zinc-950 p-8 md:p-12 mb-24">
            <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-600 font-mono mb-4">
              Custom Modifications
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {watch.customModifications}
            </p>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="border-t border-white/8 pt-16">
            <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-600 font-mono mb-12">
              More in {categoryLabel[watch.category]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((w, i) => (
                <WatchCard key={w.id} watch={w} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
