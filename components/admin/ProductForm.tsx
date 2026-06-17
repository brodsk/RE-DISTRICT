"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductCategory, ProductStatus } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

const cats:   ProductCategory[] = ["custom","restored","curated"];
const stats:  ProductStatus[]   = ["available","limited","sold","concept"];
const catL:   Record<ProductCategory,{en:string;ru:string}> = { custom:{en:"Custom",ru:"Кастом"}, restored:{en:"Restored",ru:"Реставрация"}, curated:{en:"Curated",ru:"Подбор"} };
const statL:  Record<ProductStatus,{en:string;ru:string}>   = { available:{en:"Available",ru:"В наличии"}, limited:{en:"Limited",ru:"Лимитировано"}, sold:{en:"Sold",ru:"Продано"}, concept:{en:"Concept",ru:"Концепт"} };

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").trim(); }

const inp = `w-full bg-transparent border border-white/10 hover:border-white/20 focus:border-white/40
  outline-none px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-800 transition-colors`;

export default function ProductForm({ initial, isNew }: { initial: Product; isNew?: boolean }) {
  const [form,      setForm]      = useState<Product>(initial);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveErr,   setSaveErr]   = useState("");
  const [uploading, setUploading] = useState(false);
  const [urlInput,  setUrlInput]  = useState("");
  const [lang]     = useAdminLang();
  const fileRef    = useRef<HTMLInputElement>(null);
  const router     = useRouter();

  const set = <K extends keyof Product>(k: K, v: Product[K]) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (isNew && (k === "brand" || k === "name")) next.slug = slugify(`${next.brand}-${next.name}`);
      return next;
    });
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    set("images", [...form.images, u]);
    setUrlInput("");
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res  = await fetch("/api/upload", { method:"POST", headers:{"x-admin-password":"redistrict2026"}, body: fd });
        const data = await res.json();
        if (data.url) urls.push(data.url);
      } catch {}
    }
    if (urls.length) set("images", [...form.images, ...urls]);
    setUploading(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveErr("");
    try {
      const res  = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type":"application/json", "x-admin-password":"redistrict2026" },
        body:    JSON.stringify({ ...form, updatedAt: new Date().toISOString() }),
      });
      const data = await res.json();
      if (data.ok) {
        setSaved(true);
        setTimeout(() => { setSaved(false); if (isNew) router.push("/admin/products"); }, 1200);
      } else {
        setSaveErr(data.error ?? "Save failed");
      }
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : "Network error");
    } finally { setSaving(false); }
  };

  const lbl = "block text-[8px] tracking-[0.3em] uppercase text-zinc-600 mb-2";

  return (
    <div className="max-w-3xl">
      <form onSubmit={save} className="space-y-10">

        {/* Core */}
        <section>
          <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-5 pb-3 border-b border-white/5">
            {L(lang,"Core","Основное")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {k:"brand",   en:"Brand",  ru:"Бренд",    ph:"Casio",           req:true  },
              {k:"name",    en:"Name",   ru:"Название", ph:"F-91W Shadow",    req:true  },
              {k:"tagline", en:"Tagline",ru:"Подпись",  ph:"One line hook",   req:false },
              {k:"slug",    en:"Slug",   ru:"URL-слаг", ph:"casio-f91w",      req:true  },
            ].map(f => (
              <div key={f.k}>
                <label className={lbl}>{L(lang,f.en,f.ru)}</label>
                <input className={inp} required={f.req}
                  value={(form as unknown as Record<string,string>)[f.k] ?? ""}
                  onChange={e => set(f.k as keyof Product, e.target.value as Product[keyof Product])}
                  placeholder={f.ph} />
              </div>
            ))}
            <div>
              <label className={lbl}>{L(lang,"Price (EUR)","Цена (EUR)")}</label>
              <input className={inp} type="number" min={0} required value={form.price}
                onChange={e => set("price", +e.target.value)} />
            </div>
            <div>
              <label className={lbl}>{L(lang,"Year","Год")}</label>
              <input className={inp} type="number" min={1900} max={2099} required value={form.year}
                onChange={e => set("year", +e.target.value)} />
            </div>
            <div>
              <label className={lbl}>{L(lang,"Category","Категория")}</label>
              <select className={inp+" bg-black"} value={form.category} onChange={e => set("category", e.target.value as ProductCategory)}>
                {cats.map(c => <option key={c} value={c}>{L(lang,catL[c].en,catL[c].ru)}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>{L(lang,"Status","Статус")}</label>
              <select className={inp+" bg-black"} value={form.status} onChange={e => set("status", e.target.value as ProductStatus)}>
                {stats.map(s => <option key={s} value={s}>{L(lang,statL[s].en,statL[s].ru)}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>{L(lang,"Stock","Остаток")}</label>
              <input className={inp} type="number" min={0} value={form.stock}
                onChange={e => set("stock", +e.target.value)} />
            </div>
          </div>
        </section>

        {/* Content */}
        <section>
          <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-5 pb-3 border-b border-white/5">
            {L(lang,"Content","Контент")}
          </p>
          <div className="space-y-5">
            <div>
              <label className={lbl}>{L(lang,"Description","Описание")}</label>
              <textarea className={inp+" resize-none"} rows={3} value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder={L(lang,"Short product description…","Краткое описание товара…")} />
            </div>
            <div>
              <label className={lbl}>{L(lang,"Story","История")}</label>
              <textarea className={inp+" resize-none"} rows={4} value={form.story ?? ""}
                onChange={e => set("story", e.target.value)}
                placeholder={L(lang,"Longer story on product page…","Полная история на странице товара…")} />
            </div>
            <div>
              <label className={lbl}>{L(lang,"Tags (comma-separated)","Теги (через запятую)")}</label>
              <input className={inp} value={form.tags.join(", ")}
                onChange={e => set("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                placeholder="casio, black, custom" />
            </div>
          </div>
        </section>

        {/* Images */}
        <section>
          <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-5 pb-3 border-b border-white/5">
            {L(lang,"Images","Фотографии")}
          </p>

          {/* Upload zone */}
          <div
            className="border border-dashed border-white/10 hover:border-white/30 p-8 text-center cursor-pointer transition-colors mb-4 group"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); uploadFiles(e.dataTransfer.files); }}
          >
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => uploadFiles(e.target.files)} />
            <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-600 group-hover:text-zinc-400 transition-colors">
              {uploading ? L(lang,"Uploading…","Загрузка…") : L(lang,"Drop photos or click to upload","Перетащите или кликните для загрузки")}
            </p>
            <p className="text-[8px] font-mono text-zinc-800 mt-1">JPG · PNG · WEBP</p>
          </div>

          {/* URL input */}
          <div className="flex gap-2 mb-5">
            <input className={inp+" flex-1"} value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder={L(lang,"Or paste image URL…","Или вставьте ссылку на фото…")}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addUrl(); }}} />
            <button type="button" onClick={addUrl}
              className="text-[8px] tracking-[0.25em] uppercase font-mono border border-white/10 hover:border-white/40 text-zinc-500 hover:text-white px-4 transition-all">
              {L(lang,"Add","Добавить")}
            </button>
          </div>

          {/* Preview grid */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative group aspect-square bg-zinc-950 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                  <button type="button" onClick={() => set("images", form.images.filter((_,j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900">
                    ×
                  </button>
                  {i === 0 && <div className="absolute bottom-1 left-1 text-[6px] font-mono uppercase text-zinc-400 bg-black/60 px-1">
                    {L(lang,"Main","Главное")}
                  </div>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Specs */}
        <section>
          <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-5 pb-3 border-b border-white/5">
            {L(lang,"Specifications","Характеристики")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {k:"case",           en:"Case",            ru:"Корпус"},
              {k:"display",        en:"Display",         ru:"Дисплей"},
              {k:"movement",       en:"Movement",        ru:"Механизм"},
              {k:"battery",        en:"Battery",         ru:"Батарейка"},
              {k:"waterResistance",en:"Water Resistance",ru:"Водозащита"},
              {k:"strap",          en:"Strap / Bracelet",ru:"Ремешок"},
            ].map(f => (
              <div key={f.k}>
                <label className={lbl}>{L(lang,f.en,f.ru)}</label>
                <input className={inp} value={form.specifications[f.k] ?? ""}
                  onChange={e => set("specifications", { ...form.specifications, [f.k]: e.target.value })} />
              </div>
            ))}
          </div>
        </section>

        {/* Featured toggle */}
        <section>
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div onClick={() => set("featured", !form.featured)}
              className={`w-9 h-5 border flex items-center transition-all cursor-pointer
                ${form.featured ? "bg-white border-white" : "bg-transparent border-white/20"}`}>
              <div className={`w-3.5 h-3.5 transition-all ${form.featured ? "ml-4 bg-black" : "ml-0.5 bg-zinc-700"}`} />
            </div>
            <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-500">
              {L(lang,"Featured on homepage","Показывать на главной")}
            </span>
          </label>
        </section>

        {saveErr && <p className="text-[9px] font-mono text-red-700 border border-red-900/30 px-4 py-3">{saveErr}</p>}

        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={saving}
            className={`text-[9px] tracking-[0.3em] uppercase px-8 py-3.5 transition-all
              ${saved ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"}`}>
            {saved ? L(lang,"✓ Saved","✓ Сохранено") : saving ? L(lang,"Saving…","Сохранение…") : isNew ? L(lang,"Create Product","Создать товар") : L(lang,"Save Changes","Сохранить")}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")}
            className="text-[9px] tracking-[0.3em] uppercase text-zinc-600 hover:text-white transition-colors">
            {L(lang,"Cancel","Отмена")}
          </button>
        </div>
      </form>
    </div>
  );
}
