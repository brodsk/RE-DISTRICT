"use client";
import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import WatchCard from "@/components/ui/WatchCard";
import { watches } from "@/lib/data";

export default function FeaturedSection() {
  const featured = watches.filter((w) => w.featured).slice(0, 4);

  return (
    <section className="py-28 md:py-40 px-6 md:px-12 bg-zinc-950">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-16 md:mb-20">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
              Current Selection
            </p>
            <h2 className="font-display text-5xl md:text-7xl font-light leading-none">
              Featured
              <br />
              <span className="italic">watches.</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="hidden md:block">
            <Link
              href="/shop"
              className="text-xs tracking-[0.25em] uppercase text-zinc-500 hover:text-white transition-colors flex items-center gap-3"
            >
              View All
              <span className="w-6 h-px bg-current inline-block" />
            </Link>
          </AnimatedSection>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {featured.map((watch, i) => (
            <WatchCard key={watch.id} watch={watch} index={i} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-12 text-center md:hidden">
          <Link
            href="/shop"
            className="text-xs tracking-[0.25em] uppercase text-zinc-500 hover:text-white transition-colors"
          >
            View All Watches →
          </Link>
        </div>
      </div>
    </section>
  );
}
