"use client";
import { useState } from "react";
import { motion } from "framer-motion";
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
    <section className="py-20 md:py-28 px-6 md:px-12 bg-black border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-700">
            {t("Signal", "Сигнал")}
          </span>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-800">
            SYS.07
          </span>
        </div>

        <div className="max-w-lg">
          <p className="text-2xl md:text-3xl font-light text-white mb-2"
            style={{ fontFamily: "var(--font-display, serif)" }}>
            {t("New arrivals.", "Новые поступления.")}
          </p>
          <p className="text-[11px] font-mono text-zinc-600 mb-8 leading-relaxed">
            {t(
              "Low frequency. High signal. Casio, Seiko, Orient, Citizen — when something worth having arrives.",
              "Низкая частота. Высокий сигнал. Casio, Seiko, Orient, Citizen — когда появляется что-то стоящее."
            )}
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex gap-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                required
                className="flex-1 bg-transparent border border-white/10 hover:border-white/20 focus:border-white/40 outline-none px-4 py-3 text-xs font-mono text-white placeholder:text-zinc-800 transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-white text-black text-[9px] font-mono tracking-[0.3em] uppercase hover:bg-zinc-200 transition-colors shrink-0"
              >
                {t("Subscribe", "OK")}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="text-xs font-mono text-zinc-400 tracking-[0.2em]">
                {t("Signal received.", "Сигнал принят.")}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
