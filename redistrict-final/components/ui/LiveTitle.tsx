"use client";
import { useEffect } from "react";

// Tab title — two clean states, never combined:
//   brand mode (10s): "RE:DISTRICT | Rebuild your time"
//                     "RE DISTRICT | Rebuild your time"   ← colon blinks off
//   clock mode (20s): "14:23 | Rebuild your time"
//                     "14 23 | Rebuild your time"         ← colon blinks off
//
// Colon blink synced to second parity (sec % 2 === 0), same rule as hero.
// Thin space \u2006 replaces colon when off — keeps tab width stable.

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
      const colonOn = d.getSeconds() % 2 === 0;
      const sep     = colonOn ? ":" : "\u2006"; // thin space when off

      // Mode switch
      if (mode === "brand" && elapsed >= BRAND_MS) { mode = "clock"; modeStart = now; }
      else if (mode === "clock" && elapsed >= CLOCK_MS) { mode = "brand"; modeStart = now; }

      if (mode === "brand") {
        document.title = `RE${sep}DISTRICT | Rebuild your time`;
      } else {
        const h = String(d.getHours()).padStart(2, "0");
        const m = String(d.getMinutes()).padStart(2, "0");
        document.title = `${h}${sep}${m} | Rebuild your time`;
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => {
      clearInterval(id);
      document.title = "RE:DISTRICT | Rebuild your time";
    };
  }, []);

  return null;
}
