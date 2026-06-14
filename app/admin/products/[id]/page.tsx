"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { Product } from "@/lib/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then((data: Product[]) => {
        setProduct(data.find(p => p.id === id) ?? null);
      });
  }, [id]);

  if (!product) return <div className="pt-12 text-zinc-700 font-mono text-xs">Loading…</div>;

  return (
    <div className="pt-12">
      <p className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 mb-2">Products / Edit</p>
      <h1 className="text-3xl font-light mb-10" style={{ fontFamily: "var(--font-display, serif)" }}>
        {product.brand} {product.name}
      </h1>
      <ProductForm initial={product} />
    </div>
  );
}
