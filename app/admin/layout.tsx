"use client";
import { useState, useEffect, ReactNode } from "react";
import { isAuthenticated, checkPassword, setAuthenticated, logout } from "@/lib/admin-store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw,    setPw]    = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkPassword(pw)) { setAuthenticated(); onAuth(); }
    else { setError(true); setTimeout(() => setError(false), 1500); }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-8 text-center">
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
          <button
            type="submit"
            className="w-full bg-white text-black text-[10px] tracking-[0.3em] uppercase
                       font-mono py-3.5 hover:bg-zinc-200 transition-colors"
          >
            Enter
          </button>
        </form>
        {error && (
          <p className="text-[9px] font-mono text-red-700 text-center mt-4 tracking-widest">
            INCORRECT
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready,  setReady]  = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    setAuthed(isAuthenticated());
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen bg-black" />;
  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const navItems = [
    { href: "/admin",           label: "Dashboard" },
    { href: "/admin/listings",  label: "Listings"  },
    { href: "/admin/listings/new", label: "+ New"  },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Admin header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 hover:text-white transition-colors"
            >
              ← Site
            </Link>
            <span className="w-px h-4 bg-zinc-800" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-500">
              RE:DISTRICT / ADMIN
            </span>
          </div>
          <div className="flex items-center gap-6">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[9px] tracking-[0.25em] uppercase transition-colors
                  ${pathname === item.href ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}
              >
                {item.label}
              </Link>
            ))}
            <span className="w-px h-4 bg-zinc-800" />
            <button
              onClick={() => { logout(); setAuthed(false); }}
              className="text-[9px] tracking-[0.25em] uppercase text-zinc-700 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="pt-16 px-6 md:px-12 pb-24 max-w-screen-lg mx-auto">
        {children}
      </main>
    </div>
  );
}
