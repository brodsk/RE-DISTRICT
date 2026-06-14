"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { motion } from "framer-motion";

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-sm"
      >
        <div className="w-px h-12 bg-white/20 mx-auto mb-8" />
        <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-4">
          Order confirmed
        </p>
        <h1
          className="font-light text-white mb-6 leading-none"
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "clamp(2rem, 8vw, 4rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Thank you.
        </h1>
        <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-10">
          Your order is confirmed. We'll be in touch via email with tracking details.
          Questions? Reach us on Instagram.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <Link
            href="/shop"
            className="text-[10px] tracking-[0.3em] uppercase font-mono text-black bg-white
                       hover:bg-zinc-200 px-8 py-3.5 transition-colors"
          >
            Back to Shop
          </Link>
          <Link
            href="https://www.instagram.com/re.district"
            target="_blank"
            className="text-[9px] tracking-[0.25em] uppercase font-mono text-zinc-600 hover:text-white transition-colors"
          >
            @re.district
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
