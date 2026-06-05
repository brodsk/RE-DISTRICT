"use client";
import { useEffect } from "react";

export default function LiveTitle() {
  useEffect(() => {
    let colonOn = true;
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const colon = colonOn ? ":" : "\u200A"; // hair space when "off" — keeps width stable
      document.title = `RE:DISTRICT | ${h}${colon}${m}`;
      colonOn = !colonOn;
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
