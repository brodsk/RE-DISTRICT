"use client";
import { useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductCategory, ProductStatus } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

const cats:  ProductCategory[] = ["custom","restored","curated"];
const stats: ProductStatus[]   = ["available","limited","sold","concept"];
const catL:  Record<ProductCategory,{en:string;ru:string}> = {
  custom:   {en:"Custom",   ru:"Кастом"},
  restored: {en:"Restored", ru:"Реставрация"},
  curated:  {en:"Curated",  ru:"Подбор"},
};
const statL: Record<ProductStatus,{en:string;ru:string}> = {
  available: {en:"Available",     ru:"В наличии"},
  limited:   {en:"Limited",       ru:"Лимитировано"},
  sold:      {en:"Sold",          ru:"Продано"},
  concept:   {en:"Concept",       ru:"Концепт"},
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").trim();
}

// FIX #1/#4: Dropdown styles — dark text on white bg, scoped to admin only
const selectCls = `
  w-full border border-white/10 hover:border-white/20 focus:border-white/40
  outline-none px-4 py-3 text-sm font-mono transition-colors
  text-[#111] bg-white
`;

const inp = `w-full bg-transparent border border-white/10 hover:border-white/20 focus:border-white/40
  outline-none px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-800 transition-colors`;

export default function ProductForm({ initial, isNew }: { initial: Product; isNew?: boolean }) {
  const [form,      setForm]      = useState<Product>(initial);
  // FIX #2: price stored as string during editing
  const [priceStr,  setPriceStr]  = useState<string>(initial.price === 0 && isNew ? "" : String(initial.price));
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveErr,   setSaveErr]   = useState("");
  const [uploading, setUploading] = useState(false);
  const [urlInput,  setUrlInput]  = useState("");
  // FIX #3: tags managed as array + input string
  const [tagInput,  setTagInput]  = useState("");
  const [lang]     = useAdminLang();
  const fileRef    = useRef<HTMLInputElement>(null);
  const router     = useRouter();

  const set = <K extends keyof Product>(k: K, v: Product[K]) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (isNew && (k === "brand" || k === "name")) {
        next.slug = slugify(`${next.brand}-${next.name}`);
      }
      return next;
    });
  };

  // FIX #3: add tag from input
  const addTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;
    // Allow comma-separated multiple at once
    const newTags = raw.split(",").map(t => t.trim()).filter(Boolean);
    const merged  = Array.from(new Set([...form.tags, ...newTags]));
    set("tags", merged);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    set("tags", form.tags.filter(t => t !== tag));
  };

  const onTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    // Backspace on empty input removes last tag
    if (e.key === "Backspace" && tagInput === "" && form.tags.length > 0) {
      set("tags", form.tags.slice(0, -1));
    }
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
        const res  = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-admin-password": "redistrict2026" },
          body: fd,
        });
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

    // FIX #2: convert price string → number only at save time
    const priceNum = priceStr === "" ? 0 : parseFloat(priceStr) || 0;
    const payload  = { ...form, price: priceNum, updatedAt: new Date().toISOString() };

    try {
      const res  = await fetch("/api/products", {
        method:  "POST",
        headers: { "Content-Type":"application/json", "x-admin-password":"redistrict2026" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setSaved(true);
        if (!data.persistent) {
          setSaveErr(
            L(lang,
              `⚠️ Saved to "${data.backend}" but not persistent — configure Vercel KV.`,
              `⚠️ Сохранено в "${data.backend}", но не постоянно — настройте Vercel KV.`
            )
          );
        }
        if (isNew) {
          router.push("/admin/products");
        } else {
          setTimeout(() => setSaved(false), 2000);
        }
      } else {
        setSaveErr(data.error ?? L(lang, "Save failed", "Ошибка сохранения"));
      }
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : L(lang, "Network error", "Ошибка сети"));
    } finally {
      setSaving(false);
    }
  };

  const lbl = "block text-[8px] tracking-[0.3em] uppercase text-zinc-600 mb-2";

  return (
    <div className="max-w-3xl">
      {/* FIX #1: inline style block scoped to admin form — forces dropdown option colours */}
      <style>{`
        .admin-select option {
          background: #ffffff;
          color: #111111;
        }
        .admin-select option:hover,
        .admin-select option:checked {
          background: #374151;
          color: #ffffff;
        }
      `}</style>

      <form onSubmit={save} className="space-y-10">

        {/* ── Core ── */}
        <section>
          <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-5 pb-3 border-b border-white/5">
            {L(lang,"Core","Основное")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Text fields */}
            {[
              {k:"brand",   en:"Brand",   ru:"Бренд",    ph:"Casio",        req:true  },
              {k:"name",    en:"Name",    ru:"Название", ph:"F-91W Shadow", req:true  },
              {k:"tagline", en:"Tagline", ru:"Подпись",  ph:"One line hook", req:false },
              {k:"slug",    en:"Slug",    ru:"URL-слаг", ph:"casio-f91w",   req:true  },
            ].map(f => (
              <div key={f.k}>
                <label className={lbl}>{L(lang,f.en,f.ru)}</label>
                <input
                  className={inp}
                  required={f.req}
                  value={(form as unknown as Record<string,string>)[f.k] ?? ""}
                  onChange={e => set(f.k as keyof Product, e.target.value as Product[keyof Product])}
                  placeholder={f.ph}
                />
              </div>
            ))}

            {/* FIX #2: Price as string input */}
            <div>
              <label className={lbl}>{L(lang,"Price (EUR)","Цена (EUR)")}</label>
              <input
                className={inp}
                type="text"
                inputMode="decimal"
                value={priceStr}
                onChange={e => {
                  // Allow digits, dot, comma; strip everything else
                  const v = e.target.value.replace(/[^0-9.,]/g, "");
                  setPriceStr(v);
                }}
                placeholder="0"
              />
            </div>

            <div>
              <label className={lbl}>{L(lang,"Year","Год")}</label>
              <input
                className={inp}
                type="number"
                min={1900}
                max={2099}
                required
                value={form.year}
                onChange={e => set("year", +e.target.value)}
              />
            </div>

            {/* FIX #1: Category dropdown */}
            <div>
              <label className={lbl}>{L(lang,"Category","Категория")}</label>
              <select
                className={selectCls + " admin-select"}
                value={form.category}
                onChange={e => set("category", e.target.value as ProductCategory)}
              >
                {cats.map(c => (
                  <option key={c} value={c}>{L(lang,catL[c].en,catL[c].ru)}</option>
                ))}
              </select>
            </div>

            {/* FIX #1: Status dropdown */}
            <div>
              <label className={lbl}>{L(lang,"Status","Статус")}</label>
              <select
                className={selectCls + " admin-select"}
                value={form.status}
                onChange={e => set("status", e.target.value as ProductStatus)}
              >
                {stats.map(s => (
                  <option key={s} value={s}>{L(lang,statL[s].en,statL[s].ru)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={lbl}>{L(lang,"Stock","Остаток")}</label>
              <input
                className={inp}
                type="number"
                min={0}
                value={form.stock}
                onChange={e => set("stock", +e.target.value)}
              />
            </div>
          </div>

          {/* RD Watch ID — read-only display */}
          {form.rdWatchId && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[8px] tracking-[0.3em] uppercase text-zinc-600">
                {L(lang,"Watch ID","ID часов")}
              </span>
              <span className="text-[10px] font-mono text-zinc-300 border border-white/10 px-3 py-1.5">
                {form.rdWatchId}
              </span>
            </div>
          )}
        </section>

        {/* ── Content ── */}
        <section>
          <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-5 pb-3 border-b border-white/5">
            {L(lang,"Content","Контент")}
          </p>
          <div className="space-y-5">
            {/* FIX #6: description = 10 rows */}
            <div>
              <label className={lbl}>{L(lang,"Description","Описание")}</label>
              <textarea
                className={inp + " resize-none"}
                rows={10}
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder={L(lang,"Product description…\nNew lines are preserved on the product page.","Описание товара…\nПереносы строк сохраняются на странице товара.")}
              />
            </div>
            <div>
              <label className={lbl}>{L(lang,"Story","История")}</label>
              <textarea
                className={inp + " resize-none"}
                rows={5}
                value={form.story ?? ""}
                onChange={e => set("story", e.target.value)}
                placeholder={L(lang,"Longer story shown on product page…","Полная история на странице товара…")}
              />
            </div>

            {/* FIX #3: Tags with comma/Enter handling */}
            <div>
              <label className={lbl}>{L(lang,"Tags","Теги")}</label>

              {/* Tag pills */}
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[9px] font-mono text-zinc-300 border border-white/10 px-2 py-0.5">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}
                        className="text-zinc-600 hover:text-white transition-colors ml-0.5 text-[10px] leading-none">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag input */}
              <div className="flex gap-2">
                <input
                  className={inp + " flex-1"}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={onTagKeyDown}
                  placeholder={L(lang,"Type tag and press , or Enter","Введите тег и нажмите , или Enter")}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="text-[8px] tracking-[0.25em] uppercase font-mono border border-white/10 hover:border-white/40 text-zinc-500 hover:text-white px-4 transition-all"
                >
                  {L(lang,"Add","+")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Images ── */}
        <section>
          <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-5 pb-3 border-b border-white/5">
            {L(lang,"Images","Фотографии")}
          </p>
          <div
            className="border border-dashed border-white/10 hover:border-white/30 p-8 text-center cursor-pointer transition-colors mb-4 group"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); uploadFiles(e.dataTransfer.files); }}
          >
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => uploadFiles(e.target.files)} />
            <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-600 group-hover:text-zinc-400 transition-colors">
              {uploading
                ? L(lang,"Uploading…","Загрузка…")
                : L(lang,"Drop photos or click to upload","Перетащите или кликните для загрузки")}
            </p>
            <p className="text-[8px] font-mono text-zinc-800 mt-1">JPG · PNG · WEBP</p>
          </div>

          <div className="flex gap-2 mb-5">
            <input
              className={inp + " flex-1"}
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder={L(lang,"Or paste image URL…","Или вставьте ссылку на фото…")}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addUrl(); }}}
            />
            <button type="button" onClick={addUrl}
              className="text-[8px] tracking-[0.25em] uppercase font-mono border border-white/10 hover:border-white/40 text-zinc-500 hover:text-white px-4 transition-all">
              {L(lang,"Add","Добавить")}
            </button>
          </div>

          {form.images.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative group aspect-square bg-zinc-950 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                  <button type="button"
                    onClick={() => set("images", form.images.filter((_,j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900">
                    ×
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-1 left-1 text-[6px] font-mono uppercase text-zinc-400 bg-black/60 px-1">
                      {L(lang,"Main","Главное")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Specifications ── */}
        <section>
          <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-5 pb-3 border-b border-white/5">
            {L(lang,"Specifications","Характеристики")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {k:"case",            en:"Case",             ru:"Корпус"},
              {k:"display",         en:"Display",          ru:"Дисплей"},
              {k:"movement",        en:"Movement",         ru:"Механизм"},
              {k:"battery",         en:"Battery",          ru:"Батарейка"},
              {k:"waterResistance", en:"Water Resistance", ru:"Водозащита"},
              {k:"strap",           en:"Strap / Bracelet", ru:"Ремешок"},
            ].map(f => (
              <div key={f.k}>
                <label className={lbl}>{L(lang,f.en,f.ru)}</label>
                <input
                  className={inp}
                  value={form.specifications[f.k] ?? ""}
                  onChange={e => set("specifications", { ...form.specifications, [f.k]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured toggle ── */}
        <section>
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              onClick={() => set("featured", !form.featured)}
              className={`w-9 h-5 border flex items-center transition-all cursor-pointer ${
                form.featured ? "bg-white border-white" : "bg-transparent border-white/20"
              }`}
            >
              <div className={`w-3.5 h-3.5 transition-all ${form.featured ? "ml-4 bg-black" : "ml-0.5 bg-zinc-700"}`} />
            </div>
            <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-500">
              {L(lang,"Featured on homepage","Показывать на главной")}
            </span>
          </label>
        </section>

        {saveErr && (
          <p className="text-[9px] font-mono text-amber-600 border border-amber-900/30 px-4 py-3">
            {saveErr}
          </p>
        )}

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`text-[9px] tracking-[0.3em] uppercase px-8 py-3.5 transition-all font-mono ${
              saved ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {saved
              ? L(lang,"✓ Saved","✓ Сохранено")
              : saving
                ? L(lang,"Saving…","Сохранение…")
                : isNew
                  ? L(lang,"Create Product","Создать товар")
                  : L(lang,"Save Changes","Сохранить")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="text-[9px] tracking-[0.3em] uppercase text-zinc-600 hover:text-white transition-colors font-mono"
          >
            {L(lang,"Cancel","Отмена")}
          </button>
        </div>
      </form>
    </div>
  );
}
