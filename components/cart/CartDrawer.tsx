"use client";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLang } from "@/lib/lang";

export default function CartDrawer() {
  const { items, open, setOpen, removeItem, updateQty, total, count } = useCart();
  const { t } = useLang();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-black
                       border-l border-white/8 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <span className="text-[9px] tracking-[0.4em] uppercase font-mono text-zinc-500">
                {t("Cart", "Корзина")}
                {count > 0 && <span className="ml-2 text-white">({count})</span>}
              </span>
              <button onClick={() => setOpen(false)}
                className="text-[9px] tracking-[0.3em] uppercase font-mono text-zinc-600 hover:text-white transition-colors">
                {t("Close", "Закрыть")}
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                  <p className="text-zinc-700 font-mono text-xs tracking-widest text-center">
                    {t("Your cart is empty.", "Корзина пуста.")}
                  </p>
                  <Link href="/shop" onClick={() => setOpen(false)}
                    className="text-[9px] tracking-[0.3em] uppercase font-mono text-zinc-600 hover:text-white transition-colors">
                    {t("Browse watches →", "Смотреть часы →")}
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {items.map(item => (
                    <div key={item.productId} className="flex gap-4 px-6 py-5">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name}
                          className="w-16 h-16 object-cover shrink-0 border border-white/5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-white mb-1 truncate">{item.name}</p>
                        <p className="text-xs font-mono text-zinc-500 mb-3">€{item.price}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-white/10">
                            <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white text-sm transition-colors">
                              −
                            </button>
                            <span className="w-8 text-center text-[11px] font-mono text-white">
                              {item.quantity}
                            </span>
                            <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white text-sm transition-colors">
                              +
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.productId)}
                            className="text-[8px] tracking-wider uppercase font-mono text-zinc-700 hover:text-red-700 transition-colors">
                            {t("Remove", "Удалить")}
                          </button>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-mono text-white">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 px-6 py-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] tracking-[0.3em] uppercase font-mono text-zinc-500">
                    {t("Subtotal", "Сумма")}
                  </span>
                  <span className="text-base font-mono text-white tabular-nums">
                    €{total.toFixed(2)}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-zinc-700">
                  {t("+ Shipping calculated at checkout", "+ Доставка рассчитывается при оформлении")}
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center text-[10px] tracking-[0.35em] uppercase font-mono
                             bg-white text-black hover:bg-zinc-200 py-4 transition-colors"
                >
                  {t("Checkout", "Оформить заказ")}
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="block w-full text-center text-[9px] tracking-[0.3em] uppercase font-mono
                             text-zinc-600 hover:text-white transition-colors"
                >
                  {t("Continue Shopping", "Продолжить покупки")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
