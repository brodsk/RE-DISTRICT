"use client";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLang } from "@/lib/lang";

const steps = [
  {
    step: "01",
    en: { title: "Source", description: "We hunt. Estate sales, private collections, trusted dealers across Europe and Japan. Every piece passes through our hands before it reaches you." },
    ru: { title: "Поиск", description: "Мы ищем. Частные коллекции, аукционы, проверенные дилеры по всей Европе и Японии. Каждый экземпляр проходит через наши руки прежде, чем попасть к вам." },
  },
  {
    step: "02",
    en: { title: "Assess", description: "Complete inspection under magnification. Movement, dial, case, crystal, crown — every component evaluated and documented." },
    ru: { title: "Оценка", description: "Полная инспекция под увеличением. Механизм, циферблат, корпус, стекло, заводная головка — каждый компонент проверен и задокументирован." },
  },
  {
    step: "03",
    en: { title: "Restore or Build", description: "Restoration respects originality. Custom work starts from vision. Both demand the same level of craft." },
    ru: { title: "Реставрация или сборка", description: "Реставрация уважает оригинал. Кастом начинается с идеи. Оба требуют одного уровня мастерства." },
  },
  {
    step: "04",
    en: { title: "Certify", description: "Every watch leaves with full documentation of its condition, history, and any work performed. Honesty is the foundation." },
    ru: { title: "Сертификация", description: "Каждые часы уходят с полной документацией состояния, истории и выполненных работ. Честность — это основа." },
  },
];

export default function ProcessSection() {
  const { t } = useLang();

  return (
    <section className="py-28 md:py-40 px-6 md:px-12 bg-black overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          {/* Left: image */}
          <AnimatedSection direction="left" className="relative order-2 lg:order-1">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&q=85"
                alt="Workshop"
                className="w-full h-full object-cover filter grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute -right-4 md:-right-8 top-1/3 bg-black border border-white/10 p-4 max-w-[180px]"
            >
              <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 font-mono mb-1">
                {t("Standard", "Стандарт")}
              </p>
              <p className="font-display text-lg text-white font-light leading-tight">
                {t("Every detail matters.", "Каждая деталь важна.")}
              </p>
            </motion.div>
          </AnimatedSection>

          {/* Right: process */}
          <div className="order-1 lg:order-2">
            <AnimatedSection>
              <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
                {t("Our Process", "Наш процесс")}
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-light leading-none mb-16">
                {t("Workshop.", "Мастерская.")}
                <br />
                <span className="italic">
                  {t("Not a warehouse.", "Не склад.")}
                </span>
              </h2>
            </AnimatedSection>

            <div className="space-y-0">
              {steps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, delay: i * 0.1 + 0.2 }}
                  className="border-t border-white/8 py-8 group"
                >
                  <div className="flex gap-8 items-start">
                    <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-700 pt-1 shrink-0 w-8">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-light text-white mb-2 group-hover:opacity-70 transition-opacity">
                        {t(step.en.title, step.ru.title)}
                      </h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        {t(step.en.description, step.ru.description)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-white/8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
