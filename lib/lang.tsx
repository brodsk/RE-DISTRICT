"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "ru";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: <T>(en: T, ru: T) => T;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (en) => en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = <T,>(en: T, ru: T): T => (lang === "ru" ? ru : en);
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
