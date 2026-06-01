"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);

  return (
    <section
      ref={ref}
      className="relative py-40 md:py-64 overflow-hidden bg-black"
    >
      {/* Parallax bg image */}
      <motion.div
        style={{ scale }}
        className="absolute inset-0"
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1600&q=80')",
            filter: "brightness(0.15) grayscale(0.5)",
          }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-12 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-10"
        >
          Philosophy
        </motion.p>

        <motion.blockquote
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-light leading-tight text-white max-w-4xl mx-auto mb-12"
        >
          "We don't manufacture history.
          <br />
          <span className="italic text-zinc-400">
            We find it, restore it, and give it a new place
          </span>
          <br />
          on your wrist."
        </motion.blockquote>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-16 h-px bg-white/30 mx-auto mb-10 origin-center"
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xs tracking-[0.3em] uppercase text-zinc-600 font-mono"
        >
          RE:DISTRICT — Rebuild your time.
        </motion.p>
      </motion.div>
    </section>
  );
}
