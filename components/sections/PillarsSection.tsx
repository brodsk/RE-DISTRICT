"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";

const pillars = [
  {
    number: "01",
    title: "Custom",
    subtitle: "Built for one.",
    description:
      "Unique modifications and complete custom builds. From PVD coating and dial replacements to full bespoke creations. Your vision, executed with precision.",
    href: "/shop?category=custom",
    image:
      "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&q=85",
  },
  {
    number: "02",
    title: "Restored",
    subtitle: "History preserved.",
    description:
      "Carefully restored vintage watches. Every component inspected, serviced, and returned to the standard of its original manufacture — with its character intact.",
    href: "/shop?category=restored",
    image:
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=85",
  },
  {
    number: "03",
    title: "Curated",
    subtitle: "Selected with intent.",
    description:
      "Pre-owned watches chosen for their character, condition, and story. Nothing generic. Everything deliberate.",
    href: "/shop?category=curated",
    image:
      "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&q=85",
  },
];

export default function PillarsSection() {
  return (
    <section className="py-28 md:py-40 px-6 md:px-12 bg-black">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <AnimatedSection className="mb-20 md:mb-28">
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
            What we do
          </p>
          <h2 className="font-display text-5xl md:text-7xl font-light leading-none">
            Three ways
            <br />
            <span className="italic">to own time.</span>
          </h2>
        </AnimatedSection>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="bg-black p-8 md:p-10 group relative overflow-hidden"
            >
              {/* Hover bg image */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-cover bg-center"
                style={{ backgroundImage: `url('${pillar.image}')` }}
              />

              <div className="relative z-10">
                <span className="text-[10px] tracking-[0.35em] uppercase text-zinc-700 font-mono block mb-8">
                  {pillar.number}
                </span>

                <h3 className="font-display text-4xl md:text-5xl font-light mb-2 text-white">
                  {pillar.title}
                </h3>
                <p className="font-display text-lg italic text-zinc-500 mb-6">
                  {pillar.subtitle}
                </p>

                <div className="w-8 h-px bg-white/20 mb-6 group-hover:w-16 group-hover:bg-white/60 transition-all duration-500" />

                <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                  {pillar.description}
                </p>

                <Link
                  href={pillar.href}
                  className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 hover:text-white transition-colors flex items-center gap-3"
                >
                  View Collection
                  <span className="w-4 h-px bg-current inline-block" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
