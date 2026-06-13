"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLang } from "@/lib/lang";

const faqs = [
  {
    q: { en: "What is RE:DISTRICT?", ru: "Что такое RE:DISTRICT?" },
    a: {
      en: "A young independent brand focused on restoring and modifying Japanese digital watches.",
      ru: "Молодой независимый бренд, занимающийся восстановлением и модификацией японских цифровых часов.",
    },
  },
  {
    q: { en: "Are the watches original?", ru: "Часы оригинальные?" },
    a: {
      en: "Base watches are original second-hand Japanese digital watches.",
      ru: "Базовые часы — оригинальные японские цифровые часы с пробегом.",
    },
  },
  {
    q: { en: "Are they restored or modified?", ru: "Они восстановлены или модифицированы?" },
    a: {
      en: "Both, depending on the piece.",
      ru: "И то, и другое — в зависимости от экземпляра.",
    },
  },
  {
    q: { en: "What condition are the watches in?", ru: "В каком состоянии часы?" },
    a: {
      en: "Each watch is cleaned, tested and prepared individually.",
      ru: "Каждые часы индивидуально чистятся, проверяются и подготавливаются.",
    },
  },
  {
    q: { en: "Do you accept custom orders?", ru: "Принимаете заказы на кастом?" },
    a: {
      en: "Limited availability depending on drops.",
      ru: "Ограниченно, в зависимости от текущих дропов.",
    },
  },
  {
    q: { en: "Water resistance?", ru: "Водозащита?" },
    a: {
      en: "Depends on model, not guaranteed unless stated.",
      ru: "Зависит от модели, не гарантируется, если не указано отдельно.",
    },
  },
  {
    q: { en: "Future plans?", ru: "Планы на будущее?" },
    a: {
      en: "Expanding selection and developing original designs.",
      ru: "Расширение ассортимента и разработка собственных дизайнов.",
    },
  },
];

export default function FAQPage() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-black">
      {/* Background grid — same texture as hero/contact */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-screen-md mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-24">

        {/* ── Header ── */}
        <AnimatedSection className="mb-16 md:mb-20">
          <p className="text-[9px] tracking-[0.45em] uppercase text-zinc-600 font-mono mb-4">
            {t("Information", "Информация")}
          </p>
          <h1
            className="font-light text-white leading-none mb-6"
            style={{
              fontFamily: "ui-monospace, 'Roboto Mono', monospace",
              fontSize: "clamp(2.4rem, 8vw, 5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            F<span style={{ opacity: 0.15 }}>:</span>A<span style={{ opacity: 0.15 }}>:</span>Q
          </h1>
          <p className="text-[11px] md:text-xs font-mono text-zinc-500 leading-relaxed max-w-md">
            {t(
              "Common questions about RE:DISTRICT, our watches and process.",
              "Частые вопросы о RE:DISTRICT, наших часах и процессе."
            )}
          </p>
        </AnimatedSection>

        {/* ── Accordion ── */}
        <div className="border-t border-white/5">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="border-b border-white/5">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-6 md:py-7
                               text-left group transition-colors duration-200
                               hover:bg-white/[0.02] px-2 -mx-2"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-[10px] font-mono text-zinc-700 tabular-nums shrink-0 pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-sm md:text-base font-mono tracking-wide transition-colors duration-200
                          ${isOpen ? "text-white" : "text-zinc-300 group-hover:text-white"}`}
                      >
                        {t(item.q.en, item.q.ru)}
                      </span>
                    </div>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-zinc-600 group-hover:text-white transition-colors duration-200
                                 font-mono text-base shrink-0 leading-none"
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-[11px] md:text-xs font-mono text-zinc-500 leading-relaxed
                                     pb-6 md:pb-7 pl-[2.1rem] pr-8 max-w-lg">
                          {t(item.a.en, item.a.ru)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* ── Bottom CTA — same pattern as Contact page status block ── */}
        <AnimatedSection delay={0.3} className="mt-12 md:mt-16">
          <a
            href="/contact"
            className="group flex items-center justify-between gap-4 border border-white/5 p-6 md:p-7
                       transition-colors duration-200 hover:bg-white/[0.02]"
          >
            <div>
              <p className="text-[9px] font-mono tracking-[0.35em] uppercase text-zinc-600 mb-2">
                {t("Still have questions?", "Остались вопросы?")}
              </p>
              <p className="text-[11px] md:text-xs font-mono text-zinc-400">
                {t("Reach out directly — we respond fast.", "Напишите нам — мы быстро отвечаем.")}
              </p>
            </div>
            <span className="text-zinc-700 group-hover:text-white group-hover:translate-x-0.5
                             transition-all duration-200 font-mono text-sm shrink-0">
              →
            </span>
          </a>
        </AnimatedSection>

        {/* ── Footer note ── */}
        <AnimatedSection delay={0.4} className="mt-12 md:mt-16 text-center">
          <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-700">
            Casio · Seiko · Orient · Citizen
          </p>
        </AnimatedSection>

      </div>
    </div>
  );
}
