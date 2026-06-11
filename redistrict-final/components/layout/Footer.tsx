"use client";
import Link from "next/link";
import { useLang } from "@/lib/lang";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-black border-t border-white/5 px-6 md:px-12 py-12 md:py-16">
      <div className="max-w-screen-xl mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white mb-3">
              RE:DISTRICT
            </p>
            <p className="text-[9px] font-mono text-zinc-700 leading-relaxed mb-4">
              {t(
                "Time is the same for everyone.\nWatches are not.",
                "Время одинаково для каждого.\nЧасы — нет."
              )}
            </p>
            <p className="text-[8px] font-mono text-zinc-800 tracking-[0.3em] uppercase">
              Est. 2026
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[8px] font-mono tracking-[0.35em] uppercase text-zinc-700 mb-4">
              {t("Shop", "Каталог")}
            </p>
            <ul className="space-y-2.5">
              {[
                { href: "/shop", en: "All Watches", ru: "Все часы" },
                { href: "/shop?category=custom", en: "Custom", ru: "Кастом" },
                { href: "/shop?category=restored", en: "Restored", ru: "Реставрация" },
                { href: "/shop?category=curated", en: "Curated", ru: "Подбор" },
              ].map((l) => (
                <li key={l.href + l.en}>
                  <Link href={l.href} className="text-[10px] font-mono text-zinc-600 hover:text-white transition-colors tracking-wider">
                    {t(l.en, l.ru)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-[8px] font-mono tracking-[0.35em] uppercase text-zinc-700 mb-4">
              {t("Info", "Инфо")}
            </p>
            <ul className="space-y-2.5">
              {[
                { href: "/about", en: "About", ru: "О нас" },
                { href: "/contact", en: "Contact", ru: "Контакт" },
                { href: "/contact", en: "Custom Order", ru: "Кастом-заказ" },
              ].map((l) => (
                <li key={l.href + l.en}>
                  <Link href={l.href} className="text-[10px] font-mono text-zinc-600 hover:text-white transition-colors tracking-wider">
                    {t(l.en, l.ru)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <p className="text-[8px] font-mono tracking-[0.35em] uppercase text-zinc-700 mb-4">
              {t("Brands", "Бренды")}
            </p>
            <ul className="space-y-2.5">
              {["Casio", "Seiko", "Orient", "Citizen"].map((b) => (
                <li key={b}>
                  <Link href={`/shop?brand=${b.toLowerCase()}`} className="text-[10px] font-mono text-zinc-600 hover:text-white transition-colors tracking-wider">
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-[8px] font-mono text-zinc-800 tracking-[0.3em] uppercase">
            © {new Date().getFullYear()} RE:DISTRICT
          </p>
          <p className="text-[8px] font-mono text-zinc-800 tracking-[0.3em] uppercase">
            {t("Independent Watch Brand", "Независимый часовой бренд")}
          </p>
        </div>
      </div>
    </footer>
  );
}
