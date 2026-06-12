"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Listing, saveListing, slugify, WatchCategory, WatchCondition } from "@/lib/admin-store";

interface Props {
  initial: Listing;
  isNew?:  boolean;
}

const categories: WatchCategory[]  = ["custom", "restored", "curated"];
const conditions: WatchCondition[] = ["mint", "excellent", "good", "fair"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[8px] tracking-[0.3em] uppercase text-zinc-600 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass = `w-full bg-transparent border border-white/10 hover:border-white/20
  focus:border-white/40 outline-none px-4 py-3 text-sm text-white font-mono
  placeholder:text-zinc-800 transition-colors`;

export default function ListingForm({ initial, isNew }: Props) {
  const [form,   setForm]   = useState<Listing>(initial);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const router = useRouter();

  const set = (key: keyof Listing, val: unknown) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      // Auto-generate slug from brand + name
      if ((key === "brand" || key === "name") && isNew) {
        next.slug = slugify(`${next.brand} ${next.name}`);
      }
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updated = { ...form, updatedAt: new Date().toISOString() };
    saveListing(updated);
    setSaved(true);
    setSaving(false);
    setTimeout(() => {
      setSaved(false);
      if (isNew) router.push("/admin/listings");
    }, 1200);
  };

  const handleImages = (val: string) => {
    // comma-separated URLs
    set("images", val.split(",").map(s => s.trim()).filter(Boolean));
  };

  return (
    <form onSubmit={handleSave} className="space-y-10">

      {/* Section: Core */}
      <section>
        <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-6 pb-3 border-b border-white/5">
          Core Information
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Brand">
            <input className={inputClass} value={form.brand}
              onChange={e => set("brand", e.target.value)} placeholder="Casio" required />
          </Field>
          <Field label="Model Name">
            <input className={inputClass} value={form.name}
              onChange={e => set("name", e.target.value)} placeholder="G-Shock DW-5600" required />
          </Field>
          <Field label="Year">
            <input className={inputClass} type="number" value={form.year}
              onChange={e => set("year", +e.target.value)} min={1900} max={2099} required />
          </Field>
          <Field label="Price (USD)">
            <input className={inputClass} type="number" value={form.price}
              onChange={e => set("price", +e.target.value)} min={0} required />
          </Field>
          <Field label="Category">
            <select className={inputClass + " bg-black"} value={form.category}
              onChange={e => set("category", e.target.value as WatchCategory)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Condition">
            <select className={inputClass + " bg-black"} value={form.condition}
              onChange={e => set("condition", e.target.value as WatchCondition)}>
              {conditions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Slug (auto-generated)">
            <input className={inputClass} value={form.slug}
              onChange={e => set("slug", e.target.value)} placeholder="casio-g-shock-dw5600" required />
          </Field>
          <Field label="Tagline">
            <input className={inputClass} value={form.tagline}
              onChange={e => set("tagline", e.target.value)} placeholder="One line hook" />
          </Field>
        </div>
      </section>

      {/* Section: Content */}
      <section>
        <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-6 pb-3 border-b border-white/5">
          Content
        </p>
        <div className="space-y-6">
          <Field label="Short Description">
            <textarea className={inputClass + " resize-none"} rows={3} value={form.description}
              onChange={e => set("description", e.target.value)} placeholder="2–3 sentence description shown in listings" />
          </Field>
          <Field label="Story">
            <textarea className={inputClass + " resize-none"} rows={5} value={form.story}
              onChange={e => set("story", e.target.value)} placeholder="Full narrative shown on product page" />
          </Field>
          <Field label="Restoration Notes">
            <textarea className={inputClass + " resize-none"} rows={3} value={form.restorationNotes}
              onChange={e => set("restorationNotes", e.target.value)} placeholder="Work performed, parts replaced, etc." />
          </Field>
          <Field label="Custom Modifications">
            <textarea className={inputClass + " resize-none"} rows={3} value={form.customModifications}
              onChange={e => set("customModifications", e.target.value)} placeholder="Custom work, PVD, dial swap, etc." />
          </Field>
        </div>
      </section>

      {/* Section: Images */}
      <section>
        <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-6 pb-3 border-b border-white/5">
          Images
        </p>
        <Field label="Image URLs (comma-separated)">
          <textarea className={inputClass + " resize-none"} rows={3}
            value={form.images.join(", ")}
            onChange={e => handleImages(e.target.value)}
            placeholder="https://images.unsplash.com/..., https://..." />
        </Field>
        {form.images.length > 0 && (
          <div className="flex gap-3 mt-4 flex-wrap">
            {form.images.map((url, i) => (
              <div key={i} className="w-20 h-20 bg-zinc-950 overflow-hidden border border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover opacity-70" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section: Flags */}
      <section>
        <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-6 pb-3 border-b border-white/5">
          Status
        </p>
        <div className="flex gap-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => set("featured", !form.featured)}
              className={`w-8 h-4 rounded-none border transition-all cursor-pointer
                ${form.featured ? "bg-white border-white" : "bg-transparent border-white/20"}`}
            >
              <div className={`w-3.5 h-3.5 mt-px transition-all ${form.featured ? "ml-3.5 bg-black" : "ml-px bg-zinc-700"}`} />
            </div>
            <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-500">Featured</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set("sold", !form.sold)}
              className={`w-8 h-4 rounded-none border transition-all cursor-pointer
                ${form.sold ? "bg-white border-white" : "bg-transparent border-white/20"}`}
            >
              <div className={`w-3.5 h-3.5 mt-px transition-all ${form.sold ? "ml-3.5 bg-black" : "ml-px bg-zinc-700"}`} />
            </div>
            <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-500">Sold</span>
          </label>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-6 pt-4">
        <button
          type="submit"
          disabled={saving}
          className={`text-[9px] tracking-[0.3em] uppercase px-8 py-3.5 transition-all
            ${saved
              ? "bg-zinc-800 text-zinc-500"
              : "bg-white text-black hover:bg-zinc-200"}`}
        >
          {saved ? "✓ Saved" : saving ? "Saving…" : isNew ? "Create Listing" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/listings")}
          className="text-[9px] tracking-[0.3em] uppercase text-zinc-600 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
