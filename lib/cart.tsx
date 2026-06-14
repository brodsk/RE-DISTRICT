"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { CartItem, Product } from "@/lib/types";

interface CartContextType {
  items:       CartItem[];
  count:       number;
  total:       number;
  open:        boolean;
  setOpen:     (v: boolean) => void;
  addItem:     (product: Product) => void;
  removeItem:  (productId: string) => void;
  updateQty:   (productId: string, qty: number) => void;
  clearCart:   () => void;
  checkout:    () => Promise<void>;
  loading:     boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "rd_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items,   setItems]   = useState<CartItem[]>([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const exists = prev.find(i => i.productId === product.id);
      if (exists) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        quantity:  1,
        name:      `${product.brand} ${product.name}`,
        price:     product.price,
        image:     product.images[0] ?? "",
        slug:      product.slug,
      }];
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setItems(prev => prev.map(i =>
        i.productId === productId ? { ...i, quantity: qty } : i
      ));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const checkout = useCallback(async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            name:      i.name,
            price:     i.price,
            quantity:  i.quantity,
            image:     i.image,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else console.error("No Stripe URL:", data);
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }, [items]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, count, total, open, setOpen,
      addItem, removeItem, updateQty, clearCart,
      checkout, loading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
