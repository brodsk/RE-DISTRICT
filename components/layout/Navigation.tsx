"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/lang";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
  { href: "/shop",    labelEn: "Shop",    labelRu: "Каталог" },
  { href: "/about",   labelEn: "About",   labelRu: "О нас"   },
  { href: "/contact", labelEn: "Contact", labelRu: "Контакт" },
];

// ─── Logo display modes (mirrors HeroSection, but nav-compact) ────────────────
type NavMode = "brand" | "clock" | "glitch";

const BRAND_MS  = 10_000;
const CLOCK_MS  = 20_000;
const GLITCH_MS =  5_000;
const EASTER_MS =  5 * 60_000;

// Uses the same second-parity rule so logo colon is in sync with hero colon.
function useNavClock() {
  const [mode,  setMode]  = useState<NavMode>("brand");
  const [colon, setColon] = useState(true);
  const [h, setH]         = useState("--");
  const [m, setM]         = useState("--");

  const modeRef   = useRef<NavMode>("brand");
  const modeStart = useRef(Date.now());
  const easterRef = useRef(Date.now());

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const d   = new Date();

      setColon(d.getSeconds() % 2 === 0);
      setH(String(d.getHours()).padStart(2, "0"));
      setM(String(d.getMinutes()).padStart(2, "0"));

      if (modeRef.current !== "glitch" && now - easterRef.current >= EASTER_MS) {
        easterRef.current = now;
        modeRef.current   = "glitch";
        modeStart.current = now;
        setMode("glitch");
        return;
      }

      const elapsed = now - modeStart.current;
      if (modeRef.current === "glitch" && elapsed >= GLITCH_MS) {
        modeRef.current = "brand"; modeStart.current = now; setMode("brand");
      } else if (modeRef.current === "brand" && elapsed >= BRAND_MS) {
        modeRef.current = "clock"; modeStart.current = now; setMode("clock");
      } else if (modeRef.current === "clock" && elapsed >= CLOCK_MS) {
        modeRef.current = "brand"; modeStart.current = now; setMode("brand");
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { mode, colon, h, m };
}

// ─── Logo: 3-column grid — left | colon | right ───────────────────────────────
// The colon column is fixed-width (1 character) and sits at the flex centre.
// Left side is right-aligned, right side is left-aligned.
// No layout shift when text changes length.

interface LogoContentProps {
  left:  string;
  right: string;
  colon: boolean;
  size?: string;
}

function LogoContent({ left, right, colon, size = "inherit" }: LogoContentProps) {
  return (
    // overflow-hidden keeps the logo from expanding nav height
    <span
      className="inline-grid items-baseline font-mono font-light text-white tracking-tight select-none"
      style={{
        gridTemplateColumns: "1fr auto 1fr",
        fontSize: size,
        letterSpacing: "-0.01em",
        lineHeight: 1,
      }}
    >
      <span className="text-right whitespace-nowrap">{left}</span>
      <span
        style={{
          opacity: colon ? 1 : 0.1,
          transition: "opacity 60ms steps(1)",
          padding: "0 0.03em",
        }}
      >
        :
      </span>
      <span className="text-left whitespace-nowrap">{right}</span>
    </span>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export default function Navigation() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const { lang, setLang, t }      = useLang();
  const router   = useRouter();
  const pathname = usePathname();
  const { mode, colon, h, m }     = useNavClock();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
    else router.push("/");
  };

  // Logo content based on current mode
  const logoNode = (
    <AnimatePresence mode="wait">
      <motion.span
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "linear" }}
        className="block"
      >
        {mode === "brand" && (
          <LogoContent left="RE" right="DISTRICT" colon={colon} />
        )}
        {mode === "clock" && (
          <LogoContent left={h} right={m} colon={colon} />
        )}
        {mode === "glitch" && (
          <LogoContent
            left="rE"
            right="d15tr1Ct"
            colon={colon}
          />
        )}
      </motion.span>
    </AnimatePresence>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-3 bg-black/95 backdrop-blur-md border-b border-white/5"
            : "py-5 md:py-6"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 flex items-center justify-between gap-6">

          {/* ── LOGO (left) ── */}
          <a
            href="/"
            onClick={handleHome}
            className="shrink-0 text-[13px] md:text-[15px] hover:opacity-60 transition-opacity duration-200"
            style={{ minWidth: "8rem" }}  // prevents nav jump when switching modes
            aria-label="RE:DISTRICT home"
          >
            {logoNode}
          </a>

          {/* ── Desktop nav (centre) ── */}
          <nav className="hidden md:flex items-center gap-10 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[10px] tracking-[0.3em] uppercase font-mono text-zinc-500 hover:text-white transition-colors duration-200"
              >
                {t(link.labelEn, link.labelRu)}
              </Link>
            ))}
          </nav>

          {/* ── Lang + (desktop) ── */}
          <div className="hidden md:flex items-center shrink-0">
            <div className="flex items-center border border-white/10">
              <button
                onClick={() => setLang("en")}
                className={`text-[9px] tracking-[0.2em] uppercase font-mono px-3 py-2 transition-all duration-150 ${
                  lang === "en" ? "bg-white text-black" : "text-zinc-600 hover:text-white"
                }`}
              >EN</button>
              <button
                onClick={() => setLang("ru")}
                className={`text-[9px] tracking-[0.2em] uppercase font-mono px-3 py-2 transition-all duration-150 ${
                  lang === "ru" ? "bg-white text-black" : "text-zinc-600 hover:text-white"
                }`}
              >RU</button>
            </div>
          </div>

          {/* ── Mobile: lang + burger ── */}
          <div className="md:hidden flex items-center gap-3 shrink-0">
            <div className="flex items-center border border-white/10">
              <button
                onClick={() => setLang("en")}
                className={`text-[8px] tracking-wider uppercase font-mono px-2.5 py-1.5 transition-all ${
                  lang === "en" ? "bg-white text-black" : "text-zinc-600"
                }`}
              >EN</button>
              <button
                onClick={() => setLang("ru")}
                className={`text-[8px] tracking-wider uppercase font-mono px-2.5 py-1.5 transition-all ${
                  lang === "ru" ? "bg-white text-black" : "text-zinc-600"
                }`}
              >RU</button>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col justify-center gap-[5px] w-6 h-6"
              aria-label="Menu"
            >
              <span className={`block w-full h-px bg-white transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block w-full h-px bg-white transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-full h-px bg-white transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <span className="text-[13px] font-mono font-light text-white">
                <LogoContent left="RE" right="DISTRICT" colon={colon} />
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-[9px] font-mono tracking-widest uppercase text-zinc-500 hover:text-white transition-colors"
              >
                {t("CLOSE", "ЗАКРЫТЬ")}
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-5 border-b border-white/5 group"
                  >
                    <span
                      className="text-4xl font-light text-white group-hover:text-zinc-400 transition-colors"
                      style={{ fontFamily: "var(--font-display, serif)" }}
                    >
                      {t(link.labelEn, link.labelRu)}
                    </span>
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
