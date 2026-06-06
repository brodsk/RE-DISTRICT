"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/lang";

// ─── Types & constants ────────────────────────────────────────────────────────

type Mode = "brand" | "clock" | "glitch";

const BRAND_MS  = 10_000;
const CLOCK_MS  = 20_000;
const GLITCH_MS =  5_000;
const EASTER_MS =  5 * 60_000;

// ─── City from timezone ───────────────────────────────────────────────────────
// Parses Intl timezone string (e.g. "Europe/New_York" → "New York")

function getCity(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g. "Europe/Moscow"
    const raw = tz.split("/").pop() ?? "LOCAL";
    return raw.replace(/_/g, " "); // "New_York" → "New York"
  } catch {
    return "LOCAL";
  }
}

// ─── Single global clock hook (one interval, all state) ───────────────────────

function useClockState() {
  const [mode,  setMode]  = useState<Mode>("brand");
  const [colon, setColon] = useState(true);
  const [h, setH]         = useState("--");
  const [m, setM]         = useState("--");
  const [s, setS]         = useState("--");
  const [city, setCity]   = useState("LOCAL");

  const modeRef    = useRef<Mode>("brand");
  const modeStart  = useRef(Date.now());
  const easterRef  = useRef(Date.now());

  useEffect(() => {
    // Get city once (client-only)
    setCity(getCity());

    const tick = () => {
      const now = Date.now();
      const d   = new Date();

      // ── Colon alternates every tick ──
      setColon(d.getSeconds() % 2 === 0);

      // ── Time values ──
      setH(String(d.getHours()).padStart(2, "0"));
      setM(String(d.getMinutes()).padStart(2, "0"));
      setS(String(d.getSeconds()).padStart(2, "0"));

      // ── Easter egg ──
      if (modeRef.current !== "glitch" && now - easterRef.current >= EASTER_MS) {
        easterRef.current = now;
        modeRef.current   = "glitch";
        modeStart.current = now;
        setMode("glitch");
        return;
      }

      // ── State machine ──
      const elapsed = now - modeStart.current;
      if (modeRef.current === "glitch" && elapsed >= GLITCH_MS) {
        modeRef.current = "brand"; modeStart.current = now; setMode("brand");
      } else if (modeRef.current === "brand" && elapsed >= BRAND_MS) {
        modeRef.current = "clock"; modeStart.current = now; setMode("clock");
      } else if (modeRef.current === "clock" && elapsed >= CLOCK_MS) {
        modeRef.current = "brand"; modeStart.current = now; setMode("brand");
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { mode, colon, h, m, s, city };
}

// ─── Colon — always centred, never shifts layout ──────────────────────────────
//
// Strategy: CSS Grid with 3 columns [1fr auto 1fr]
//   col 1 = right-aligned left side
//   col 2 = the colon (fixed width, never moves)
//   col 3 = left-aligned right side
// The colon pixel stays at the horizontal centre of the viewport at all times.

interface SplitProps {
  left:   React.ReactNode;
  right:  React.ReactNode;
  colon:  boolean;
  size:   string;        // font-size (clamp string)
  dimRatio?: number;     // opacity when colon off (default 0.12)
}

function ColonCentered({ left, right, colon, size, dimRatio = 0.12 }: SplitProps) {
  return (
    <div
      className="w-full grid items-baseline select-none"
      style={{
        gridTemplateColumns: "1fr auto 1fr",
        fontSize: size,
        fontFamily: "var(--font-mono, monospace)",
        fontWeight: 300,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {/* Left — right-aligned */}
      <span className="text-right text-white tabular-nums">{left}</span>

      {/* Colon — always centred, fixed width */}
      <span
        style={{
          opacity: colon ? 1 : dimRatio,
          transition: "opacity 60ms steps(1)",
          padding: "0 0.04em",
          color: "#fff",
        }}
      >
        :
      </span>

      {/* Right — left-aligned */}
      <span className="text-left text-white tabular-nums">{right}</span>
    </div>
  );
}

// ─── Display modes ────────────────────────────────────────────────────────────

function BrandDisplay({ colon }: { colon: boolean }) {
  return (
    <ColonCentered
      left="RE"
      right="DISTRICT"
      colon={colon}
      size="clamp(2.4rem, 10.5vw, 10rem)"
      dimRatio={0.1}
    />
  );
}

function ClockDisplay({ h, m, colon }: { h: string; m: string; colon: boolean }) {
  return (
    <ColonCentered
      left={h}
      right={m}
      colon={colon}
      size="clamp(4.5rem, 20vw, 16rem)"
    />
  );
}

function GlitchDisplay({ colon }: { colon: boolean }) {
  return (
    <ColonCentered
      left="rE"
      right="d15tr1Ct"
      colon={colon}
      size="clamp(1.5rem, 6.5vw, 7rem)"
      dimRatio={0.1}
    />
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const { t } = useLang();
  const { mode, colon, h, m, s, city } = useClockState();

  return (
    <section
      className="relative flex flex-col bg-black overflow-hidden"
      style={{ height: "100svh", minHeight: "620px" }}
    >
      {/* Subtle grid texture — device interface feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Top status bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-24 md:pt-28"
      >
        <span className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono">
          {t("Est. 2026", "Осн. 2026")}
        </span>
        <span className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono hidden sm:block">
          {t("Custom · Restored · Curated", "Кастом · Реставрация · Подбор")}
        </span>
      </motion.div>

      {/* ── Centre display ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-12">

        {/* Main display — colon always centred */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-[900px] mb-8 md:mb-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "linear" }}
            >
              {mode === "brand"  && <BrandDisplay colon={colon} />}
              {mode === "clock"  && <ClockDisplay h={h} m={m} colon={colon} />}
              {mode === "glitch" && <GlitchDisplay colon={colon} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Sub-display: seconds + city — only in clock mode, fade in/out */}
        <motion.div
          className="flex items-center justify-center gap-5 mb-8 md:mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {mode === "clock" && (
              <motion.div
                key="sub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4"
              >
                {/* Seconds */}
                <span className="text-[11px] font-mono text-zinc-600 tabular-nums tracking-widest">
                  :{s}
                </span>
                <span className="w-px h-3 bg-zinc-800" />
                {/* Dynamic city */}
                <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
                  {city}
                </span>
                <span className="w-px h-3 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
                  RE:DISTRICT
                </span>
              </motion.div>
            )}
            {mode !== "clock" && (
              <motion.div
                key="nosub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-[18px]" // same height as sub-display, keeps layout stable
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="w-full max-w-md h-px bg-white/6 mb-8 md:mb-10 origin-center"
        />

        {/* Slogan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-center mb-10 md:mb-12"
        >
          <p className="text-[11px] md:text-xs font-mono tracking-[0.4em] uppercase text-zinc-500 mb-2">
            {t("Rebuild your time.", "Переосмысли своё время.")}
          </p>
          <p className="text-[10px] font-mono text-zinc-700 tracking-[0.25em]">
            {t(
              "Time is the same for everyone. Watches are not.",
              "Время одинаково для каждого. Часы — нет."
            )}
          </p>
        </motion.div>

        {/* CTA buttons */}
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

      {/* ── Bottom status bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="relative z-10 flex items-end justify-between px-6 md:px-12 pb-8 md:pb-10"
      >
        <div className="flex items-center gap-4">
          <span className="w-1.5 h-1.5 rounded-full bg-white/25 animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
            Casio · Seiko · Orient · Citizen
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
