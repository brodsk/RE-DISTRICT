"use client";
import { useCart } from "@/lib/cart";

export default function CartButton() {
  const { count, setOpen } = useCart();

  return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 group transition-opacity duration-200 hover:opacity-60"
      aria-label={`Cart (${count} items)`}
    >
      {/* Minimal bag icon */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.1"
           className="text-zinc-500 group-hover:text-white transition-colors">
        <rect x="2" y="4.5" width="10" height="8" rx="1"/>
        <path d="M4.5 4.5V3.5a2.5 2.5 0 015 0v1" strokeLinecap="round"/>
      </svg>
      {count > 0 && (
        <span className="text-[9px] font-mono text-white tabular-nums border border-white/20 px-1.5 py-0.5 min-w-[1.4rem] text-center">
          {count}
        </span>
      )}
    </button>
  );
}
