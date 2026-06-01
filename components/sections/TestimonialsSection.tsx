"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { testimonials } from "@/lib/data";

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-28 md:py-40 px-6 md:px-12 bg-zinc-950">
      <div className="max-w-screen-xl mx-auto">
        <AnimatedSection className="mb-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
            From Our Clients
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-light">
            The watches
            <br />
            <span className="italic">speak for themselves.</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Quote */}
          <div className="min-h-[280px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <span className="font-display text-[6rem] leading-none text-white/5 select-none absolute -top-4 -left-2">
                  "
                </span>
                <blockquote className="font-display text-2xl md:text-3xl font-light leading-snug text-white/90 mb-8 relative z-10 pt-4">
                  {testimonials[active].text}
                </blockquote>
                <div>
                  <p className="text-sm text-white font-medium">
                    {testimonials[active].author}
                  </p>
                  <p className="text-xs text-zinc-600 font-mono tracking-wider">
                    {testimonials[active].location} ·{" "}
                    {testimonials[active].watch}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Selector */}
          <div className="space-y-0 border-l border-white/8 pl-8 md:pl-16">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className={`w-full text-left py-6 border-b border-white/8 transition-all duration-300 group ${
                  active === i ? "" : "opacity-40 hover:opacity-70"
                }`}
              >
                <p
                  className={`font-display text-xl font-light mb-1 transition-colors ${
                    active === i ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {t.author}
                </p>
                <p className="text-xs font-mono tracking-wider text-zinc-600">
                  {t.location}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
