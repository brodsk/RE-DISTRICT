"use client";
import Link from "next/link";
import { useLang } from "@/lib/lang";

export default function Footer() {
  const { t } = useLang();

  const navLinks = [
    { href: "/shop", en: "Shop", ru: "Каталог" },
    { href: "/shop?category=custom", en: "Custom", ru: "Кастом" },
    { href: "/shop?category=restored", en: "Restored", ru: "Реставрация" },
    { href: "/shop?category=curated", en: "Curated", ru: "Подбор" },
  ];

  const infoLinks = [
    { href: "/about", en: "About", ru: "О нас" },
    { href: "/contact", en: "Contact", ru: "Контакт" },
    { href: "/contact", en: "Custom Orders", ru: "Кастом-заказы" },
  ];

  return (
    <footer className="bg-black border-t border-white/5 py-20 px-6 md:px-12">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-display text-3xl font-light tracking-[0.2em] uppercase mb-4">
              RE:DISTRICT
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-2">
              {t("Time is the same for everyone.", "Время одинаково для каждого.")}
              <br />
              {t("Watches are not.", "Часы — нет.")}
            </p>
            <p className="text-zinc-600 text-xs tracking-[0.2em] uppercase mt-6">
              {t("Rebuild your time.", "Переосмысли своё время.")}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-zinc-600 mb-6">
              {t("Navigate", "Навигация")}
            </p>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href + link.en}>
                  <Link href={link.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {t(link.en, link.ru)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-zinc-600 mb-6">
              {t("Information", "Информация")}
            </p>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.href + link.en}>
                  <Link href={link.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
                    {t(link.en, link.ru)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-zinc-700 tracking-wider">
            © {new Date().getFullYear()} RE:DISTRICT. {t("All rights reserved.", "Все права защищены.")}
          </p>
          <p className="text-xs text-zinc-700 tracking-wider font-mono">
            {t("Independent Watch Brand", "Независимый часовой бренд")} — Est. 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
