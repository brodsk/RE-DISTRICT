"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/lang";

// Live clock hook
function useClock() {
  const [time, setTime] = useState<{ h: string; m: string; s: string; colon: boolean }>({
    h: "--", m: "--", s: "--", colon: true,
  });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        h: String(now.getHours()).padStart(2, "0"),
        m: String(now.getMinutes()).padStart(2, "0"),
        s: String(now.getSeconds()).padStart(2, "0"),
        colon: now.getSeconds() % 2 === 0,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function HeroSection() {
  const { t } = useLang();
  const clock = useClock();

  return (
    <section
      className="relative flex flex-col bg-black overflow-hidden"
      style={{ height: "100svh", minHeight: "640px" }}
    >
      {/* Faint grid — device interface background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top status bar — like a watch face */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-28 md:pt-32 pb-0"
      >
        <span className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono">
          {t("Est. 2026", "Осн. 2026")}
        </span>
        <span className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono">
          {t("Custom · Restored · Curated", "Кастом · Реставрация · Подбор")}
        </span>
      </motion.div>

      {/* ── MAIN CLOCK DISPLAY ── centred, device-like */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">

        {/* The big time display */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-10 md:mb-12"
        >
          {/* HH:MM */}
          <div
            className="font-mono font-light text-white leading-none tracking-tight select-none tabular-nums"
            style={{ fontSize: "clamp(4.5rem, 22vw, 16rem)", letterSpacing: "-0.02em" }}
          >
            {clock.h}
            <span
              className="inline-block transition-opacity duration-100"
              style={{ opacity: clock.colon ? 1 : 0.15 }}
            >
              :
            </span>
            {clock.m}
          </div>

          {/* Seconds + timezone sub-display */}
          <div className="flex items-center justify-center gap-6 mt-3 md:mt-4">
            <span className="text-[11px] font-mono text-zinc-600 tabular-nums tracking-widest">
              :{clock.s}
            </span>
            <span className="w-px h-3 bg-zinc-800" />
            <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
              {Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()?.replace("_", " ") ?? "LOCAL"}
            </span>
            <span className="w-px h-3 bg-zinc-800" />
            <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
              RE:DISTRICT
            </span>
          </div>
        </motion.div>

        {/* Horizontal rule — display separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="w-full max-w-md h-px bg-white/8 mb-10 md:mb-12 origin-center"
        />

        {/* Slogan — minimal, monospace */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-[11px] md:text-xs font-mono tracking-[0.4em] uppercase text-zinc-500 mb-2">
            {t("Rebuild your time.", "Переосмысли своё время.")}
          </p>
          <p className="text-[10px] font-mono text-zinc-700 tracking-[0.25em]">
            {t("Time is the same for everyone. Watches are not.", "Время одинаково для каждого. Часы — нет.")}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/shop"
            className="text-[10px] tracking-[0.4em] uppercase font-mono text-black bg-white hover:bg-zinc-200 px-8 py-3.5 transition-colors duration-200"
          >
            {t("Explore Watches", "Смотреть часы")}
          </Link>
          <Link
            href="/about"
            className="text-[10px] tracking-[0.4em] uppercase font-mono text-zinc-600 hover:text-white border border-white/10 hover:border-white/30 px-8 py-3.5 transition-all duration-200"
          >
            {t("About", "О нас")}
          </Link>
        </motion.div>
      </div>

      {/* Bottom status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="relative z-10 flex items-end justify-between px-6 md:px-12 pb-8 md:pb-10"
      >
        <div className="flex items-center gap-4">
          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
            {t("Casio · Seiko · Orient · Citizen", "Casio · Seiko · Orient · Citizen")}
          </span>
        </div>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-px h-5 bg-gradient-to-b from-white/20 to-transparent" />
          <span className="text-[8px] font-mono text-zinc-800 tracking-[0.3em] uppercase">
            {t("scroll", "листать")}
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
