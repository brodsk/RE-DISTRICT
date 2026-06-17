"use client";
import ProductForm from "@/components/admin/ProductForm";
import { Product } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

function newProduct(): Product {
  return {
    id:             crypto.randomUUID(),
    name:           "",
    brand:          "",
    slug:           "",
    tagline:        "",
    description:    "",
    story:          "",
    price:          0,
    images:         [],
    status:         "available",
    category:       "curated",
    tags:           [],
    stock:          1,
    featured:       false,
    year:           new Date().getFullYear(),
    specifications: {},
    createdAt:      new Date().toISOString(),
  };
}

export default function NewProductPage() {
  const [lang] = useAdminLang();
  return (
    <div className="pt-12">
      <p className="text-[8px] tracking-[0.4em] uppercase text-zinc-600 mb-2">
        {L(lang,"Products / New","Товары / Новый")}
      </p>
      <h1 className="text-3xl font-light mb-10" style={{ fontFamily: "serif" }}>
        {L(lang,"New Product","Новый товар")}
      </h1>
      <ProductForm initial={newProduct()} isNew />
    </div>
  );
}
