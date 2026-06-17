"use client";
import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type AL = "en" | "ru";
export const L = (lang: AL, en: string, ru: string) => lang === "ru" ? ru : en;
const LANG_KEY  = "rd_admin_lang";
const AUTH_KEY  = "rd_admin_auth";
const PASSWORD  = "redistrict2026";

export function useAdminLang(): [AL, (l: AL) => void] {
  const [lang, _set] = useState<AL>("en");
  useEffect(() => {
    const s = localStorage.getItem(LANG_KEY) as AL | null;
    if (s === "en" || s === "ru") _set(s);
  }, []);
  const set = (l: AL) => { _set(l); localStorage.setItem(LANG_KEY, l); };
  return [lang, set];
}

function LangToggle({ lang, setLang }: { lang: AL; setLang: (l: AL) => void }) {
  return (
    <div className="flex border border-white/10">
      {(["en","ru"] as const).map(l => (
        <button key={l} onClick={() => setLang(l)}
          className={`text-[8px] tracking-wider uppercase font-mono px-3 py-1.5 transition-all
            ${lang === l ? "bg-white text-black" : "text-zinc-600 hover:text-white"}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw,    setPw]    = useState("");
  const [error, setError] = useState(false);
  const [lang,  setLang]  = useState<AL>("en");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === PASSWORD) { localStorage.setItem(AUTH_KEY, "1"); onAuth(); }
    else { setError(true); setTimeout(() => setError(false), 1200); }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <div className="flex justify-center mb-8"><LangToggle lang={lang} setLang={setLang} /></div>
        <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-8 text-center">
          RE:DISTRICT / ADMIN
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} autoFocus
            placeholder={L(lang,"Password","Пароль")}
            className={`w-full bg-transparent border px-4 py-3 text-sm font-mono text-white
                        placeholder:text-zinc-800 outline-none transition-colors
                        ${error ? "border-red-900" : "border-white/10 focus:border-white/40"}`} />
          <button type="submit"
            className="w-full bg-white text-black text-[10px] tracking-[0.3em] uppercase font-mono py-3.5 hover:bg-zinc-200 transition-colors">
            {L(lang,"Enter","Войти")}
          </button>
        </form>
        {error && <p className="text-[9px] font-mono text-red-700 text-center mt-3 tracking-widest">{L(lang,"INCORRECT","НЕВЕРНЫЙ ПАРОЛЬ")}</p>}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready,  setReady]  = useState(false);
  const [lang,   setLang]   = useAdminLang();
  const pathname = usePathname();

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === "1");
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen bg-black" />;
  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const nav = [
    { href: "/admin",           en: "Dashboard",    ru: "Дашборд"      },
    { href: "/admin/products",  en: "Products",     ru: "Товары"       },
    { href: "/admin/builder",   en: "Page Builder", ru: "Редактор"     },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-5 overflow-x-auto">
            <Link href="/" className="text-[8px] tracking-[0.3em] uppercase text-zinc-700 hover:text-white transition-colors shrink-0">
              ← {L(lang,"Site","Сайт")}
            </Link>
            <span className="w-px h-4 bg-zinc-800 shrink-0" />
            {nav.map(item => (
              <Link key={item.href} href={item.href}
                className={`text-[9px] tracking-[0.2em] uppercase shrink-0 px-1 transition-colors
                  ${pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}>
                {L(lang, item.en, item.ru)}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <LangToggle lang={lang} setLang={setLang} />
            <button onClick={() => { localStorage.removeItem(AUTH_KEY); location.reload(); }}
              className="text-[8px] tracking-[0.2em] uppercase text-zinc-700 hover:text-white transition-colors">
              {L(lang,"Logout","Выйти")}
            </button>
          </div>
        </div>
      </header>
      <main className="pt-16 max-w-screen-xl mx-auto px-6 md:px-12 pb-24">
        {children}
      </main>
    </div>
  );
}
