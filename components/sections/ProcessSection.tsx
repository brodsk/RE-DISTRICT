"use client";
import { motion } from "framer-motion";
import { useLang } from "@/lib/lang";
import { process } from "@/lib/data";

export default function ProcessSection() {
  const { t } = useLang();

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-black border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-12 md:mb-16"
        >
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-700">
            {t("Process", "Процесс")}
          </span>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-800">
            SYS.04
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 divide-white/5">
          {process.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="py-8 md:py-10 pr-0 md:pr-12 group"
            >
              <div className="flex gap-6 items-start">
                <span className="text-[9px] font-mono text-zinc-800 tracking-[0.3em] pt-1 shrink-0 w-6 tabular-nums">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-xl font-light text-white mb-2 group-hover:text-zinc-300 transition-colors"
                    style={{ fontFamily: "var(--font-display, serif)" }}>
                    {t(step.en.title, step.ru.title)}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-600 leading-relaxed">
                    {t(step.en.description, step.ru.description)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
