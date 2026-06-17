"use client";
import { useLang } from "@/lib/lang";
import AnimatedSection from "@/components/ui/AnimatedSection";

const channels = [
  { Icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/>
        <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none"/>
      </svg>
    ),
    label: "Instagram", en: "Primary — DM us", ru: "Основной — пишите в DM",
    value: "@re.district", href: "https://www.instagram.com/re.district", primary: true,
  },
  { Icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="9.5"/>
        <path d="M6.5 12.3l4.2 1.6 1.4 4 2-3.3 4.4-7.8-12 5.5z" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Telegram", en: "Updates & drops", ru: "Новости и дропы",
    value: "@RE_DISTRICT", href: "https://t.me/RE_DISTRICT", primary: false,
  },
  { Icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2.5" y="4.5" width="19" height="15" rx="2"/>
        <path d="M3.5 6l8.5 6.5L20.5 6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Email", en: "For formal inquiries", ru: "Для официальных запросов",
    value: "contact@redistrict.studio", href: "mailto:contact@redistrict.studio", primary: false,
  },
];

export default function ContactPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div className="relative z-10 max-w-screen-md mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-24">
        <AnimatedSection className="mb-16">
          <p className="text-[9px] tracking-[0.45em] uppercase font-mono text-zinc-600 mb-4">{t("Contact","Контакты")}</p>
          <h1 className="font-light text-white leading-none mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 8vw, 5rem)" }}>
            Get in<span style={{ opacity: 0.2 }}>:</span>touch
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 leading-relaxed max-w-md">
            {t("Independent brand restoring and modifying Japanese digital watches — Casio, Seiko, Orient, Citizen.",
               "Независимый бренд, восстанавливающий и модифицирующий японские цифровые часы — Casio, Seiko, Orient, Citizen.")}
          </p>
        </AnimatedSection>

        <div className="border-t border-white/5">
          {channels.map((c, i) => (
            <AnimatedSection key={c.label} delay={i * 0.07}>
              <a href={c.href} target="_blank" rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 py-7 border-b border-white/5 hover:bg-white/[0.02] px-2 -mx-2 transition-colors">
                <div className="flex items-center gap-5">
                  <span className="flex items-center justify-center w-10 h-10 border border-white/10 text-zinc-500 group-hover:border-white/30 group-hover:text-white transition-all">
                    <c.Icon />
                  </span>
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="text-sm font-mono text-white">{c.label}</span>
                      {c.primary && (
                        <span className="text-[7px] tracking-[0.3em] uppercase font-mono text-zinc-600 border border-white/10 px-1.5 py-0.5">
                          {t("Primary","Основной")}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] font-mono text-zinc-600">{t(c.en, c.ru)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-300 transition-colors hidden sm:inline">{c.value}</span>
                  <span className="text-zinc-700 group-hover:text-white transition-colors font-mono">→</span>
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="mt-12">
          <div className="flex items-start gap-4 border border-white/5 p-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/25 mt-1 shrink-0 animate-pulse" />
            <div>
              <p className="text-[8px] font-mono tracking-[0.35em] uppercase text-zinc-600 mb-2">{t("Response Time","Время ответа")}</p>
              <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                {t("We respond within 24–72 hours. Instagram DM is fastest.",
                   "Отвечаем в течение 24–72 часов. Instagram DM — быстрее всего.")}
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
