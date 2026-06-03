"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLang } from "@/lib/lang";

const testimonials = [
  {
    id: 1,
    en: {
      text: "RE:DISTRICT found me a 1984 Sub I'd been hunting for three years. The restoration was impeccable — every detail considered.",
      author: "Alexander M.",
      location: "Moscow",
      watch: "Rolex Submariner 1984",
    },
    ru: {
      text: "RE:DISTRICT нашли мне Sub 1984 года, который я искал три года. Реставрация — безупречная, каждая деталь продумана.",
      author: "Александр М.",
      location: "Москва",
      watch: "Rolex Submariner 1984",
    },
  },
  {
    id: 2,
    en: {
      text: "The Shadow Edition Datejust is the most asked-about thing I own. Nobody can believe it's a Rolex. Pure obsession.",
      author: "Denis K.",
      location: "Berlin",
      watch: "Datejust Shadow Edition",
    },
    ru: {
      text: "Shadow Edition Datejust — самое обсуждаемое, что у меня есть. Никто не верит, что это Rolex. Чистое помешательство.",
      author: "Денис К.",
      location: "Берлин",
      watch: "Datejust Shadow Edition",
    },
  },
  {
    id: 3,
    en: {
      text: "I sent them my grandfather's broken Omega. They returned a piece of history, running perfectly, preserved exactly as it was.",
      author: "Pavel V.",
      location: "London",
      watch: "Omega Constellation Restoration",
    },
    ru: {
      text: "Я отправил им сломанный Omega дедушки. Они вернули мне кусочек истории — идеально работающий, сохранённый в точности как был.",
      author: "Павел В.",
      location: "Лондон",
      watch: "Реставрация Omega Constellation",
    },
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const { t } = useLang();

  const current = testimonials[active];

  return (
    <section className="py-28 md:py-40 px-6 md:px-12 bg-zinc-950">
      <div className="max-w-screen-xl mx-auto">
        <AnimatedSection className="mb-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
            {t("From Our Clients", "Наши клиенты")}
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-light">
            {t("The watches", "Часы")}
            <br />
            <span className="italic">
              {t("speak for themselves.", "говорят сами за себя.")}
            </span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Quote */}
          <div className="min-h-[280px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${active}-${t("en","ru")}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <span className="font-display text-[6rem] leading-none text-white/5 select-none absolute -top-4 -left-2">
                  "
                </span>
                <blockquote className="font-display text-2xl md:text-3xl font-light leading-snug text-white/90 mb-8 relative z-10 pt-4">
                  {t(current.en.text, current.ru.text)}
                </blockquote>
                <div>
                  <p className="text-sm text-white font-medium">
                    {t(current.en.author, current.ru.author)}
                  </p>
                  <p className="text-xs text-zinc-600 font-mono tracking-wider">
                    {t(current.en.location, current.ru.location)} ·{" "}
                    {t(current.en.watch, current.ru.watch)}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Selector */}
          <div className="space-y-0 border-l border-white/8 pl-8 md:pl-16">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActive(i)}
                className={`w-full text-left py-6 border-b border-white/8 transition-all duration-300 ${
                  active === i ? "" : "opacity-40 hover:opacity-70"
                }`}
              >
                <p
                  className={`font-display text-xl font-light mb-1 transition-colors ${
                    active === i ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {t(item.en.author, item.ru.author)}
                </p>
                <p className="text-xs font-mono tracking-wider text-zinc-600">
                  {t(item.en.location, item.ru.location)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
