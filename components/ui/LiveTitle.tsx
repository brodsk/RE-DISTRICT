"use client";
import { useEffect } from "react";

// Title cycles: "RE:DISTRICT | Rebuild your time" (10s) → "HH:MM | Rebuild your time" (20s)
// Colon in HH:MM blinks. No mixing of states.

const BRAND_MS = 10_000;
const CLOCK_MS = 20_000;

export default function LiveTitle() {
  useEffect(() => {
    let mode: "brand" | "clock" = "brand";
    let modeStart = Date.now();
    let colonOn = true;

    const tick = () => {
      const now     = Date.now();
      const elapsed = now - modeStart;

      if (mode === "brand" && elapsed >= BRAND_MS) {
        mode      = "clock";
        modeStart = now;
      } else if (mode === "clock" && elapsed >= CLOCK_MS) {
        mode      = "brand";
        modeStart = now;
      }

      if (mode === "brand") {
        document.title = "RE:DISTRICT | Rebuild your time";
      } else {
        const d = new Date();
        const h = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const sep = colonOn ? ":" : "\u2009"; // thin space keeps tab width stable
        document.title = `${h}${sep}${mm} | Rebuild your time`;
        colonOn = !colonOn;
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
