"use client";
import { motion } from "framer-motion";
import { useLang } from "@/lib/lang";

export default function PhilosophySection() {
  const { t } = useLang();

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 bg-black border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-16 md:mb-20"
        >
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-700">
            {t("Philosophy", "Философия")}
          </span>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-800">
            SYS.05
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <blockquote
              className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-white mb-8"
              style={{ fontFamily: "var(--font-display, serif)" }}
            >
              {t(
                <>We don't manufacture history.<br /><span className="text-zinc-500 italic">We find it, restore it,<br />and give it a new place<br />on your wrist.</span></>,
                <>Мы не производим историю.<br /><span className="text-zinc-500 italic">Мы её находим, реставрируем<br />и возвращаем<br />на ваше запястье.</span></>
              )}
            </blockquote>

            <div className="w-8 h-px bg-white/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-8 pt-2"
          >
            {[
              {
                en: "Casio, Seiko, Orient, Citizen — these are the watches most people can actually afford, and the ones that actually get worn. We focus here because this is where character lives.",
                ru: "Casio, Seiko, Orient, Citizen — это часы, которые большинство людей реально может себе позволить и которые реально носят. Мы работаем здесь, потому что здесь живёт характер.",
              },
              {
                en: "A G-Shock that's been custom-built tells more story than a watch that arrived perfect in a box. Wear shows intention. Modification shows knowledge.",
                ru: "Кастомный G-Shock рассказывает больше, чем часы, прибывшие идеальными в коробке. Износ — это намерение. Модификация — это знание.",
              },
              {
                en: "The colon blinks once a second. That's the whole idea.",
                ru: "Двоеточие мигает раз в секунду. В этом весь смысл.",
              },
            ].map((block, i) => (
              <p
                key={i}
                className="text-xs font-mono text-zinc-500 leading-relaxed border-l border-white/8 pl-4"
              >
                {t(block.en, block.ru)}
              </p>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
