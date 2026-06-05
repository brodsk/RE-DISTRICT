"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "@/lib/lang";

const pillars = [
  {
    number: "01",
    title: { en: "Custom", ru: "Кастом" },
    code:  "CST",
    description: {
      en: "Modifications and complete custom builds. PVD, dial swaps, bracelet upgrades. Your spec.",
      ru: "Модификации и полные кастомные сборки. PVD, замена циферблатов, апгрейд браслетов. Ваши требования.",
    },
    href: "/shop?category=custom",
  },
  {
    number: "02",
    title: { en: "Restored", ru: "Реставрация" },
    code:  "RST",
    description: {
      en: "Vintage pieces serviced and returned to working order. Condition documented. Nothing hidden.",
      ru: "Винтажные часы, обслуженные и приведённые в рабочее состояние. Состояние задокументировано. Ничего скрытого.",
    },
    href: "/shop?category=restored",
  },
  {
    number: "03",
    title: { en: "Curated", ru: "Подбор" },
    code:  "CRT",
    description: {
      en: "Pre-owned pieces selected for condition, character, and value. Casio, Seiko, Orient, Citizen.",
      ru: "Бывшие в употреблении часы, отобранные по состоянию, характеру и ценности. Casio, Seiko, Orient, Citizen.",
    },
    href: "/shop?category=curated",
  },
];

export default function PillarsSection() {
  const { t } = useLang();

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-black border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">

        {/* Section header — instrument style */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-12 md:mb-16"
        >
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-700">
            {t("Function", "Функция")}
          </span>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-700">
            SYS.03
          </span>
        </motion.div>

        {/* Three columns — no images, pure text/data layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group px-0 md:px-8 py-8 md:py-0 first:pl-0 last:pr-0"
            >
              {/* Code badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[8px] font-mono tracking-[0.4em] text-zinc-700 border border-white/8 px-2 py-1">
                  {p.code}
                </span>
                <span className="text-[8px] font-mono tracking-[0.3em] text-zinc-800">
                  {p.number}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-light text-white mb-3 group-hover:text-zinc-300 transition-colors"
                style={{ fontFamily: "var(--font-display, serif)" }}>
                {t(p.title.en, p.title.ru)}
              </h3>

              {/* Divider */}
              <div className="w-6 h-px bg-white/15 mb-4 group-hover:w-12 group-hover:bg-white/40 transition-all duration-400" />

              {/* Description */}
              <p className="text-[11px] md:text-xs text-zinc-600 leading-relaxed font-mono mb-6">
                {t(p.description.en, p.description.ru)}
              </p>

              {/* CTA */}
              <Link
                href={p.href}
                className="inline-flex items-center gap-2 text-[9px] font-mono tracking-[0.35em] uppercase text-zinc-700 hover:text-white transition-colors"
              >
                {t("View", "Смотреть")}
                <span className="w-3 h-px bg-current" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
