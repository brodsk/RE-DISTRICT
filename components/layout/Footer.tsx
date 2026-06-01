import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-20 px-6 md:px-12">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-display text-3xl font-light tracking-[0.2em] uppercase mb-4">
              RE:DISTRICT
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-6">
              Время одинаково для каждого.
              <br />
              Часы — нет.
            </p>
            <p className="text-zinc-600 text-xs tracking-[0.2em] uppercase">
              Rebuild your time.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-zinc-600 mb-6">
              Navigate
            </p>
            <ul className="space-y-3">
              {[
                { href: "/shop", label: "Shop" },
                { href: "/shop?category=custom", label: "Custom" },
                { href: "/shop?category=restored", label: "Restored" },
                { href: "/shop?category=curated", label: "Curated" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-zinc-600 mb-6">
              Information
            </p>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/contact", label: "Custom Orders" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-zinc-700 tracking-wider">
            © {new Date().getFullYear()} RE:DISTRICT. All rights reserved.
          </p>
          <p className="text-xs text-zinc-700 tracking-wider font-mono">
            Independent Watch Brand
          </p>
        </div>
      </div>
    </footer>
  );
}
