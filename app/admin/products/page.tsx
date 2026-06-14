"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";

const statusColor: Record<string, string> = {
  available: "text-white",
  limited:   "text-zinc-300",
  sold:      "text-zinc-600",
  concept:   "text-zinc-700",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = () => {
    fetch("/api/products").then(r => r.json()).then(data => { setProducts(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": "redistrict2026" },
    });
    load();
  };

  return (
    <div className="pt-12">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 mb-2">Manage</p>
          <h1 className="text-3xl font-light" style={{ fontFamily: "var(--font-display, serif)" }}>Products</h1>
        </div>
        <Link href="/admin/products/new"
          className="text-[9px] tracking-[0.3em] uppercase bg-white text-black px-5 py-2.5 hover:bg-zinc-200 transition-colors">
          + New
        </Link>
      </div>

      {loading ? (
        <p className="text-zinc-700 text-xs tracking-widest">Loading…</p>
      ) : (
        <div className="border-t border-white/5">
          {products.map(p => (
            <div key={p.id} className="border-b border-white/5 py-5 flex items-center gap-5">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.status === "available" || p.status === "limited" ? "bg-white/40" : "bg-zinc-700"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm text-white truncate">{p.brand} {p.name}</span>
                  {p.featured && <span className="text-[7px] tracking-[0.25em] uppercase text-zinc-600 border border-white/10 px-1.5 py-0.5">Featured</span>}
                </div>
                <div className="flex gap-3 items-center">
                  <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-600">{p.category}</span>
                  <span className="text-zinc-800">·</span>
                  <span className={`text-[8px] tracking-[0.2em] uppercase ${statusColor[p.status]}`}>{p.status}</span>
                  <span className="text-zinc-800">·</span>
                  <span className="text-[8px] font-mono text-zinc-500">${p.price}</span>
                </div>
              </div>
              <div className="flex gap-4 shrink-0">
                <Link href={`/product/${p.slug}`} target="_blank"
                  className="text-[8px] tracking-wider uppercase text-zinc-700 hover:text-white transition-colors">View ↗</Link>
                <Link href={`/admin/products/${p.id}`}
                  className="text-[8px] tracking-wider uppercase text-zinc-500 hover:text-white transition-colors">Edit</Link>
                <button onClick={() => handleDelete(p.id, `${p.brand} ${p.name}`)}
                  className="text-[8px] tracking-wider uppercase text-zinc-800 hover:text-red-700 transition-colors">Delete</button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-zinc-700 text-xs font-mono py-12 text-center tracking-widest">No products yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
