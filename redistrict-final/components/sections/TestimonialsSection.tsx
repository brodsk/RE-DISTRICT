"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/lib/data";
import { useLang } from "@/lib/lang";

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const { t } = useLang();
  const cur = testimonials[active];

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-black border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-12 md:mb-16">
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-700">
            {t("Feedback", "Отзывы")}
          </span>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-800">
            SYS.06
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Quote */}
          <div className="relative min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-xl md:text-2xl font-light text-white leading-snug mb-6"
                  style={{ fontFamily: "var(--font-display, serif)" }}>
                  "{t(cur.en.text, cur.ru.text)}"
                </p>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-px bg-white/20" />
                  <span className="text-[10px] font-mono text-zinc-500 tracking-[0.25em]">
                    {t(cur.en.author, cur.ru.author)}
                  </span>
                  <span className="text-zinc-800">·</span>
                  <span className="text-[10px] font-mono text-zinc-700 tracking-[0.25em]">
                    {t(cur.en.location, cur.ru.location)}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-zinc-800 tracking-[0.25em] mt-1 ml-7">
                  {t(cur.en.watch, cur.ru.watch)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Selector */}
          <div className="divide-y divide-white/5">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActive(i)}
                className={`w-full text-left py-4 flex items-center gap-4 group transition-all duration-200 ${
                  active === i ? "opacity-100" : "opacity-30 hover:opacity-60"
                }`}
              >
                <span className="text-[8px] font-mono text-zinc-700 tabular-nums w-4">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm font-light text-white"
                    style={{ fontFamily: "var(--font-display, serif)" }}>
                    {t(item.en.author, item.ru.author)}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-700 tracking-[0.2em]">
                    {t(item.en.location, item.ru.location)}
                  </p>
                </div>
                {active === i && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
