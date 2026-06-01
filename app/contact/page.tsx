"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";

const inquiryTypes = [
  "Purchase inquiry",
  "Custom build consultation",
  "Restoration request",
  "General question",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        {/* Header */}
        <AnimatedSection className="mb-16 md:mb-20">
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-600 font-mono mb-4">
            Get in Touch
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-none">
            Let's talk
            <br />
            <span className="italic">watches.</span>
          </h1>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
          {/* Left: Info */}
          <AnimatedSection direction="left" className="space-y-12">
            <div>
              <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-600 font-mono mb-4">
                How We Work
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Every inquiry is handled personally. Whether you're looking for
                a specific reference, want to discuss a custom build, or have a
                watch in need of restoration — write to us and we'll respond
                within 24 hours.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                For custom builds, we typically begin with a consultation call
                to understand your vision before providing a quote and
                timeline.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  label: "Email",
                  value: "hello@redistrict.co",
                  href: "mailto:hello@redistrict.co",
                },
                {
                  label: "Response time",
                  value: "Within 24 hours",
                  href: null,
                },
                {
                  label: "Custom consultations",
                  value: "By appointment",
                  href: null,
                },
              ].map((item) => (
                <div key={item.label} className="border-b border-white/8 pb-5">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono mb-1">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-white hover:text-zinc-300 transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-white">{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 p-6">
              <p className="font-display text-xl italic text-zinc-400 leading-relaxed">
                "Every great collection starts with a single question asked to
                the right person."
              </p>
            </div>
          </AnimatedSection>

          {/* Right: Form */}
          <AnimatedSection delay={0.2}>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono mb-2">
                      Name
                    </label>
                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-white/10 hover:border-white/25 focus:border-white/50 outline-none px-4 py-3 text-sm text-white placeholder:text-zinc-800 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-white/10 hover:border-white/25 focus:border-white/50 outline-none px-4 py-3 text-sm text-white placeholder:text-zinc-800 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono mb-2">
                    Inquiry Type
                  </label>
                  <select
                    name="type"
                    required
                    value={form.type}
                    onChange={handleChange}
                    className="w-full bg-black border border-white/10 hover:border-white/25 focus:border-white/50 outline-none px-4 py-3 text-sm text-white transition-colors"
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    {inquiryTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/10 hover:border-white/25 focus:border-white/50 outline-none px-4 py-3 text-sm text-white placeholder:text-zinc-800 transition-colors resize-none"
                    placeholder="Tell us what you're looking for..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-xs tracking-[0.3em] uppercase bg-white text-black hover:bg-zinc-200 py-5 transition-colors font-medium"
                >
                  Send Message
                </button>

                <p className="text-[10px] text-zinc-700 font-mono text-center">
                  We respond to every message personally, within 24 hours.
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-start gap-6 py-12"
              >
                <div className="w-1 h-16 bg-white" />
                <h2 className="font-display text-4xl font-light">
                  Message received.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Thank you for reaching out. We'll be in touch within 24
                  hours.
                </p>
                <p className="text-xs text-zinc-700 font-mono tracking-wider">
                  RE:DISTRICT
                </p>
              </motion.div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
