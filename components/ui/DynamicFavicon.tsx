"use client";
import { useEffect } from "react";

// Favicon: black background, white colon, blinks every ~900ms
// opacity 0 ↔ 1 — achieved by alternating the colon colour

const SIZE = 32;

function drawFavicon(ctx: CanvasRenderingContext2D, colonVisible: boolean) {
  // Black background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (!colonVisible) return; // fully invisible on "off" tick

  // Draw a clean colon: two small squares, vertically centred
  const dotSize = 4;
  const cx = SIZE / 2 - dotSize / 2;
  const midY = SIZE / 2;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx, midY - dotSize - 2, dotSize, dotSize); // top dot
  ctx.fillRect(cx, midY + 2, dotSize, dotSize);            // bottom dot
}

export default function DynamicFavicon() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const canvas = document.createElement("canvas");
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const safeCtx = ctx;

    // Find or create favicon link element
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";

    let colonOn = true;
    let lastSec = -1;

    const render = () => {
      const sec = Math.floor(Date.now() / 1000);
      if (sec === lastSec) {
        requestAnimationFrame(render);
        return;
      }
      lastSec  = sec;
      colonOn  = !colonOn;

      drawFavicon(safeCtx, colonOn);
      link!.href = canvas.toDataURL("image/png");

      requestAnimationFrame(render);
    };

    // Initial draw — colon visible
    drawFavicon(safeCtx, true);
    link.href = canvas.toDataURL("image/png");

    const raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
