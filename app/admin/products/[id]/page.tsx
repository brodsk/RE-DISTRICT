"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";
import { useAdminLang, L } from "@/app/admin/layout";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang] = useAdminLang();

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then(r => r.json())
      .then((list: Product[]) => {
        setProduct(list.find(p => p.id === id) ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-12 text-zinc-700 text-xs font-mono">{L(lang,"Loading…","Загрузка…")}</div>;
  if (!product) return <div className="pt-12 text-zinc-700 text-xs font-mono">{L(lang,"Product not found.","Товар не найден.")}</div>;

  return (
    <div className="pt-12">
      <p className="text-[8px] tracking-[0.4em] uppercase text-zinc-600 mb-2">
        {L(lang,"Products / Edit","Товары / Редактировать")}
      </p>
      <h1 className="text-3xl font-light mb-10" style={{ fontFamily: "serif" }}>
        {product.brand} {product.name}
      </h1>
      <ProductForm initial={product} />
    </div>
  );
}
