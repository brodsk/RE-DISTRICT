"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/lang";

type Mode = "brand" | "clock" | "glitch";
const BRAND_MS = 10_000, CLOCK_MS = 20_000, GLITCH_MS = 5_000, EASTER_MS = 5 * 60_000;

function getCity() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()!.replace(/_/g, " "); }
  catch { return "LOCAL"; }
}

function useClockState() {
  const [mode,  setMode]  = useState<Mode>("brand");
  const [colon, setColon] = useState(true);
  const [h, setH]         = useState("--");
  const [m, setM]         = useState("--");
  const [s, setS]         = useState("--");
  const [city, setCity]   = useState("LOCAL");
  const modeRef   = useRef<Mode>("brand");
  const modeStart = useRef(Date.now());
  const easterRef = useRef(Date.now());

  useEffect(() => {
    setCity(getCity());
    const tick = () => {
      const now = Date.now(), d = new Date();
      setColon(d.getSeconds() % 2 === 0);
      setH(String(d.getHours()).padStart(2, "0"));
      setM(String(d.getMinutes()).padStart(2, "0"));
      setS(String(d.getSeconds()).padStart(2, "0"));
      if (modeRef.current !== "glitch" && now - easterRef.current >= EASTER_MS) {
        easterRef.current = now; modeRef.current = "glitch"; modeStart.current = now; setMode("glitch"); return;
      }
      const el = now - modeStart.current;
      if      (modeRef.current === "glitch" && el >= GLITCH_MS) { modeRef.current = "brand"; modeStart.current = now; setMode("brand"); }
      else if (modeRef.current === "brand"  && el >= BRAND_MS)  { modeRef.current = "clock"; modeStart.current = now; setMode("clock"); }
      else if (modeRef.current === "clock"  && el >= CLOCK_MS)  { modeRef.current = "brand"; modeStart.current = now; setMode("brand"); }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { mode, colon, h, m, s, city };
}

function Display({ left, right, colon }: { left: string; right: string; colon: boolean }) {
  // Uses the SAME font-family as the rest of the interface (var(--font-mono) via CSS cascade).
  // Do NOT set fontFamily here — let it inherit from body/globals.css.
  const style: React.CSSProperties = {
    fontWeight:    300,
    fontSize:      "clamp(2.8rem, 11vw, 10rem)",
    letterSpacing: "-0.02em",
    lineHeight:    1,
    color:         "#fff",
    whiteSpace:    "nowrap",
  };

  return (
    <div style={{ width: "100%", textAlign: "center", lineHeight: 1 }}>
      <span className="font-mono" style={style}>
        {left}
        <span style={{ opacity: colon ? 1 : 0.1, transition: "opacity 60ms steps(1)" }}>:</span>
        {right}
      </span>
    </div>
  );
}

export default function HeroSection() {
  const { t } = useLang();
  const { mode, colon, h, m, s, city } = useClockState();
  const left  = mode === "clock" ? h : mode === "glitch" ? "rE" : "RE";
  const right = mode === "clock" ? m : mode === "glitch" ? "d15tr1Ct" : "DISTRICT";

  return (
    <section className="relative flex flex-col bg-black overflow-hidden" style={{ height: "100svh", minHeight: "620px" }}>
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Top status */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12"
        style={{ paddingTop: "clamp(5.5rem, 10vh, 7rem)" }}>
        <span className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono">
          {t("Est. 2026", "Осн. 2026")}
        </span>
        <span className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono hidden sm:block">
          {t("Custom · Restored · Curated", "Кастом · Реставрация · Подбор")}
        </span>
      </motion.div>

      {/* Centre */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ marginBottom: "clamp(0.75rem, 2vh, 1.5rem)" }}>
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}>
              <Display left={left} right={right} colon={colon} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Sub info */}
        <div className="h-[20px] flex items-center justify-center" style={{ marginBottom: "clamp(0.75rem, 2vh, 1.5rem)" }}>
          <AnimatePresence mode="wait">
            {mode === "clock" && (
              <motion.div key="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-4">
                <span className="text-[11px] font-mono text-zinc-600 tabular-nums">:{s}</span>
                <span className="w-px h-3 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">{city}</span>
                <span className="w-px h-3 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">RE:DISTRICT</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto origin-center" style={{ width: "min(24rem, 60vw)", height: "1px",
          background: "rgba(255,255,255,0.06)", marginBottom: "clamp(0.75rem, 2vh, 1.5rem)" }} />

        {/* Slogan */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-center" style={{ marginBottom: "clamp(1.25rem, 2.5vh, 2rem)" }}>
          <p className="text-[11px] font-mono tracking-[0.4em] uppercase text-zinc-500 mb-1.5">
            {t("Rebuild your time.", "Переосмысли своё время.")}
          </p>
          <p className="text-[10px] font-mono text-zinc-700 tracking-[0.25em]">
            {t("Time is the same for everyone. Watches are not.",
               "Время одинаково для каждого. Часы — нет.")}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/shop"
            className="text-[10px] tracking-[0.4em] uppercase font-mono text-black bg-white hover:bg-zinc-200 px-8 py-3.5 transition-colors">
            {t("Explore Watches", "Смотреть часы")}
          </Link>
          <Link href="/faq"
            className="text-[10px] tracking-[0.4em] uppercase font-mono text-zinc-600 hover:text-white border border-white/10 hover:border-white/30 px-8 py-3.5 transition-all">
            FAQ
          </Link>
        </motion.div>
      </div>

      {/* Bottom */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
        className="relative z-10 flex items-end justify-between px-6 md:px-12 pb-8">
        <div className="flex items-center gap-4">
          <span className="w-1.5 h-1.5 rounded-full bg-white/25 animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
            Casio · Seiko · Orient · Citizen
          </span>
        </div>
        <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}
          className="flex flex-col items-center gap-1">
          <div className="w-px h-5 bg-gradient-to-b from-white/20 to-transparent" />
          <span className="text-[8px] font-mono text-zinc-800 tracking-[0.3em] uppercase">
            {t("scroll","листать")}
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
