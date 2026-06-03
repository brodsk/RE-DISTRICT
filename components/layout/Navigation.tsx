"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/lang";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
  { href: "/shop", labelEn: "Shop", labelRu: "Каталог" },
  { href: "/about", labelEn: "About", labelRu: "О нас" },
  { href: "/contact", labelEn: "Contact", labelRu: "Контакт" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Logo click: if on home, scroll to top; if elsewhere, navigate home
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "py-4 bg-black/92 backdrop-blur-md border-b border-white/5"
            : "py-6 md:py-8"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center group"
          >
            <span
              className="font-display font-light tracking-[0.2em] uppercase text-white group-hover:opacity-70 transition-opacity"
              style={{ fontSize: scrolled ? "1.25rem" : "1.1rem", transition: "font-size 0.5s ease" }}
            >
              RE:DISTRICT
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-[0.25em] uppercase text-zinc-400 hover:text-white transition-colors duration-300"
              >
                {t(link.labelEn, link.labelRu)}
              </Link>
            ))}
          </nav>

          {/* Right: lang switcher + CTA */}
          <div className="hidden md:flex items-center gap-6">
            {/* Language switcher */}
            <div className="flex items-center border border-white/10 overflow-hidden">
              <button
                onClick={() => setLang("en")}
                className={`text-[10px] tracking-[0.2em] uppercase px-3 py-2 transition-all duration-200 ${
                  lang === "en" ? "bg-white text-black font-medium" : "text-zinc-600 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ru")}
                className={`text-[10px] tracking-[0.2em] uppercase px-3 py-2 transition-all duration-200 ${
                  lang === "ru" ? "bg-white text-black font-medium" : "text-zinc-600 hover:text-white"
                }`}
              >
                RU
              </button>
            </div>
            <Link
              href="/shop"
              className="text-xs tracking-[0.25em] uppercase border border-white/20 hover:border-white/60 px-5 py-2.5 transition-all duration-300 hover:bg-white hover:text-black"
            >
              {t("Explore", "Смотреть")}
            </Link>
          </div>

          {/* Mobile right: lang + burger */}
          <div className="md:hidden flex items-center gap-4">
            <div className="flex items-center border border-white/10 overflow-hidden">
              <button
                onClick={() => setLang("en")}
                className={`text-[9px] tracking-wider uppercase px-2.5 py-1.5 transition-all ${
                  lang === "en" ? "bg-white text-black" : "text-zinc-500"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ru")}
                className={`text-[9px] tracking-wider uppercase px-2.5 py-1.5 transition-all ${
                  lang === "ru" ? "bg-white text-black" : "text-zinc-500"
                }`}
              >
                RU
              </button>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col gap-1.5 p-1"
              aria-label="Menu"
            >
              <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-px bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-10"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.1 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-5xl font-light tracking-wide text-white hover:opacity-50 transition-opacity"
                >
                  {t(link.labelEn, link.labelRu)}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-12 text-xs tracking-[0.3em] uppercase text-zinc-600"
            >
              {t("Rebuild your time.", "Переосмысли своё время.")}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
