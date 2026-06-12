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

// ─── Timezone → city ─────────────────────────────────────────────────────────

function getCity(): string {
  try {
    return Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone
      .split("/")
      .pop()!
      .replace(/_/g, " ");
  } catch { return "LOCAL"; }
}

// ─── Single clock hook ───────────────────────────────────────────────────────

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
      const now = Date.now();
      const d   = new Date();

      setColon(d.getSeconds() % 2 === 0);
      setH(String(d.getHours()).padStart(2, "0"));
      setM(String(d.getMinutes()).padStart(2, "0"));
      setS(String(d.getSeconds()).padStart(2, "0"));

      if (modeRef.current !== "glitch" && now - easterRef.current >= EASTER_MS) {
        easterRef.current = now; modeRef.current = "glitch";
        modeStart.current = now; setMode("glitch"); return;
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

// ─── Display strings per mode ────────────────────────────────────────────────

function getLabel(mode: Mode, h: string, m: string, colonOn: boolean): string {
  const sep = colonOn ? ":" : "\u200B:"; // zero-width space before colon keeps width stable
  switch (mode) {
    case "clock":  return `${h}:${m}`;
    case "glitch": return `rE:d15tr1Ct`;
    default:       return `RE:DISTRICT`;
  }
}

// ─── THE DISPLAY — rebuilt from zero ────────────────────────────────────────
//
// Centering approach: block-level div, text-align center.
// No grid. No flex with items. No padding offsets.
// The text renders as a single inline string — browser centres it naturally.
// Colon opacity is handled via a nested <span> inside the string.
//
// This is the simplest and most reliable approach for pixel-perfect centering.
// All three modes share IDENTICAL container, IDENTICAL font rules.
// Only the string content changes.

interface DisplayProps {
  mode:  Mode;
  h:     string;
  m:     string;
  colon: boolean;
}

function Display({ mode, h, m, colon }: DisplayProps) {
  // Build left/colon/right parts so we can animate colon opacity
  let left: string, right: string;
  switch (mode) {
    case "clock":  left = h;    right = m;          break;
    case "glitch": left = "rE"; right = "d15tr1Ct"; break;
    default:       left = "RE"; right = "DISTRICT";
  }

  return (
    <div
      style={{
        // Absolute centering anchor — no inherited flex/grid interference
        position  : "relative",
        width     : "100%",
        textAlign : "center",
        lineHeight: 1,
        paddingLeft : "4vw",
        paddingRight: "4vw",
      }}
    >
      <span
        style={{
          display      : "inline-block",   // shrink-wraps to text width
          fontFamily   : "ui-monospace, 'Roboto Mono', 'Courier New', monospace",
          fontWeight   : 300,
          fontSize     : "clamp(2.2rem, 9vw, 8.5rem)",
          letterSpacing: "-0.02em",
          lineHeight   : 1,
          color        : "#ffffff",
          whiteSpace   : "nowrap",
          // NO transform, NO margin, NO padding — browser centres via text-align
        }}
      >
        {left}
        <span
          style={{
            opacity   : colon ? 1 : 0.1,
            transition: "opacity 60ms steps(1)",
          }}
        >
          :
        </span>
        {right}
      </span>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const { t } = useLang();
  const { mode, colon, h, m, s, city } = useClockState();

  return (
    <section
      className="relative flex flex-col bg-black overflow-hidden"
      style={{ height: "100svh", minHeight: "620px" }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Top status bar — nudged down slightly ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12"
        style={{ paddingTop: "clamp(6rem, 11vh, 8rem)" }}
      >
        <span className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono">
          {t("Est. 2026", "Осн. 2026")}
        </span>
        <span className="text-[9px] tracking-[0.45em] uppercase text-zinc-700 font-mono hidden sm:block">
          {t("Custom · Restored · Curated", "Кастом · Реставрация · Подбор")}
        </span>
      </motion.div>

      {/* ── Centre: display + sub-info + slogan + CTA ── */}
      <div
        className="relative z-10 flex-1 flex flex-col justify-center"
        style={{ gap: 0 }}
      >
        {/* MAIN DISPLAY */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginBottom: "clamp(1rem, 2.5vh, 2rem)" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "linear" }}
            >
              <Display mode={mode} h={h} m={m} colon={colon} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* SUB-DISPLAY: seconds + city — fixed height, only in clock mode */}
        <div
          className="flex items-center justify-center"
          style={{ height: "20px", marginBottom: "clamp(1rem, 2vh, 1.5rem)" }}
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
                <span className="text-[11px] font-mono text-zinc-600 tabular-nums tracking-widest">:{s}</span>
                <span className="w-px h-3 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">{city}</span>
                <span className="w-px h-3 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">RE:DISTRICT</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SEPARATOR */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mx-auto origin-center"
          style={{
            width: "min(24rem, 60vw)",
            height: "1px",
            background: "rgba(255,255,255,0.06)",
            marginBottom: "clamp(1rem, 2.5vh, 2rem)",
          }}
        />

        {/* SLOGAN */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-center"
          style={{ marginBottom: "clamp(1.5rem, 3vh, 2.5rem)" }}
        >
          <p className="text-[11px] md:text-xs font-mono tracking-[0.4em] uppercase text-zinc-500 mb-2">
            {t("Rebuild your time.", "Переосмысли своё время.")}
          </p>
          <p className="text-[10px] font-mono text-zinc-700 tracking-[0.25em]">
            {t("Time is the same for everyone. Watches are not.",
               "Время одинаково для каждого. Часы — нет.")}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/shop"
            className="text-[10px] tracking-[0.4em] uppercase font-mono text-black bg-white
                       hover:bg-zinc-200 px-8 py-3.5 transition-colors duration-200"
          >
            {t("Explore Watches", "Смотреть часы")}
          </Link>
          <Link
            href="/about"
            className="text-[10px] tracking-[0.4em] uppercase font-mono text-zinc-600 hover:text-white
                       border border-white/10 hover:border-white/30 px-8 py-3.5 transition-all duration-200"
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
