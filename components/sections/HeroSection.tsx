"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLang } from "@/lib/lang";

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const { t } = useLang();

  // Title morphs into nav on scroll
  const titleScale = useTransform(scrollYProgress, [0, 0.32], [1, 0.085]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.32], ["0%", "-200%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-black"
      style={{ height: "100svh", minHeight: "640px" }}
    >
      {/* Background — using <img> for reliable mobile rendering */}
      <img
        src="https://images.unsplash.com/photo-1611170997960-a2631d0ec2e2?w=1200&q=80"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ opacity: 0.32 }}
        fetchPriority="high"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* Vertical side text — desktop only */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        style={{ opacity: contentOpacity }}
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3 z-10"
      >
        <div
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          className="flex items-center gap-3"
        >
          <span className="w-px h-12 bg-white/20 inline-block" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-zinc-600 font-mono">
            {t("Independent Watch Brand", "Независимый часовой бренд")}
          </span>
        </div>
      </motion.div>

      {/* ── HERO TITLE — absolute, vertically centred, shrinks into nav on scroll ── */}
      <motion.div
        style={{
          scale: titleScale,
          opacity: titleOpacity,
          y: titleY,
          transformOrigin: "left top",
          position: "absolute",
          // On mobile: sit a bit above centre so bottom content has space
          top: "50%",
          left: "1.5rem",
          right: "1.5rem",
          marginTop: "-2rem",       // nudge up slightly
          zIndex: 20,
        }}
        className="md:!left-12 md:!right-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-display font-light leading-[0.92] tracking-tight text-white select-none"
          style={{
            // Mobile: fit "DISTRICT" (widest word, italic) in ~390px viewport
            // At 390px → 13.5vw ≈ 52px per char × 8 chars = 416px — too wide
            // Use 12vw for mobile so italic DISTRICT fits safely
            fontSize: "clamp(3.8rem, 12vw, 15rem)",
          }}
        >
          RE:
          <br />
          <span className="italic">DISTRICT</span>
        </motion.h1>
      </motion.div>

      {/* ── BOTTOM CONTENT (tagline + CTA) ── */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-12 pb-12 md:pb-20"
      >
        <div className="max-w-screen-xl mx-auto">
          {/* Tag line */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[9px] tracking-[0.35em] uppercase text-zinc-500 font-mono mb-5"
          >
            {t(
              "Est. 2026 — Custom · Restored · Curated",
              "Осн. 2026 — Кастом · Реставрация · Подбор"
            )}
          </motion.p>

          {/* Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.9 }}
            className="mb-8"
          >
            <p className="text-lg md:text-2xl font-display font-light text-white/90 mb-1">
              {t("Rebuild your time.", "Переосмысли своё время.")}
            </p>
            <p className="text-sm text-zinc-500 leading-relaxed font-light italic font-display">
              {t("Time is the same for everyone.", "Время одинаково для каждого.")}
              <br />
              {t("Watches are not.", "Часы — нет.")}
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.8 }}
          >
            <Link href="/shop" className="inline-flex items-center gap-4 group">
              <span className="text-[11px] tracking-[0.3em] uppercase text-white border border-white/30 hover:border-white hover:bg-white hover:text-black px-7 py-3.5 transition-all duration-300 bg-black/30 backdrop-blur-sm">
                {t("Explore Watches", "Смотреть часы")}
              </span>
              <span className="w-6 h-px bg-white/30 group-hover:w-12 group-hover:bg-white transition-all duration-300 hidden sm:block" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-12 right-6 md:right-12 flex flex-col items-center gap-2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
        />
        <span className="text-[8px] tracking-[0.3em] uppercase text-zinc-700 font-mono">
          {t("Scroll", "Листать")}
        </span>
      </motion.div>
    </section>
  );
}
