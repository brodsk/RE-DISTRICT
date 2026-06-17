"use client";
import { useEffect } from "react";

const SIZE = 32;

function draw(ctx: CanvasRenderingContext2D, on: boolean) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, SIZE, SIZE);
  if (!on) return;
  const dot = 5, cx = SIZE / 2 - dot / 2, midY = SIZE / 2;
  ctx.fillStyle = "#fff";
  ctx.fillRect(cx, midY - dot - 1, dot, dot);
  ctx.fillRect(cx, midY + 1,       dot, dot);
}

export default function DynamicFavicon() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }

    let lastSec = -1;
    const loop = () => {
      const sec = Math.floor(Date.now() / 1000);
      if (sec !== lastSec) {
        lastSec = sec;
        draw(ctx, sec % 2 === 0);
        link!.href = canvas.toDataURL("image/png");
      }
      requestAnimationFrame(loop);
    };

    draw(ctx, true);
    link.href = canvas.toDataURL("image/png");
    const raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
