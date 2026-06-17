"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "ru";
const KEY = "rd_lang";

interface Ctx {
  lang:    Lang;
  setLang: (l: Lang) => void;
  t:       <T>(en: T, ru: T) => T;
}

const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (en) => en });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, _setLang] = useState<Lang>("en");

  // Hydrate from localStorage once mounted
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "ru") _setLang(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    _setLang(l);
    try { localStorage.setItem(KEY, l); } catch {}
  };

  const t = <T,>(en: T, ru: T): T => (lang === "ru" ? ru : en);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }
