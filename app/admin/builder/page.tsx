"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBlock, BlockType } from "@/lib/types";
import { useAdminLang, L } from "@/app/admin/layout";

// Block type definitions
const BLOCK_TYPES: { type: BlockType; en: string; ru: string; defaults: Record<string, unknown> }[] = [
  { type: "hero",             en: "Hero",             ru: "Герой",           defaults: { headline: "Headline", subheadline: "Subheadline", cta: "Explore", ctaHref: "/shop" } },
  { type: "manifesto",        en: "Manifesto",        ru: "Манифест",        defaults: { text: "Brand statement here." } },
  { type: "productGrid",      en: "Product Grid",     ru: "Сетка товаров",   defaults: { title: "Current Selection", featured: true } },
  { type: "productHighlight", en: "Product Highlight",ru: "Выделенный товар",defaults: { productId: "" } },
  { type: "textBlock",        en: "Text Block",       ru: "Текстовый блок",  defaults: { text: "Your text here." } },
  { type: "cta",              en: "CTA",              ru: "Призыв к действию",defaults: { text: "Shop Now", href: "/shop" } },
  { type: "gallery",          en: "Gallery",          ru: "Галерея",         defaults: { images: [] } },
  { type: "process",          en: "Process",          ru: "Процесс",         defaults: { steps: [] } },
  { type: "collection",       en: "Collection",       ru: "Коллекция",       defaults: { title: "Drop 01" } },
];

const PAGES = ["home", "shop", "about"];

function BlockEditor({
  block, onChange, onDelete, onMoveUp, onMoveDown, canUp, canDown
}: {
  block:      PageBlock;
  onChange:   (data: Record<string, unknown>) => void;
  onDelete:   () => void;
  onMoveUp:   () => void;
  onMoveDown: () => void;
  canUp:      boolean;
  canDown:    boolean;
}) {
  const [open, setOpen] = useState(false);
  const def = BLOCK_TYPES.find(b => b.type === block.type);

  return (
    <div className="border border-white/8 bg-black">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Reorder */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={onMoveUp} disabled={!canUp}
            className="text-zinc-700 hover:text-white disabled:opacity-20 transition-colors text-xs leading-none">▲</button>
          <button onClick={onMoveDown} disabled={!canDown}
            className="text-zinc-700 hover:text-white disabled:opacity-20 transition-colors text-xs leading-none">▼</button>
        </div>

        <div className="flex-1">
          <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-zinc-400">{block.type}</p>
        </div>

        <button onClick={() => setOpen(!open)}
          className="text-[8px] tracking-wider uppercase font-mono text-zinc-600 hover:text-white transition-colors px-3 py-1.5 border border-white/10 hover:border-white/30">
          {open ? "Collapse" : "Edit"}
        </button>
        <button onClick={onDelete}
          className="text-[8px] font-mono text-zinc-800 hover:text-red-700 transition-colors px-2">
          ×
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3">
              {Object.keys(def?.defaults ?? {}).map(key => {
                const val = block.data[key];
                const isArr = Array.isArray(val);
                return (
                  <div key={key}>
                    <label className="block text-[7px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-1.5 capitalize">{key}</label>
                    {typeof val === "boolean" ? (
                      <button type="button" onClick={() => onChange({ ...block.data, [key]: !val })}
                        className={`text-[8px] font-mono tracking-wider uppercase px-3 py-1.5 border transition-all
                          ${val ? "border-white/40 text-white" : "border-white/10 text-zinc-600"}`}>
                        {val ? "Yes" : "No"}
                      </button>
                    ) : isArr ? (
                      <textarea
                        className="w-full bg-transparent border border-white/10 focus:border-white/30 outline-none px-3 py-2 text-xs text-white font-mono resize-none"
                        rows={3}
                        value={JSON.stringify(val, null, 2)}
                        onChange={e => {
                          try { onChange({ ...block.data, [key]: JSON.parse(e.target.value) }); } catch {}
                        }}
                      />
                    ) : (
                      <input
                        className="w-full bg-transparent border border-white/10 focus:border-white/30 outline-none px-3 py-2 text-xs text-white font-mono"
                        value={String(val ?? "")}
                        onChange={e => onChange({ ...block.data, [key]: e.target.value })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BuilderPage() {
  const [page,    setPage]    = useState("home");
  const [blocks,  setBlocks]  = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [lang] = useAdminLang();

  const load = async (p: string) => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/pages?page=${p}`, { cache: "no-store" });
      const data = await res.json();
      setBlocks(Array.isArray(data?.blocks) ? data.blocks : []);
    } catch { setError("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  const save = async () => {
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/pages", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": "redistrict2026" },
        body:    JSON.stringify({ page, config: { blocks } }),
      });
      const data = await res.json();
      if (data.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
      else setError(data.error ?? "Save failed");
    } catch { setError("Network error"); }
    setSaving(false);
  };

  const addBlock = (type: BlockType) => {
    const def = BLOCK_TYPES.find(b => b.type === type)!;
    setBlocks(prev => [...prev, { id: crypto.randomUUID(), type, data: { ...def.defaults } }]);
  };

  const updateBlock = (id: string, data: Record<string, unknown>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks(prev => {
      const idx   = prev.findIndex(b => b.id === id);
      const next  = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  return (
    <div className="pt-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[8px] tracking-[0.4em] uppercase text-zinc-600 mb-2">{L(lang,"Builder","Редактор страниц")}</p>
          <h1 className="text-3xl font-light" style={{ fontFamily: "serif" }}>{L(lang,"Page Builder","Редактор блоков")}</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Page selector */}
          <select value={page} onChange={e => setPage(e.target.value)}
            className="bg-black border border-white/10 text-zinc-400 font-mono text-[9px] uppercase tracking-wider px-3 py-2 outline-none hover:border-white/30 transition-colors">
            {PAGES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={save} disabled={saving}
            className={`text-[9px] tracking-[0.3em] uppercase font-mono px-6 py-2.5 transition-all
              ${saved ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"}`}>
            {saved ? L(lang,"✓ Saved","✓ Сохранено") : saving ? L(lang,"Saving…","Сохранение…") : L(lang,"Save Page","Сохранить")}
          </button>
        </div>
      </div>

      {error && <p className="text-[9px] font-mono text-red-700 mb-4 border border-red-900/30 px-4 py-2">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Blocks panel */}
        <div className="lg:col-span-2">
          <p className="text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-4">
            {L(lang,"Blocks","Блоки")} ({blocks.length})
          </p>
          {loading ? (
            <p className="text-zinc-700 text-xs font-mono">{L(lang,"Loading…","Загрузка…")}</p>
          ) : blocks.length === 0 ? (
            <div className="border border-dashed border-white/10 p-12 text-center">
              <p className="text-zinc-700 text-xs font-mono">{L(lang,"No blocks. Add one →","Блоков нет. Добавьте →")}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {blocks.map((block, i) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onChange={data => updateBlock(block.id, data)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, -1)}
                  onMoveDown={() => moveBlock(block.id, 1)}
                  canUp={i > 0}
                  canDown={i < blocks.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add blocks sidebar */}
        <div>
          <p className="text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-4">
            {L(lang,"Add Block","Добавить блок")}
          </p>
          <div className="space-y-1">
            {BLOCK_TYPES.map(bt => (
              <button key={bt.type} onClick={() => addBlock(bt.type)}
                className="w-full text-left px-4 py-3 border border-white/8 hover:border-white/30 text-[9px] font-mono tracking-wider uppercase text-zinc-500 hover:text-white transition-all group">
                <span className="mr-2 text-zinc-700 group-hover:text-zinc-500">+</span>
                {L(lang, bt.en, bt.ru)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
