"use client";
import { useEffect } from "react";

// Title tab blinks in sync with the colon system:
// - Uses seconds parity (same rule as HeroSection / Navigation)
// - Brand state: alternates "RE:DISTRICT" ↔ "RE DISTRICT" (colon appears/disappears)
// - Clock state: shows "HH:MM" with blinking colon → "HH MM"
// - Format: "RE:DISTRICT | HH:MM" suffix always readable

const BRAND_MS = 10_000;
const CLOCK_MS = 20_000;

export default function LiveTitle() {
  useEffect(() => {
    let mode: "brand" | "clock" = "brand";
    let modeStart = Date.now();

    const tick = () => {
      const now     = Date.now();
      const elapsed = now - modeStart;
      const d       = new Date();

      // ── Mode switch ──
      if (mode === "brand" && elapsed >= BRAND_MS) {
        mode = "clock"; modeStart = now;
      } else if (mode === "clock" && elapsed >= CLOCK_MS) {
        mode = "brand"; modeStart = now;
      }

      // ── Colon blink: even seconds = colon visible ──
      const colonOn = d.getSeconds() % 2 === 0;
      const sep     = colonOn ? ":" : "\u2006"; // thin space — keeps tab width stable

      if (mode === "brand") {
        // RE:DISTRICT / RE DISTRICT — the colon itself blinks
        document.title = colonOn
          ? "RE:DISTRICT | Rebuild your time"
          : "RE\u2006DISTRICT | Rebuild your time";
      } else {
        const h  = String(d.getHours()).padStart(2, "0");
        const m  = String(d.getMinutes()).padStart(2, "0");
        document.title = `${h}${sep}${m} · RE:DISTRICT`;
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => {
      clearInterval(id);
      document.title = "RE:DISTRICT — Rebuild Your Time";
    };
  }, []);

  return null;
}
