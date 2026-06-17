"use client";
import Link from "next/link";
import { useLang } from "@/lib/lang";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-black border-t border-white/5 py-16 px-6 md:px-12">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2">
            <div className="font-mono text-white text-sm tracking-tight mb-3" style={{ letterSpacing: "-0.01em" }}>
              RE:DISTRICT
            </div>
            <p className="text-[10px] font-mono text-zinc-600 leading-relaxed max-w-xs">
              {t("Time is the same for everyone. Watches are not.", "Время одинаково для каждого. Часы — нет.")}
            </p>
          </div>
          <div>
            <p className="text-[8px] tracking-[0.3em] uppercase text-zinc-700 mb-4">{t("Shop","Каталог")}</p>
            <div className="space-y-2">
              {[
                { href:"/shop?category=custom",   en:"Custom",   ru:"Кастом" },
                { href:"/shop?category=restored", en:"Restored", ru:"Реставрация" },
                { href:"/shop?category=curated",  en:"Curated",  ru:"Подбор" },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="block text-[10px] font-mono text-zinc-500 hover:text-white transition-colors">
                  {t(l.en, l.ru)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[8px] tracking-[0.3em] uppercase text-zinc-700 mb-4">{t("Info","Инфо")}</p>
            <div className="space-y-2">
              {[
                { href:"/faq",     en:"FAQ",     ru:"FAQ" },
                { href:"/contact", en:"Contact", ru:"Контакт" },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="block text-[10px] font-mono text-zinc-500 hover:text-white transition-colors">
                  {t(l.en, l.ru)}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between gap-3">
          <p className="text-[8px] font-mono text-zinc-800">
            © {new Date().getFullYear()} RE:DISTRICT. {t("All rights reserved.","Все права защищены.")}
          </p>
          <p className="text-[8px] font-mono text-zinc-800">Est. 2026 — Trenčín, Slovakia</p>
        </div>
      </div>
    </footer>
  );
}
