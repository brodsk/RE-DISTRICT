"use client";
import { useEffect } from "react";

// Favicon: black square, white colon, blinks every second
// Synced to second parity — same rule as Hero and Navigation
// Uses canvas → data URL so the blink is JS-driven and perfectly in sync

const SIZE = 32;

function drawFavicon(ctx: CanvasRenderingContext2D, colonOn: boolean) {
  // Background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (!colonOn) return; // colon invisible on odd seconds

  // Two square dots, vertically centred
  const dot  = 4;
  const cx   = SIZE / 2 - dot / 2;
  const midY = SIZE / 2;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx, midY - dot - 2, dot, dot); // top dot
  ctx.fillRect(cx, midY + 2,       dot, dot); // bottom dot
}

export default function DynamicFavicon() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const canvas  = document.createElement("canvas");
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const safeCtx = ctx;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";

    let lastSec = -1;

    const loop = () => {
      const sec = Math.floor(Date.now() / 1000);
      if (sec !== lastSec) {
        lastSec = sec;
        const colonOn = sec % 2 === 0; // same parity as Hero colon
        drawFavicon(safeCtx, colonOn);
        link!.href = canvas.toDataURL("image/png");
      }
      requestAnimationFrame(loop);
    };

    // Initial draw
    drawFavicon(safeCtx, true);
    link.href = canvas.toDataURL("image/png");

    const raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
