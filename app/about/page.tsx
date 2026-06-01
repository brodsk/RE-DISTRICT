import { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "RE:DISTRICT is an independent watch brand built around individuality, craftsmanship, and watch culture.",
};

const values = [
  {
    title: "Individuality",
    description:
      "Every watch we offer is different. Different history, different wear, different character. There is no standard.",
  },
  {
    title: "Craftsmanship",
    description:
      "We work with certified watchmakers and independent craftspeople. Quality is non-negotiable.",
  },
  {
    title: "Restoration",
    description:
      "We believe in preserving what already exists rather than replacing it. A worn bezel has a story. We respect that.",
  },
  {
    title: "Culture",
    description:
      "Watches are cultural objects. We approach them as such — with the respect they deserve and the curiosity they inspire.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1600&q=80')",
            filter: "brightness(0.3) grayscale(0.3)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="relative z-10 px-6 md:px-12 pb-16 md:pb-24 w-full max-w-screen-xl mx-auto">
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
            About RE:DISTRICT
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-none text-white">
            Independent.
            <br />
            <span className="italic">Intentional.</span>
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 md:py-36 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-6">
              Who We Are
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light leading-snug mb-0">
              We are not a marketplace.
              <br />
              <span className="italic text-zinc-400">
                We are a perspective.
              </span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="space-y-6 pt-12 lg:pt-16">
            <p className="text-sm text-zinc-400 leading-relaxed">
              RE:DISTRICT began with a simple observation: the most interesting
              watches are never the newest ones. They are the ones with decades
              of wear, unique dial patina, and custom modifications that make
              them entirely personal.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We source watches from estate collections, private owners, and
              trusted dealers across Europe and Japan. Every piece passes
              through our hands before it reaches yours. We document it, assess
              it, restore it where needed, and tell its story honestly.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Some of what we offer has been restored. Some has been customized.
              Some is simply rare and beautiful and needed to be found by the
              right person. All of it has been chosen with care.
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed font-display text-base italic">
              "Время одинаково для каждого. Часы — нет."
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-36 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <AnimatedSection className="mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
              What We Stand For
            </p>
            <h2 className="font-display text-5xl md:text-6xl font-light leading-none">
              Values.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
            {values.map((v, i) => (
              <AnimatedSection
                key={v.title}
                delay={i * 0.1}
                className="bg-black p-8 md:p-12"
              >
                <h3 className="font-display text-3xl font-light text-white mb-4">
                  {v.title}
                </h3>
                <div className="w-8 h-px bg-white/20 mb-4" />
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {v.description}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 md:py-36 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto max-w-3xl">
          <AnimatedSection>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-6">
              The Future
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light leading-snug mb-8">
              Today: curated, restored, custom.
              <br />
              <span className="italic text-zinc-400">
                Tomorrow: original.
              </span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              RE:DISTRICT is building toward something larger. Our long-term
              vision is to develop original watch designs — pieces conceived
              entirely in-house, manufactured in limited quantities, and built
              to the same standard we hold every watch we handle.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              That takes time. In the meantime, we focus on what we do best:
              finding extraordinary watches, giving them the attention they
              deserve, and placing them with people who will appreciate them.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="font-display text-5xl md:text-7xl font-light mb-8">
              Ready to find
              <br />
              <span className="italic">your watch?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="text-xs tracking-[0.3em] uppercase bg-white text-black hover:bg-zinc-200 px-10 py-4 transition-colors"
              >
                Browse the Shop
              </Link>
              <Link
                href="/contact"
                className="text-xs tracking-[0.3em] uppercase border border-white/20 hover:border-white/60 text-white px-10 py-4 transition-all"
              >
                Custom Order
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
