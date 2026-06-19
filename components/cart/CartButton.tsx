"use client";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";

export default function CartButton() {
  const { count, setOpen, open } = useCart();
  return (
    <button
      onClick={() => setOpen(!open)}
      className="relative flex items-center justify-center w-8 h-8 text-zinc-500 hover:text-white transition-colors duration-200"
      aria-label="Cart"
    >
      {/* Shopping bag icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {/* Counter badge */}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-white text-black text-[8px] font-mono rounded-none leading-none"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
