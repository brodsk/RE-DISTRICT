"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLang } from "@/lib/lang";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLang();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-28 md:py-40 px-6 md:px-12 bg-black border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-2xl">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
              {t("Stay Close", "Будьте в курсе")}
            </p>
            <h2 className="font-display text-5xl md:text-6xl font-light leading-none mb-6">
              {t("First to know.", "Первым узнавай.")}
              <br />
              <span className="italic text-zinc-500">
                {t("No noise.", "Только суть.")}
              </span>
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed mb-10 max-w-sm">
              {t(
                "New arrivals, restoration stories, and occasional thoughts on watch culture. Nothing else.",
                "Новые поступления, истории реставраций и мысли о культуре часов. Ничего лишнего."
              )}
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex gap-0 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-transparent border border-white/15 hover:border-white/30 focus:border-white/60 outline-none px-5 py-4 text-sm text-white placeholder:text-zinc-700 transition-colors font-mono tracking-wider"
                />
                <button
                  type="submit"
                  className="px-6 py-4 bg-white text-black text-xs tracking-[0.25em] uppercase font-medium hover:bg-zinc-200 transition-colors shrink-0"
                >
                  {t("Subscribe", "Подписаться")}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <div className="w-1 h-8 bg-white" />
                <div>
                  <p className="font-display text-xl font-light text-white">
                    {t("You're in.", "Вы подписаны.")}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono">
                    {t(
                      "We'll be in touch when something worthy arrives.",
                      "Напишем, когда появится что-то достойное."
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
