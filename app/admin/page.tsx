"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts).catch(() => {});
  }, []);

  const stats = {
    total:     products.length,
    available: products.filter(p => p.status === "available").length,
    limited:   products.filter(p => p.status === "limited").length,
    sold:      products.filter(p => p.status === "sold").length,
  };

  return (
    <div className="pt-12">
      <p className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 mb-2">Overview</p>
      <h1 className="text-3xl font-light mb-10" style={{ fontFamily: "var(--font-display, serif)" }}>Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 mb-12">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="bg-black p-6">
            <p className="text-[8px] tracking-[0.3em] uppercase text-zinc-600 mb-2 capitalize">{k}</p>
            <p className="text-4xl font-light tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap">
        <Link href="/admin/products/new"
          className="text-[9px] tracking-[0.3em] uppercase bg-white text-black px-6 py-3 hover:bg-zinc-200 transition-colors">
          + New Product
        </Link>
        <Link href="/admin/products"
          className="text-[9px] tracking-[0.3em] uppercase border border-white/10 text-zinc-400 hover:text-white px-6 py-3 transition-all">
          Manage Products
        </Link>
        <Link href="/admin/builder"
          className="text-[9px] tracking-[0.3em] uppercase border border-white/10 text-zinc-400 hover:text-white px-6 py-3 transition-all">
          Page Builder
        </Link>
        <Link href="/shop" target="_blank"
          className="text-[9px] tracking-[0.3em] uppercase border border-white/10 text-zinc-400 hover:text-white px-6 py-3 transition-all">
          View Shop ↗
        </Link>
      </div>
    </div>
  );
}
