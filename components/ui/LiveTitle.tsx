"use client";
import { useEffect } from "react";

const BRAND_MS = 10_000;
const CLOCK_MS = 20_000;

export default function LiveTitle() {
  useEffect(() => {
    let mode: "brand" | "clock" = "brand";
    let start = Date.now();
    const tick = () => {
      const now = Date.now();
      if (mode === "brand" && now - start >= BRAND_MS) { mode = "clock"; start = now; }
      else if (mode === "clock" && now - start >= CLOCK_MS) { mode = "brand"; start = now; }
      const on  = new Date().getSeconds() % 2 === 0;
      const sep = on ? ":" : "\u2006";
      if (mode === "brand") {
        document.title = `RE${sep}DISTRICT | Rebuild your time`;
      } else {
        const d = new Date();
        const h = String(d.getHours()).padStart(2, "0");
        const m = String(d.getMinutes()).padStart(2, "0");
        document.title = `${h}${sep}${m} | Rebuild your time`;
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => { clearInterval(id); document.title = "RE:DISTRICT | Rebuild your time"; };
  }, []);
  return null;
}
