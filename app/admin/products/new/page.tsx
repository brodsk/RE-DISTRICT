"use client";
import ProductForm from "@/components/admin/ProductForm";
import { Product } from "@/lib/types";

const blank: Product = {
  id:             typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).slice(2),
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
};

export default function NewProductPage() {
  return (
    <div className="pt-12">
      <p className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 mb-2">Products / New</p>
      <h1 className="text-3xl font-light mb-10" style={{ fontFamily: "var(--font-display, serif)" }}>
        New Product
      </h1>
      <ProductForm initial={blank} isNew />
    </div>
  );
}
