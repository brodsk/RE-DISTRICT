"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductCategory, ProductStatus } from "@/lib/types";

const categories: ProductCategory[] = ["custom", "restored", "curated"];
const statuses:   ProductStatus[]   = ["available", "limited", "sold", "concept"];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim();
}

const input = `w-full bg-transparent border border-white/10 hover:border-white/20
  focus:border-white/40 outline-none px-4 py-3 text-sm text-white font-mono
  placeholder:text-zinc-800 transition-colors`;

const label = "block text-[8px] tracking-[0.3em] uppercase text-zinc-600 mb-2";

interface Props { initial: Product; isNew?: boolean; }

export default function ProductForm({ initial, isNew }: Props) {
  const [form,   setForm]   = useState<Product>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const router = useRouter();

  const set = <K extends keyof Product>(k: K, v: Product[K]) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if ((k === "brand" || k === "name") && isNew) {
        next.slug = slugify(`${next.brand}-${next.name}`);
      }
      return next;
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": "redistrict2026" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (isNew) router.push("/admin/products");
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-10 max-w-3xl">

      {/* Core */}
      <section>
        <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-6 pb-3 border-b border-white/5">Core</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Brand",  key: "brand",  placeholder: "Casio" },
            { label: "Name",   key: "name",   placeholder: "F-91W Shadow" },
            { label: "Tagline",key: "tagline",placeholder: "One line hook" },
            { label: "Slug",   key: "slug",   placeholder: "casio-f91w-shadow" },
          ].map(f => (
            <div key={f.key}>
              <label className={label}>{f.label}</label>
              <input className={input} value={(form as unknown as Record<string, unknown>)[f.key] as string ?? ""}
                onChange={e => set(f.key as keyof Product, e.target.value as Product[keyof Product])}
                placeholder={f.placeholder} required={f.key !== "tagline"} />
            </div>
          ))}

          <div>
            <label className={label}>Price (USD)</label>
            <input className={input} type="number" min={0} value={form.price}
              onChange={e => set("price", +e.target.value)} required />
          </div>
          <div>
            <label className={label}>Year</label>
            <input className={input} type="number" min={1900} max={2099} value={form.year}
              onChange={e => set("year", +e.target.value)} required />
          </div>
          <div>
            <label className={label}>Category</label>
            <select className={input + " bg-black"} value={form.category} onChange={e => set("category", e.target.value as ProductCategory)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Status</label>
            <select className={input + " bg-black"} value={form.status} onChange={e => set("status", e.target.value as ProductStatus)}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Stock quantity</label>
            <input className={input} type="number" min={0} value={form.stock}
              onChange={e => set("stock", +e.target.value)} />
          </div>
        </div>
      </section>

      {/* Content */}
      <section>
        <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-6 pb-3 border-b border-white/5">Content</p>
        <div className="space-y-5">
          <div>
            <label className={label}>Description</label>
            <textarea className={input + " resize-none"} rows={3} value={form.description}
              onChange={e => set("description", e.target.value)} />
          </div>
          <div>
            <label className={label}>Story</label>
            <textarea className={input + " resize-none"} rows={5} value={form.story ?? ""}
              onChange={e => set("story", e.target.value)} />
          </div>
          <div>
            <label className={label}>Tags (comma-separated)</label>
            <input className={input} value={form.tags.join(", ")}
              onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
              placeholder="casio, f91w, black, custom" />
          </div>
        </div>
      </section>

      {/* Images */}
      <section>
        <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-6 pb-3 border-b border-white/5">Images</p>
        <div>
          <label className={label}>Image URLs (one per line)</label>
          <textarea className={input + " resize-none"} rows={4}
            value={form.images.join("\n")}
            onChange={e => set("images", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} />
        </div>
        {form.images.length > 0 && (
          <div className="flex gap-3 mt-3 flex-wrap">
            {form.images.slice(0, 4).map((url, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={url} alt="" className="w-16 h-16 object-cover opacity-60 border border-white/5" />
            ))}
          </div>
        )}
      </section>

      {/* Specifications */}
      <section>
        <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-6 pb-3 border-b border-white/5">Specifications</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {["case", "display", "movement", "battery", "waterResistance", "strap"].map(k => (
            <div key={k}>
              <label className={label}>{k.replace(/([A-Z])/g, " $1")}</label>
              <input className={input} value={form.specifications[k] ?? ""}
                onChange={e => set("specifications", { ...form.specifications, [k]: e.target.value })}
                placeholder={k} />
            </div>
          ))}
        </div>
      </section>

      {/* Flags */}
      <section>
        <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-5 pb-3 border-b border-white/5">Flags</p>
        <div className="flex gap-6">
          {(["featured"] as const).map(flag => (
            <label key={flag} className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => set(flag, !form[flag])}
                className={`w-8 h-4 border transition-all cursor-pointer flex items-center
                  ${form[flag] ? "bg-white border-white" : "bg-transparent border-white/20"}`}>
                <div className={`w-3 h-3 transition-all ${form[flag] ? "ml-4 bg-black" : "ml-0.5 bg-zinc-700"}`} />
              </div>
              <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-500 capitalize">{flag}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button type="submit" disabled={saving}
          className={`text-[9px] tracking-[0.3em] uppercase px-8 py-3.5 transition-all
            ${saved ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"}`}>
          {saved ? "✓ Saved" : saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")}
          className="text-[9px] tracking-[0.3em] uppercase text-zinc-600 hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
