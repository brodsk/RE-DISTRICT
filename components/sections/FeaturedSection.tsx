"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { watches } from "@/lib/data";
import { useLang } from "@/lib/lang";

const categoryCode: Record<string, string> = {
  custom: "CST",
  restored: "RST",
  curated: "CRT",
};

export default function FeaturedSection() {
  const { t } = useLang();
  const featured = watches.filter((w) => w.featured).slice(0, 4);

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-black border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">

        {/* Header row */}
        <div className="flex items-center justify-between mb-10 md:mb-14">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-700">
              {t("Current Selection", "Текущий выбор")}
            </span>
            <div className="w-8 h-px bg-white/8" />
            <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-800">
              {featured.length.toString().padStart(2, "0")} {t("units", "ед.")}
            </span>
          </div>
          <Link
            href="/shop"
            className="text-[9px] font-mono tracking-[0.35em] uppercase text-zinc-700 hover:text-white transition-colors flex items-center gap-2"
          >
            {t("All", "Все")} <span className="w-3 h-px bg-current" />
          </Link>
        </div>

        {/* Watch list — table-like layout, not a card grid */}
        <div className="divide-y divide-white/5">
          {featured.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <Link
                href={`/product/${w.slug}`}
                className="flex items-center gap-4 md:gap-8 py-5 md:py-6 group"
              >
                {/* Index */}
                <span className="text-[9px] font-mono text-zinc-800 w-5 shrink-0 tabular-nums">
                  {(i + 1).toString().padStart(2, "0")}
                </span>

                {/* Thumbnail — small, square, greyscale */}
                <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 overflow-hidden bg-zinc-950">
                  <img
                    src={w.images[0]}
                    alt={w.name}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Brand + Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-600 mb-0.5">
                    {w.brand} · {w.year}
                  </p>
                  <p className="text-sm md:text-base text-white font-light group-hover:text-zinc-300 transition-colors truncate"
                    style={{ fontFamily: "var(--font-display, serif)" }}>
                    {w.name}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-700 mt-0.5 hidden md:block">
                    {w.tagline}
                  </p>
                </div>

                {/* Category code */}
                <span className="text-[8px] font-mono tracking-[0.3em] text-zinc-800 border border-white/5 px-2 py-1 shrink-0 hidden sm:block">
                  {categoryCode[w.category]}
                </span>

                {/* Price */}
                <span className="text-sm font-mono text-white shrink-0 tabular-nums">
                  ${w.price.toLocaleString()}
                </span>

                {/* Arrow */}
                <span className="text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 shrink-0">
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
          <span className="text-[9px] font-mono text-zinc-800 tracking-[0.3em] uppercase">
            Casio · Seiko · Orient · Citizen
          </span>
          <Link
            href="/shop"
            className="text-[9px] font-mono tracking-[0.35em] uppercase text-zinc-600 hover:text-white transition-colors"
          >
            {t("View full catalogue →", "Смотреть весь каталог →")}
          </Link>
        </div>
      </div>
    </section>
  );
}
