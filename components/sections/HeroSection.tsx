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

  // Title morphs into the nav bar as you scroll
  const titleScale = useTransform(scrollYProgress, [0, 0.32], [1, 0.085]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.32], ["0%", "-200%"]);

  // Bottom content fades out
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex flex-col justify-end overflow-hidden bg-black"
      style={{ height: "100svh", minHeight: "700px" }}
    >
      {/* Background Image — Casio */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1611170997960-a2631d0ec2e2?w=1600&q=85')",
          filter: "brightness(0.30)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

      {/* Vertical side text — desktop */}
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

      {/* Animated hero title — shrinks up into nav on scroll */}
      <motion.div
        style={{
          scale: titleScale,
          opacity: titleOpacity,
          y: titleY,
          transformOrigin: "left top",
          position: "absolute",
          left: "1.5rem",
          top: "52%",
          zIndex: 20,
        }}
        className="md:left-12"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-display font-light leading-none tracking-tight text-white select-none"
          style={{ fontSize: "clamp(4.5rem, 17vw, 15rem)" }}
        >
          RE:
          <br />
          <span className="italic">DISTRICT</span>
        </motion.h1>
      </motion.div>

      {/* Bottom content */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 w-full px-6 md:px-12 pb-14 md:pb-20 max-w-screen-xl mx-auto"
      >
        {/* Tag */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-[10px] tracking-[0.4em] uppercase text-zinc-500 font-mono mb-6"
        >
          {t(
            "Est. 2026 — Custom · Restored · Curated",
            "Осн. 2026 — Кастом · Реставрация · Подбор"
          )}
        </motion.p>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.9 }}
          className="mb-10"
        >
          <p className="text-xl md:text-2xl font-display font-light text-white/90 mb-1">
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
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <Link href="/shop" className="inline-flex items-center gap-4 group">
            <span className="text-xs tracking-[0.35em] uppercase text-white border border-white/30 hover:border-white/80 hover:bg-white hover:text-black px-8 py-4 transition-all duration-300 bg-black/20 backdrop-blur-sm">
              {t("Explore Watches", "Смотреть часы")}
            </span>
            <span className="w-8 h-px bg-white/30 group-hover:w-16 group-hover:bg-white transition-all duration-300" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-10 right-8 md:right-12 flex flex-col items-center gap-2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"
        />
        <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-700 font-mono">
          {t("Scroll", "Листать")}
        </span>
      </motion.div>
    </section>
  );
}
