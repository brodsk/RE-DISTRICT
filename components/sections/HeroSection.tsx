"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/lang";

// ── State machine ──────────────────────────────────────────────────────────
// Modes in normal cycle:   "brand" (10s) → "clock" (20s) → repeat
// Easter egg every 5 min:  inject "glitch" for 5s, then resume cycle

type Mode = "brand" | "clock" | "glitch";

const BRAND_MS  = 10_000;
const CLOCK_MS  = 20_000;
const GLITCH_MS =  5_000;
const EASTER_MS = 5 * 60_000; // 5 minutes

function useMainState() {
  const [mode, setMode]       = useState<Mode>("brand");
  const [colon, setColon]     = useState(true);
  const [h, setH]             = useState("--");
  const [m, setM]             = useState("--");

  const modeRef    = useRef<Mode>("brand");
  const modeStart  = useRef(Date.now());
  const easterRef  = useRef(Date.now()); // last easter egg trigger

  useEffect(() => {
    const tick = () => {
      const now = Date.now();

      // ── Easter egg check ──
      if (
        modeRef.current !== "glitch" &&
        now - easterRef.current >= EASTER_MS
      ) {
        easterRef.current = now;
        modeRef.current   = "glitch";
        modeStart.current = now;
        setMode("glitch");
        return;
      }

      // ── Normal cycle ──
      const elapsed = now - modeStart.current;

      if (modeRef.current === "glitch" && elapsed >= GLITCH_MS) {
        modeRef.current   = "brand";
        modeStart.current = now;
        setMode("brand");
      } else if (modeRef.current === "brand" && elapsed >= BRAND_MS) {
        modeRef.current   = "clock";
        modeStart.current = now;
        setMode("clock");
      } else if (modeRef.current === "clock" && elapsed >= CLOCK_MS) {
        modeRef.current   = "brand";
        modeStart.current = now;
        setMode("brand");
      }

      // ── Clock values ──
      const d = new Date();
      setH(String(d.getHours()).padStart(2, "0"));
      setM(String(d.getMinutes()).padStart(2, "0"));
      setColon((prev) => !prev);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { mode, colon, h, m };
}

// ── Content per mode ───────────────────────────────────────────────────────
function BrandDisplay() {
  return (
    <span
      className="font-mono font-light tracking-tight text-white select-none"
      style={{ fontSize: "clamp(2.6rem, 11vw, 10rem)", letterSpacing: "-0.01em" }}
    >
      RE:DISTRICT
    </span>
  );
}

function ClockDisplay({ h, m, colon }: { h: string; m: string; colon: boolean }) {
  return (
    <span
      className="font-mono font-light text-white select-none tabular-nums"
      style={{ fontSize: "clamp(4rem, 18vw, 14rem)", letterSpacing: "-0.02em" }}
    >
      {h}
      <span
        style={{ opacity: colon ? 1 : 0.12, transition: "opacity 80ms linear" }}
      >:</span>
      {m}
    </span>
  );
}

function GlitchDisplay() {
  return (
    <span
      className="font-mono font-light text-white select-none"
      style={{
        fontSize: "clamp(1.6rem, 7vw, 7rem)",
        letterSpacing: "-0.01em",
        opacity: 0.85,
        // subtle static effect via text-shadow
        textShadow:
          "2px 0 rgba(255,255,255,0.15), -2px 0 rgba(255,255,255,0.08)",
      }}
    >
      rE:d15tr1Ct
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function HeroSection() {
  const { t } = useLang();
  const { mode, colon, h, m } = useMainState();

  return (
    <section
      className="relative flex flex-col bg-black overflow-hidden"
      style={{ height: "100svh", minHeight: "600px" }}
    >
      {/* ── THE SINGLE CENTRE DISPLAY ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "linear" }}
            className="flex items-center justify-center"
          >
            {mode === "brand"  && <BrandDisplay />}
            {mode === "clock"  && <ClockDisplay h={h} m={m} colon={colon} />}
            {mode === "glitch" && <GlitchDisplay />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Minimal bottom nav hint ── */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 pb-8 md:pb-10">
        <div className="flex items-center gap-5">
          <Link
            href="/shop"
            className="text-[9px] font-mono tracking-[0.35em] uppercase text-zinc-700 hover:text-white transition-colors duration-200"
          >
            {t("Shop", "Каталог")}
          </Link>
          <span className="w-px h-3 bg-zinc-800" />
          <Link
            href="/about"
            className="text-[9px] font-mono tracking-[0.35em] uppercase text-zinc-700 hover:text-white transition-colors duration-200"
          >
            {t("About", "О нас")}
          </Link>
        </div>

        <span className="text-[8px] font-mono text-zinc-800 tracking-[0.3em] uppercase hidden sm:block">
          Casio · Seiko · Orient · Citizen
        </span>
      </div>
    </section>
  );
}
