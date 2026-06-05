"use client";
import { useEffect, useRef } from "react";

// ─── Pixel font bitmap: each char is a 3×5 grid (15 bits, top-left first) ───
// Classic 7-segment-style LCD digits and letters
const GLYPHS: Record<string, number[][]> = {
  "0": [
    [1,1,1],
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,1,1],
  ],
  "1": [
    [0,1,0],
    [1,1,0],
    [0,1,0],
    [0,1,0],
    [1,1,1],
  ],
  "2": [
    [1,1,1],
    [0,0,1],
    [1,1,1],
    [1,0,0],
    [1,1,1],
  ],
  "3": [
    [1,1,1],
    [0,0,1],
    [0,1,1],
    [0,0,1],
    [1,1,1],
  ],
  "4": [
    [1,0,1],
    [1,0,1],
    [1,1,1],
    [0,0,1],
    [0,0,1],
  ],
  "5": [
    [1,1,1],
    [1,0,0],
    [1,1,1],
    [0,0,1],
    [1,1,1],
  ],
  "6": [
    [1,1,1],
    [1,0,0],
    [1,1,1],
    [1,0,1],
    [1,1,1],
  ],
  "7": [
    [1,1,1],
    [0,0,1],
    [0,1,0],
    [0,1,0],
    [0,1,0],
  ],
  "8": [
    [1,1,1],
    [1,0,1],
    [1,1,1],
    [1,0,1],
    [1,1,1],
  ],
  "9": [
    [1,1,1],
    [1,0,1],
    [1,1,1],
    [0,0,1],
    [1,1,1],
  ],
  ":": [
    [0,0,0],
    [0,1,0],
    [0,0,0],
    [0,1,0],
    [0,0,0],
  ],
  " ": [
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
  ],
  // RE:DISTRICT brand mark letters
  "R": [
    [1,1,0],
    [1,0,1],
    [1,1,0],
    [1,0,1],
    [1,0,1],
  ],
  "E": [
    [1,1,1],
    [1,0,0],
    [1,1,0],
    [1,0,0],
    [1,1,1],
  ],
  "D": [
    [1,1,0],
    [1,0,1],
    [1,0,1],
    [1,0,1],
    [1,1,0],
  ],
  "I": [
    [1,1,1],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [1,1,1],
  ],
  "S": [
    [1,1,1],
    [1,0,0],
    [1,1,1],
    [0,0,1],
    [1,1,1],
  ],
  "T": [
    [1,1,1],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [0,1,0],
  ],
  "C": [
    [1,1,1],
    [1,0,0],
    [1,0,0],
    [1,0,0],
    [1,1,1],
  ],
};

const PIXEL = 3;      // size of each pixel block
const GAP   = 1;      // gap between glyphs
const ROWS  = 5;      // glyph height in pixels
const COLS  = 3;      // glyph width in pixels

// Canvas is 32×32
const SIZE  = 32;

function glyphWidth(ch: string) {
  return COLS * PIXEL;
}

function textWidth(str: string) {
  return str.length * (COLS * PIXEL + GAP) - GAP;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  startX: number,
  startY: number,
  color: string,
  dimColor: string,
  showColon: boolean
) {
  let x = startX;
  for (const ch of text) {
    const glyph = GLYPHS[ch] ?? GLYPHS[" "];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const on = glyph[row][col] === 1;
        // For colon: respect blink state
        const isColonPixel = ch === ":";
        const lit = on && (!isColonPixel || showColon);
        ctx.fillStyle = lit ? color : dimColor;
        if (lit || dimColor !== "transparent") {
          ctx.fillRect(
            x + col * PIXEL,
            startY + row * PIXEL,
            PIXEL - 0,
            PIXEL - 0
          );
        }
      }
    }
    x += COLS * PIXEL + GAP;
  }
}

// ─── Draw BRAND state: "RE:D" on line 1, "ISTR" line 2, "ICT" line 3 ───────
// Actually lay out "RE:" on top row, "DIST" second, "RICT" third
// Given 32px canvas and 3px pixels + 1px gap = 4px per char:
// "RE:D" = 4 chars × 4px - 1 = 15px, fits in 32px with margin
// We'll do two rows: "RE:" and "DIST" won't fit. Let's do a compact brand mark.
//
// Best layout for 32×32:
// Line 1 (y=2):  "RE:"   → 3 chars = 11px
// Line 2 (y=10): "DIST"  → 4 chars = 15px  
// Line 3 (y=18): "RICT"  → 4 chars = 15px
// That's 3 lines × 7px (5px glyph + 2px gap) = 21px, centred vertically

function drawBrand(ctx: CanvasRenderingContext2D, showColon: boolean) {
  ctx.clearRect(0, 0, SIZE, SIZE);

  // Background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const white = "#ffffff";
  const dim   = "rgba(255,255,255,0.08)";

  const lines = ["RE:", "DIST", "RICT"];
  const lineH = ROWS * PIXEL + 3; // 5*3 + 3 = 18 — too tall for 3 lines in 32px
  // Use 5px glyph rows × 3px pixel + 2px line gap = 17px * 3 lines > 32
  // Reduce: use PIXEL=2 for brand to fit 3 lines
  const P = 2;
  const lineH2 = ROWS * P + 2;
  const totalH = lines.length * lineH2 - 2;
  let y = Math.floor((SIZE - totalH) / 2);

  for (const line of lines) {
    const w = line.length * (COLS * P + 1) - 1;
    let x = Math.floor((SIZE - w) / 2);
    for (const ch of line) {
      const glyph = GLYPHS[ch] ?? GLYPHS[" "];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const on = glyph[row][col] === 1;
          const isColonPixel = ch === ":";
          const lit = on && (!isColonPixel || showColon);
          ctx.fillStyle = lit ? white : dim;
          ctx.fillRect(x + col * P, y + row * P, P, P);
        }
      }
      x += COLS * P + 1;
    }
    y += lineH2;
  }
}

// ─── Draw CLOCK state: HH:MM in large digits ────────────────────────────────
// Two rows: "HH" top, ":MM" bottom — or "H:M" / "M:S" single row
// Best: "HH:MM" as single row — 5 chars × (3*2+1) = 5*7-1 = 34 — just over 32
// Use pixel=2: 5*(3*2+1)-1 = 34px... still over
// Shrink gap to 0: 5*3*2 = 30px ✓ at pixel=2, no gap
// Let's do HH on top row, MM on bottom row, colon in middle

function drawClock(ctx: CanvasRenderingContext2D, h: number, m: number, showColon: boolean) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const white = "#ffffff";
  const dim   = "rgba(255,255,255,0.08)";

  const P = 3; // pixel size
  const G = 1; // gap between chars
  const charW = COLS * P + G; // 10px per char

  // Layout: two chars on top row, colon in middle, two chars on bottom
  // "HH" at top, "MM" at bottom, colon centred
  const hStr = String(h).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");

  // Top row: HH, centred
  const rowW = 2 * charW - G; // 2 chars
  const rowX = Math.floor((SIZE - rowW) / 2);

  // We have ~32px height. Layout:
  // HH row: y=2, height=15 (5*3)
  // colon:  y=18+1, height=3 (1 dot)
  // MM row: y=?  — doesn't fit
  // 
  // Better: HH:MM in one row at P=2
  // 5 chars × (3*2 + 1) - 1 = 34px wide — 2px over
  // At P=2, G=0: 5 * 3*2 = 30px wide ✓
  // Height: 5*2 = 10px — too small
  // 
  // BEST: "HH" top (P=3), "MM" bottom (P=3), colon dots centred between
  // HH: y=1,  height=15
  // gap: 1px
  // colon dots: y=17 and y=21 (2 dots, 2px each)
  // MM: y=25? — doesn't fit in 32
  //
  // FINAL: use P=2 for both rows
  // HH: y=3,  height=10
  // gap: 2px
  // colon: y=15, dots at y=15 and y=19
  // MM: y=21, height=10  → y=21+10=31 ✓

  const P2 = 2;
  const G2 = 1;
  const charW2 = COLS * P2 + G2; // 7px
  const rowW2  = 2 * charW2 - G2; // 13px
  const rx = Math.floor((SIZE - rowW2) / 2);

  // Draw HH
  let x = rx;
  for (const ch of hStr) {
    const glyph = GLYPHS[ch]!;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const on = glyph[row][col] === 1;
        ctx.fillStyle = on ? white : dim;
        ctx.fillRect(x + col * P2, 3 + row * P2, P2, P2);
      }
    }
    x += charW2;
  }

  // Draw colon dots (centred horizontally)
  const cx = Math.floor(SIZE / 2) - P2 / 2;
  if (showColon) {
    ctx.fillStyle = white;
  } else {
    ctx.fillStyle = dim;
  }
  ctx.fillRect(cx - 1, 14, P2, P2); // top dot
  ctx.fillRect(cx - 1, 18, P2, P2); // bottom dot

  // Draw MM
  x = rx;
  for (const ch of mStr) {
    const glyph = GLYPHS[ch]!;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const on = glyph[row][col] === 1;
        ctx.fillStyle = on ? white : dim;
        ctx.fillRect(x + col * P2, 22 + row * P2, P2, P2);
      }
    }
    x += charW2;
  }
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function DynamicFavicon() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef  = useRef<{
    mode: "brand" | "clock";
    modeStart: number;
    colonOn: boolean;
    raf: number;
  }>({
    mode: "brand",
    modeStart: Date.now(),
    colonOn: true,
    raf: 0,
  });

  useEffect(() => {
    // SSR / no canvas support guard
    if (typeof document === "undefined") return;

    const canvas = document.createElement("canvas");
    canvas.width  = SIZE;
    canvas.height = SIZE;
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const safeCtx = ctx; // captured as non-null for closure use

    // Find or create <link rel="icon">
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";

    const BRAND_MS = 10_000;
    const CLOCK_MS = 20_000;

    let lastSecond = -1;

    function tick() {
      const now     = Date.now();
      const elapsed = now - stateRef.current.modeStart;
      const state   = stateRef.current;

      // Switch mode
      if (state.mode === "brand" && elapsed >= BRAND_MS) {
        state.mode      = "clock";
        state.modeStart = now;
      } else if (state.mode === "clock" && elapsed >= CLOCK_MS) {
        state.mode      = "brand";
        state.modeStart = now;
      }

      // Colon blinks every second
      const sec = Math.floor(now / 1000);
      if (sec !== lastSecond) {
        lastSecond       = sec;
        state.colonOn    = !state.colonOn;

        // Redraw
        if (state.mode === "brand") {
          drawBrand(safeCtx, state.colonOn);
        } else {
          const d = new Date();
          drawClock(safeCtx, d.getHours(), d.getMinutes(), state.colonOn);
        }

        link!.href = canvas.toDataURL("image/png");
      }

      state.raf = requestAnimationFrame(tick);
    }

    // Initial draw immediately
    drawBrand(safeCtx, true);
    link.href = canvas.toDataURL("image/png");

    stateRef.current.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(stateRef.current.raf);
    };
  }, []);

  return null; // renders nothing to the DOM
}
