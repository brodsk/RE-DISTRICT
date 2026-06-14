"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import Image from "next/image";
import Link from "next/link";

export default function CartDrawer() {
  const { items, count, total, open, setOpen, removeItem, updateQty, checkout, loading, clearCart } = useCart();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm bg-black border-l border-white/8 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-zinc-500">
                  Cart
                </span>
                {count > 0 && (
                  <span className="text-[9px] font-mono text-zinc-700 border border-white/10 px-1.5 py-0.5">
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[9px] font-mono tracking-widest uppercase text-zinc-600 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                  <p className="text-zinc-700 font-mono text-xs tracking-widest uppercase">
                    Empty
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-500 hover:text-white transition-colors"
                  >
                    Browse Watches →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 p-5">
                      {/* Image */}
                      <div className="w-16 h-16 bg-zinc-950 shrink-0 relative overflow-hidden">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover grayscale"
                            sizes="64px"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="text-xs text-white font-mono leading-tight block mb-1 truncate hover:opacity-60 transition-opacity"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[10px] font-mono text-zinc-500 tabular-nums mb-3">
                          ${item.price}
                        </p>

                        {/* Qty controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQty(item.productId, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center border border-white/10
                                       text-zinc-500 hover:text-white hover:border-white/30 transition-all
                                       text-xs font-mono"
                          >
                            −
                          </button>
                          <span className="text-[10px] font-mono text-white tabular-nums w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.productId, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center border border-white/10
                                       text-zinc-500 hover:text-white hover:border-white/30 transition-all
                                       text-xs font-mono"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="ml-2 text-[9px] font-mono text-zinc-700 hover:text-white transition-colors tracking-widest uppercase"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-zinc-400 tabular-nums">
                          ${(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 p-5 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-600">Total</span>
                  <span className="text-sm font-mono text-white tabular-nums">${total.toFixed(0)}</span>
                </div>

                {/* Checkout */}
                <button
                  onClick={checkout}
                  disabled={loading}
                  className="w-full text-[10px] tracking-[0.3em] uppercase font-mono
                             bg-white text-black hover:bg-zinc-200 py-4
                             transition-colors duration-200 disabled:opacity-40"
                >
                  {loading ? "Redirecting…" : "Checkout via Stripe"}
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-[9px] tracking-[0.25em] uppercase font-mono
                             text-zinc-700 hover:text-white transition-colors"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
