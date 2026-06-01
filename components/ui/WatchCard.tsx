"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Watch } from "@/lib/data";

const categoryLabel: Record<string, string> = {
  custom: "Custom",
  restored: "Restored",
  curated: "Curated",
};

const categoryColor: Record<string, string> = {
  custom: "text-white",
  restored: "text-zinc-400",
  curated: "text-zinc-300",
};

interface WatchCardProps {
  watch: Watch;
  index?: number;
}

export default function WatchCard({ watch, index = 0 }: WatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/product/${watch.slug}`} className="group block">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-zinc-950 aspect-square mb-5">
          <Image
            src={watch.images[0]}
            alt={`${watch.brand} ${watch.name}`}
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 filter grayscale group-hover:grayscale-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-500" />

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`text-[10px] tracking-[0.3em] uppercase font-mono ${categoryColor[watch.category]} bg-black/60 backdrop-blur-sm px-2.5 py-1`}
            >
              {categoryLabel[watch.category]}
            </span>
          </div>

          {/* Sold overlay */}
          {watch.sold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-xs tracking-[0.3em] uppercase text-white/60 border border-white/20 px-4 py-2">
                Sold
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-zinc-600 mb-1 font-mono">
                {watch.brand} · {watch.year}
              </p>
              <h3 className="font-display text-xl font-light text-white group-hover:opacity-70 transition-opacity">
                {watch.name}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-zinc-300 font-mono">
                {watch.price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 italic font-display text-lg leading-tight">
            {watch.tagline}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
