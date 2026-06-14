"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CheckoutCancel() {
  const { setOpen } = useCart();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-6">
          Payment cancelled
        </p>
        <h1
          className="font-light text-white mb-6 leading-none"
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "clamp(2rem, 8vw, 4rem)",
            letterSpacing: "-0.02em",
          }}
        >
          No charge.
        </h1>
        <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-10">
          Your order was cancelled. Your cart is still intact.
        </p>
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={() => { setOpen(true); }}
            className="text-[10px] tracking-[0.3em] uppercase font-mono text-black bg-white
                       hover:bg-zinc-200 px-8 py-3.5 transition-colors"
          >
            Return to Cart
          </button>
          <Link
            href="/shop"
            className="text-[9px] tracking-[0.25em] uppercase font-mono text-zinc-600 hover:text-white transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
