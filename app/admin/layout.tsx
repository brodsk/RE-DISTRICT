"use client";
import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ADMIN_PW = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "redistrict2026")
  : "redistrict2026";

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw]       = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === "redistrict2026" || pw === ADMIN_PW) {
      sessionStorage.setItem("rd_admin", "1");
      onAuth();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-8 text-center">
          RE:DISTRICT / ADMIN
        </p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Password"
            autoFocus
            className={`w-full bg-transparent border px-4 py-3 text-sm font-mono text-white
                        placeholder:text-zinc-700 outline-none transition-colors
                        ${error ? "border-red-900" : "border-white/10 focus:border-white/40"}`}
          />
          <button type="submit"
            className="w-full bg-white text-black text-[10px] tracking-[0.3em] uppercase font-mono py-3.5 hover:bg-zinc-200 transition-colors">
            Enter
          </button>
        </form>
        {error && <p className="text-[9px] font-mono text-red-700 text-center mt-3 tracking-widest">INCORRECT</p>}
      </div>
    </div>
  );
}

const navItems = [
  { href: "/admin",           label: "Dashboard" },
  { href: "/admin/products",  label: "Products"  },
  { href: "/admin/builder",   label: "Page Builder" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready,  setReady]  = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setAuthed(sessionStorage.getItem("rd_admin") === "1");
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen bg-black" />;
  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[9px] tracking-[0.3em] uppercase text-zinc-600 hover:text-white transition-colors">← Site</Link>
            <span className="w-px h-4 bg-zinc-800" />
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`text-[9px] tracking-[0.25em] uppercase transition-colors
                  ${pathname === item.href ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}>
                {item.label}
              </Link>
            ))}
          </div>
          <button
            onClick={() => { sessionStorage.removeItem("rd_admin"); location.reload(); }}
            className="text-[8px] tracking-[0.25em] uppercase text-zinc-700 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="pt-16 max-w-screen-xl mx-auto px-6 md:px-12 pb-24">
        {children}
      </main>
    </div>
  );
}
