"use client";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";

export default function CartButton() {
  const { count, setOpen, open } = useCart();
  return (
    <button
      onClick={() => setOpen(!open)}
      className="relative flex items-center gap-1.5 text-zinc-500 hover:text-white
                 transition-colors duration-200 font-mono"
      aria-label="Cart"
    >
      <span className="text-[10px] tracking-[0.25em] uppercase">
        Cart
      </span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center justify-center w-4 h-4 bg-white text-black
                       text-[8px] font-mono rounded-none"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
