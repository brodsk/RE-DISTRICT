"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/lang";

// ─── Types & constants ─────────────────────────────────────────────────────────

type Mode = "brand" | "clock" | "glitch";

const BRAND_MS  = 10_000;
const CLOCK_MS  = 20_000;
const GLITCH_MS =  5_000;
const EASTER_MS =  5 * 60_000;

// ─── Timezone → city name ──────────────────────────────────────────────────────

function getCity(): string {
  try {
    const tz  = Intl.DateTimeFormat().resolvedOptions().timeZone; // "Europe/Moscow"
    const raw = tz.split("/").pop() ?? "LOCAL";
    return raw.replace(/_/g, " ");                                // "New_York" → "New York"
  } catch {
    return "LOCAL";
  }
}

// ─── Clock state hook ──────────────────────────────────────────────────────────

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
    setCity(getCity());

    const tick = () => {
      const now = Date.now();
      const d   = new Date();

      setColon(d.getSeconds() % 2 === 0);
      setH(String(d.getHours()).padStart(2, "0"));
      setM(String(d.getMinutes()).padStart(2, "0"));
      setS(String(d.getSeconds()).padStart(2, "0"));

      if (modeRef.current !== "glitch" && now - easterRef.current >= EASTER_MS) {
        easterRef.current = now;
        modeRef.current   = "glitch";
        modeStart.current = now;
        setMode("glitch");
        return;
      }

      const elapsed = now - modeStart.current;
      if      (modeRef.current === "glitch" && elapsed >= GLITCH_MS) { modeRef.current = "brand"; modeStart.current = now; setMode("brand"); }
      else if (modeRef.current === "brand"  && elapsed >= BRAND_MS)  { modeRef.current = "clock"; modeStart.current = now; setMode("clock"); }
      else if (modeRef.current === "clock"  && elapsed >= CLOCK_MS)  { modeRef.current = "brand"; modeStart.current = now; setMode("brand"); }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { mode, colon, h, m, s, city };
}

// ─── Content per mode ──────────────────────────────────────────────────────────
// Each mode returns { left, right } strings only.
// The single shared renderer below handles all sizing/centering.

interface Sides { left: string; right: string }

function getSides(mode: Mode, h: string, m: string): Sides {
  switch (mode) {
    case "clock":  return { left: h,    right: m          };
    case "glitch": return { left: "rE", right: "d15tr1Ct" };
    default:       return { left: "RE", right: "DISTRICT" };
  }
}

// ─── THE SINGLE DISPLAY RENDERER ───────────────────────────────────────────────
//
// ALL three states share:
//   • identical outer container  (w-full max-w-[820px])
//   • identical CSS grid         (1fr auto 1fr)
//   • identical font-size        (clamp)
//   • identical font-weight / family / tracking
//
// Only the LEFT and RIGHT string content changes.
// The colon column is always auto-width, always at grid centre → viewport centre.
//
// Font-size is deliberately unified. Clock digits are wider characters;
// brand text is narrower. The grid absorbs that naturally — left/right
// columns grow/shrink symmetrically, colon never moves.

interface DisplayProps {
  left:   string;
  right:  string;
  colon:  boolean;
}

function Display({ left, right, colon }: DisplayProps) {
  return (
    <div
      className="w-full grid items-baseline select-none"
      style={{
        // ── Shared values — never change between modes ──
        gridTemplateColumns : "1fr auto 1fr",
        fontSize            : "clamp(3rem, 13.5vw, 13rem)",
        fontFamily          : "var(--font-mono, ui-monospace, monospace)",
        fontWeight          : 300,
        letterSpacing       : "-0.02em",
        lineHeight          : 1,
      }}
    >
      {/* Left — right-aligned, grows leftward from colon */}
      <span className="text-right text-white tabular-nums whitespace-nowrap">
        {left}
      </span>

      {/* Colon — fixed auto column, always at grid centre */}
      <span
        className="text-white"
        style={{
          opacity    : colon ? 1 : 0.1,
          transition : "opacity 60ms steps(1)",
          padding    : "0 0.05em",
        }}
      >
        :
      </span>

      {/* Right — left-aligned, grows rightward from colon */}
      <span className="text-left text-white tabular-nums whitespace-nowrap">
        {right}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const { t } = useLang();
  const { mode, colon, h, m, s, city } = useClockState();

  const { left, right } = getSides(mode, h, m);

  return (
    <section
      className="relative flex flex-col bg-black overflow-hidden"
      style={{ height: "100svh", minHeight: "620px" }}
    >
      {/* Background grid — device interface texture */}
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

      {/* ── Centre display area ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8">

        {/* ── SINGLE DISPLAY CONTAINER — identical for all modes ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-[820px] mb-6 md:mb-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "linear" }}
            >
              <Display left={left} right={right} colon={colon} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Sub-display: seconds + city + system tag ── */}
        {/* Fixed height so the layout below never shifts */}
        <div className="h-[20px] flex items-center justify-center mb-6 md:mb-8">
          <AnimatePresence mode="wait">
            {mode === "clock" ? (
              <motion.div
                key="sub-on"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4"
              >
                <span className="text-[11px] font-mono text-zinc-600 tabular-nums tracking-widest">
                  :{s}
                </span>
                <span className="w-px h-3 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
                  {city}
                </span>
                <span className="w-px h-3 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">
                  RE:DISTRICT
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="sub-off"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="w-full max-w-md h-px bg-white/6 mb-7 md:mb-9 origin-center"
        />

        {/* Slogan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-center mb-9 md:mb-11"
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center gap-4"
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
