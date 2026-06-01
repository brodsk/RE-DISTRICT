"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    const checkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverable =
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[data-hover]");
      setIsHovering(!!hoverable);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", checkHover);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", checkHover);
    };
  }, []);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let frame: number;
    const animate = () => {
      setTrail((prev) => ({
        x: lerp(prev.x, pos.x, 0.08),
        y: lerp(prev.y, pos.y, 0.08),
      }));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pos]);

  return (
    <>
      {/* Trail */}
      <div
        className="fixed pointer-events-none z-[9998] hidden md:block"
        style={{
          left: trail.x - 20,
          top: trail.y - 20,
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          transition: "none",
        }}
      />
      {/* Dot */}
      <div
        className="fixed pointer-events-none z-[9999] hidden md:block"
        style={{
          left: pos.x - (isHovering ? 16 : 3),
          top: pos.y - (isHovering ? 16 : 3),
          width: isHovering ? 32 : 6,
          height: isHovering ? 32 : 6,
          borderRadius: "50%",
          background: isHovering ? "transparent" : "rgba(255,255,255,0.9)",
          border: isHovering ? "1px solid rgba(255,255,255,0.6)" : "none",
          transition: "width 0.2s, height 0.2s, left 0.02s, top 0.02s",
        }}
      />
    </>
  );
}
