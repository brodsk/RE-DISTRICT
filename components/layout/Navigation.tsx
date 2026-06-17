"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/lang";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import CartButton from "@/components/cart/CartButton";

const links = [
  { href: "/shop",    en: "Shop",    ru: "Каталог" },
  { href: "/faq",     en: "FAQ",     ru: "FAQ"     },
  { href: "/contact", en: "Contact", ru: "Контакт" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const { lang, setLang, t }    = useLang();
  const router   = useRouter();
  const pathname = usePathname();
  const isHome   = pathname === "/";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    isHome ? window.scrollTo({ top: 0, behavior: "smooth" }) : router.push("/");
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled ? "py-3 bg-black/95 backdrop-blur-md border-b border-white/5" : "py-5 md:py-6"}`}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid items-center gap-4"
             style={{ gridTemplateColumns: "1fr auto 1fr" }}>

          {/* Left: logo (hidden on home) */}
          <div className="flex items-center">
            <a href="/" onClick={goHome} aria-label="Home"
              className={`font-mono font-light text-white text-[13px] tracking-tight
                         hover:opacity-50 transition-opacity select-none
                         ${isHome ? "invisible pointer-events-none" : ""}`}
              style={{ letterSpacing: "-0.01em" }}>
              RE:DISTRICT
            </a>
          </div>

          {/* Centre: nav links */}
          <nav className="hidden md:flex items-center gap-10">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className="text-[10px] tracking-[0.3em] uppercase font-mono text-zinc-500 hover:text-white transition-colors">
                {t(l.en, l.ru)}
              </Link>
            ))}
          </nav>

          {/* Right: lang + cart + burger */}
          <div className="flex items-center justify-end gap-4">
            <div className="hidden md:flex items-center border border-white/10">
              {(["en","ru"] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`text-[9px] tracking-[0.2em] uppercase font-mono px-3 py-2 transition-all
                    ${lang === l ? "bg-white text-black" : "text-zinc-600 hover:text-white"}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <CartButton />
            <div className="md:hidden flex items-center gap-3">
              <div className="flex border border-white/10">
                {(["en","ru"] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`text-[8px] tracking-wider uppercase font-mono px-2.5 py-1.5 transition-all
                      ${lang === l ? "bg-white text-black" : "text-zinc-600"}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <button onClick={() => setOpen(!open)} className="flex flex-col justify-center gap-[5px] w-6 h-6">
                <span className={`block w-full h-px bg-white transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`block w-full h-px bg-white transition-all ${open ? "opacity-0" : ""}`} />
                <span className={`block w-full h-px bg-white transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <span className="font-mono text-white text-[13px]" style={{ letterSpacing: "-0.01em" }}>
                RE:DISTRICT
              </span>
              <button onClick={() => setOpen(false)}
                className="text-[9px] font-mono tracking-widest uppercase text-zinc-500 hover:text-white transition-colors">
                {t("CLOSE", "ЗАКРЫТЬ")}
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center px-6 gap-1">
              {links.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <Link href={l.href} onClick={() => setOpen(false)}
                    className="block py-5 border-b border-white/5 text-3xl font-light text-white hover:text-zinc-400 transition-colors"
                    style={{ fontFamily: "var(--font-display, serif)" }}>
                    {t(l.en, l.ru)}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="px-6 py-8 border-t border-white/5">
              <p className="text-[8px] font-mono text-zinc-800 tracking-[0.35em] uppercase">
                Casio · Seiko · Orient · Citizen
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
