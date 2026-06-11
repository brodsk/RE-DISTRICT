"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useLang } from "@/lib/lang";

const inquiryTypes = {
  en: ["Purchase inquiry", "Custom build consultation", "Restoration request", "General question"],
  ru: ["Запрос о покупке", "Консультация по кастому", "Заявка на реставрацию", "Общий вопрос"],
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", type: "", message: "" });
  const { t } = useLang();

  const types = t(inquiryTypes.en, inquiryTypes.ru) as string[];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            {t("Get in Touch", "Напишите нам")}
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-none">
            {t("Let's talk", "Поговорим")}
            <br />
            <span className="italic">{t("watches.", "о часах.")}</span>
          </h1>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
          {/* Left: Info */}
          <AnimatedSection direction="left" className="space-y-12">
            <div>
              <p className="text-[10px] tracking-[0.35em] uppercase text-zinc-600 font-mono mb-4">
                {t("How We Work", "Как мы работаем")}
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                {t(
                  "Every inquiry is handled personally. Whether you're looking for a specific reference, want to discuss a custom build, or have a watch in need of restoration — write to us and we'll respond within 24 hours.",
                  "Каждый запрос рассматривается лично. Ищете конкретную модель, хотите обсудить кастом или есть часы для реставрации — напишите нам, ответим в течение 24 часов."
                )}
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {t(
                  "For custom builds, we typically begin with a consultation call to understand your vision before providing a quote and timeline.",
                  "Для кастом-заказов мы начинаем с консультации, чтобы понять вашу идею, прежде чем предоставить смету и сроки."
                )}
              </p>
            </div>

            <div className="space-y-6">
              {[
                { label: t("Email", "Почта"), value: "hello@redistrict.co", href: "mailto:hello@redistrict.co" },
                { label: t("Response time", "Время ответа"), value: t("Within 24 hours", "В течение 24 часов"), href: null },
                { label: t("Custom consultations", "Консультации"), value: t("By appointment", "По записи"), href: null },
              ].map((item) => (
                <div key={item.label} className="border-b border-white/8 pb-5">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-white hover:text-zinc-300 transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-sm text-white">{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-zinc-950 p-6">
              <p className="font-display text-xl italic text-zinc-400 leading-relaxed">
                {t(
                  '"Every great collection starts with a single question asked to the right person."',
                  '«Каждая великая коллекция начинается с одного вопроса, заданного нужному человеку.»'
                )}
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
                      {t("Name", "Имя")}
                    </label>
                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-white/10 hover:border-white/25 focus:border-white/50 outline-none px-4 py-3 text-sm text-white placeholder:text-zinc-800 transition-colors"
                      placeholder={t("Your name", "Ваше имя")}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono mb-2">
                      {t("Email", "Почта")}
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
                    {t("Inquiry Type", "Тип запроса")}
                  </label>
                  <select
                    name="type"
                    required
                    value={form.type}
                    onChange={handleChange}
                    className="w-full bg-black border border-white/10 hover:border-white/25 focus:border-white/50 outline-none px-4 py-3 text-sm text-white transition-colors"
                  >
                    <option value="" disabled>{t("Select type", "Выберите тип")}</option>
                    {types.map((tp) => (
                      <option key={tp} value={tp}>{tp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-mono mb-2">
                    {t("Message", "Сообщение")}
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/10 hover:border-white/25 focus:border-white/50 outline-none px-4 py-3 text-sm text-white placeholder:text-zinc-800 transition-colors resize-none"
                    placeholder={t("Tell us what you're looking for...", "Расскажите, что вы ищете...")}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-xs tracking-[0.3em] uppercase bg-white text-black hover:bg-zinc-200 py-5 transition-colors font-medium"
                >
                  {t("Send Message", "Отправить")}
                </button>

                <p className="text-[10px] text-zinc-700 font-mono text-center">
                  {t(
                    "We respond to every message personally, within 24 hours.",
                    "Мы отвечаем на каждое сообщение лично, в течение 24 часов."
                  )}
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
                  {t("Message received.", "Сообщение получено.")}
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {t(
                    "Thank you for reaching out. We'll be in touch within 24 hours.",
                    "Спасибо за обращение. Свяжемся в течение 24 часов."
                  )}
                </p>
                <p className="text-xs text-zinc-700 font-mono tracking-wider">RE:DISTRICT</p>
              </motion.div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
