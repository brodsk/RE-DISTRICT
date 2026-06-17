"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/lang";
import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";

const faqs = [
  { q: { en:"What is RE:DISTRICT?", ru:"Что такое RE:DISTRICT?" }, a: { en:"A young independent brand focused on restoring and modifying Japanese digital watches — Casio, Seiko, Orient, Citizen.", ru:"Молодой независимый бренд, занимающийся восстановлением и модификацией японских цифровых часов — Casio, Seiko, Orient, Citizen." }},
  { q: { en:"Are the watches original?", ru:"Часы оригинальные?" }, a: { en:"Yes. Base watches are original second-hand Japanese digital watches.", ru:"Да. Базовые часы — оригинальные японские цифровые часы с пробегом." }},
  { q: { en:"Are they restored or modified?", ru:"Они восстановлены или модифицированы?" }, a: { en:"Both, depending on the piece.", ru:"И то, и другое — зависит от экземпляра." }},
  { q: { en:"What condition are they in?", ru:"В каком состоянии часы?" }, a: { en:"Each watch is cleaned, tested and prepared individually.", ru:"Каждые часы индивидуально чистятся, проверяются и подготавливаются." }},
  { q: { en:"Do you accept custom orders?", ru:"Принимаете кастом-заказы?" }, a: { en:"Limited availability depending on drops.", ru:"Ограниченно, в зависимости от текущих дропов." }},
  { q: { en:"Water resistance?", ru:"Водозащита?" }, a: { en:"Depends on model. Not guaranteed unless stated.", ru:"Зависит от модели. Не гарантируется, если не указано." }},
  { q: { en:"Future plans?", ru:"Планы на будущее?" }, a: { en:"Expanding selection and developing original designs.", ru:"Расширение ассортимента и разработка собственных дизайнов." }},
];

export default function FAQPage() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div className="relative z-10 max-w-screen-md mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-24">
        <AnimatedSection className="mb-16">
          <p className="text-[9px] tracking-[0.45em] uppercase font-mono text-zinc-600 mb-4">{t("Information","Информация")}</p>
          <h1 className="font-light text-white leading-none"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 8vw, 5rem)" }}>
            F<span style={{ opacity: 0.2 }}>:</span>A<span style={{ opacity: 0.2 }}>:</span>Q
          </h1>
        </AnimatedSection>

        <div className="border-t border-white/5">
          {faqs.map((item, i) => (
            <AnimatedSection key={i} delay={i * 0.04}>
              <div className="border-b border-white/5">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-6 text-left group hover:bg-white/[0.02] px-2 -mx-2 transition-colors">
                  <div className="flex items-baseline gap-4">
                    <span className="text-[9px] font-mono text-zinc-700 tabular-nums shrink-0">{String(i+1).padStart(2,"0")}</span>
                    <span className={`text-sm font-mono transition-colors ${open === i ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                      {t(item.q.en, item.q.ru)}
                    </span>
                  </div>
                  <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }}
                    className="text-zinc-600 group-hover:text-white transition-colors font-mono text-lg shrink-0">+</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                      <p className="text-[10px] font-mono text-zinc-500 leading-relaxed pb-6 pl-9 pr-4 max-w-lg">
                        {t(item.a.en, item.a.ru)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="mt-12">
          <Link href="/contact" className="group flex items-center justify-between border border-white/5 p-6 hover:bg-white/[0.02] transition-colors">
            <div>
              <p className="text-[8px] font-mono tracking-[0.3em] uppercase text-zinc-600 mb-1">{t("Still have questions?","Остались вопросы?")}</p>
              <p className="text-[10px] font-mono text-zinc-400">{t("Reach out — we respond fast.","Напишите нам — ответим быстро.")}</p>
            </div>
            <span className="text-zinc-700 group-hover:text-white transition-colors font-mono">→</span>
          </Link>
        </AnimatedSection>
      </div>
    </div>
  );
}
