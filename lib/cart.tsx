"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { CartItem } from "@/lib/types";

const KEY = "rd_cart";

interface CartCtx {
  items:       CartItem[];
  open:        boolean;
  setOpen:     (v: boolean) => void;
  addItem:     (item: Omit<CartItem, "quantity">) => void;
  removeItem:  (productId: string) => void;
  updateQty:   (productId: string, qty: number) => void;
  clearCart:   () => void;
  total:       number;
  count:       number;
}

const CartContext = createContext<CartCtx>({
  items: [], open: false, setOpen: () => {}, addItem: () => {},
  removeItem: () => {}, updateQty: () => {}, clearCart: () => {},
  total: 0, count: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open,  setOpen]  = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      const next = existing
        ? prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setOpen(true);
  }, []);

  const removeItem  = (productId: string) => persist(items.filter(i => i.productId !== productId));
  const updateQty   = (productId: string, qty: number) => {
    if (qty <= 0) return removeItem(productId);
    persist(items.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };
  const clearCart   = () => persist([]);
  const total       = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count       = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, open, setOpen, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
