"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&q=85')",
          filter: "brightness(0.35)",
        }}
      />

      {/* Gradient overlay bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      {/* Vertical text left — desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        <span className="w-px h-12 bg-white/20 inline-block" />
        <span className="text-[10px] tracking-[0.35em] uppercase text-zinc-600 font-mono">
          Independent Watch Brand
        </span>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-12 pb-16 md:pb-24 max-w-screen-xl mx-auto">
        <div className="max-w-4xl">
          {/* Tag */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[10px] tracking-[0.4em] uppercase text-zinc-500 font-mono mb-8"
          >
            Est. 2024 — Custom · Restored · Curated
          </motion.p>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-display text-7xl md:text-9xl lg:text-[11rem] font-light leading-none tracking-tight mb-8 text-white"
          >
            RE:
            <br />
            <span className="italic">DISTRICT</span>
          </motion.h1>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9 }}
            className="flex flex-col md:flex-row md:items-end gap-6 md:gap-16 mb-12"
          >
            <div>
              <p className="text-xl md:text-2xl font-display font-light text-white/90 mb-1">
                Rebuild your time.
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed font-light italic font-display">
                Время одинаково для каждого.
                <br />
                Часы — нет.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-4 group"
            >
              <span className="text-xs tracking-[0.35em] uppercase text-white border border-white/30 hover:border-white/80 hover:bg-white hover:text-black px-8 py-4 transition-all duration-400 bg-black/20 backdrop-blur-sm">
                Explore Watches
              </span>
              <span className="w-8 h-px bg-white/30 group-hover:w-16 group-hover:bg-white transition-all duration-400" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 right-8 md:right-12 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"
        />
        <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-700 font-mono">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
