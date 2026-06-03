"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLang } from "@/lib/lang";

const pillars = [
  {
    number: "01",
    title: { en: "Custom", ru: "Кастом" },
    subtitle: { en: "Built for one.", ru: "Создано для одного." },
    description: {
      en: "Unique modifications and complete custom builds. From PVD coating and dial replacements to full bespoke creations. Your vision, executed with precision.",
      ru: "Уникальные модификации и полностью кастомные сборки. От PVD-покрытий и замены циферблатов до изделий по индивидуальному заказу. Ваше видение — воплощённое точно.",
    },
    href: "/shop?category=custom",
    image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=85",
  },
  {
    number: "02",
    title: { en: "Restored", ru: "Реставрация" },
    subtitle: { en: "History preserved.", ru: "История сохранена." },
    description: {
      en: "Carefully restored vintage watches. Every component inspected, serviced, and returned to the standard of its original manufacture — with its character intact.",
      ru: "Тщательно отреставрированные винтажные часы. Каждый компонент проверен, обслужен и возвращён к стандарту оригинального производства — с сохранённым характером.",
    },
    href: "/shop?category=restored",
    image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=85",
  },
  {
    number: "03",
    title: { en: "Curated", ru: "Подбор" },
    subtitle: { en: "Selected with intent.", ru: "Выбрано намеренно." },
    description: {
      en: "Pre-owned watches chosen for their character, condition, and story. Nothing generic. Everything deliberate.",
      ru: "Бывшие в употреблении часы, отобранные за характер, состояние и историю. Ничего стандартного. Всё намеренно.",
    },
    href: "/shop?category=curated",
    image: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&q=85",
  },
];

export default function PillarsSection() {
  const { t } = useLang();

  return (
    <section className="py-28 md:py-40 px-6 md:px-12 bg-black">
      <div className="max-w-screen-xl mx-auto">
        <AnimatedSection className="mb-20 md:mb-28">
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
            {t("What we do", "Что мы делаем")}
          </p>
          <h2 className="font-display text-5xl md:text-7xl font-light leading-none">
            {t("Three ways", "Три способа")}
            <br />
            <span className="italic">{t("to own time.", "владеть временем.")}</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-black p-8 md:p-10 group relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-cover bg-center"
                style={{ backgroundImage: `url('${pillar.image}')` }}
              />
              <div className="relative z-10">
                <span className="text-[10px] tracking-[0.35em] uppercase text-zinc-700 font-mono block mb-8">
                  {pillar.number}
                </span>
                <h3 className="font-display text-4xl md:text-5xl font-light mb-2 text-white">
                  {t(pillar.title.en, pillar.title.ru)}
                </h3>
                <p className="font-display text-lg italic text-zinc-500 mb-6">
                  {t(pillar.subtitle.en, pillar.subtitle.ru)}
                </p>
                <div className="w-8 h-px bg-white/20 mb-6 group-hover:w-16 group-hover:bg-white/60 transition-all duration-500" />
                <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                  {t(pillar.description.en, pillar.description.ru)}
                </p>
                <Link
                  href={pillar.href}
                  className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 hover:text-white transition-colors flex items-center gap-3"
                >
                  {t("View Collection", "Смотреть")}
                  <span className="w-4 h-px bg-current inline-block" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
