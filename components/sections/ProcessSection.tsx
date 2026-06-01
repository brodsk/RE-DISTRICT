"use client";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { process } from "@/lib/data";

export default function ProcessSection() {
  return (
    <section className="py-28 md:py-40 px-6 md:px-12 bg-black overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          {/* Left: image */}
          <AnimatedSection direction="left" className="relative order-2 lg:order-1">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&q=85"
                alt="Workshop"
                className="w-full h-full object-cover filter grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            {/* Floating label */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute -right-4 md:-right-8 top-1/3 bg-black border border-white/10 p-4 max-w-[180px]"
            >
              <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 font-mono mb-1">
                Standard
              </p>
              <p className="font-display text-lg text-white font-light leading-tight">
                Every detail matters.
              </p>
            </motion.div>
          </AnimatedSection>

          {/* Right: process */}
          <div className="order-1 lg:order-2">
            <AnimatedSection>
              <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
                Our Process
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-light leading-none mb-16">
                Workshop.
                <br />
                <span className="italic">Not a warehouse.</span>
              </h2>
            </AnimatedSection>

            <div className="space-y-0">
              {process.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, delay: i * 0.1 + 0.2 }}
                  className="border-t border-white/8 py-8 group"
                >
                  <div className="flex gap-8 items-start">
                    <span className="text-[10px] tracking-[0.3em] font-mono text-zinc-700 pt-1 shrink-0 w-8">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-light text-white mb-2 group-hover:opacity-70 transition-opacity">
                        {step.title}
                      </h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="border-t border-white/8" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
