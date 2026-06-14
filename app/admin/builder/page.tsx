"use client";
import { useState, useEffect } from "react";
import { Block, BlockType, PageConfig, Product } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";

const BLOCK_TYPES: { type: BlockType; label: string; desc: string }[] = [
  { type: "hero",             label: "Hero",             desc: "Full-screen header with CTA"     },
  { type: "manifesto",        label: "Manifesto",        desc: "Brand text block"                },
  { type: "productGrid",      label: "Product Grid",     desc: "Grid of watches"                 },
  { type: "productHighlight", label: "Product Highlight",desc: "Single featured product"         },
  { type: "textBlock",        label: "Text Block",       desc: "Free text paragraph"             },
  { type: "cta",              label: "CTA",              desc: "Call to action button"           },
  { type: "gallery",          label: "Gallery",          desc: "Image grid"                      },
  { type: "process",          label: "Process",          desc: "Step-by-step process"            },
  { type: "collection",       label: "Collection",       desc: "Named product collection"        },
];

function defaultData(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "hero":             return { headline: "RE:DISTRICT", subline: "Rebuild your time.", cta: "Explore Watches", ctaHref: "/shop" };
    case "manifesto":        return { text: "We restore and modify Japanese digital watches." };
    case "productGrid":      return { title: "Current Selection", showAll: true };
    case "productHighlight": return { productId: "" };
    case "textBlock":        return { content: "Your text here." };
    case "cta":              return { text: "Explore Watches", href: "/shop", sub: "" };
    case "gallery":          return { images: [] };
    case "process":          return { steps: [{ number: "01", title: "Source", description: "We find the watch." }] };
    case "collection":       return { title: "Drop 001", subtitle: "", productIds: [] };
    default:                 return {};
  }
}

function newBlock(type: BlockType): Block {
  return {
    id:   crypto.randomUUID(),
    type,
    data: defaultData(type),
  } as Block;
}

// ── Block editor panels ───────────────────────────────────────────────────────

function HeroEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const inp = `w-full bg-transparent border border-white/10 focus:border-white/30 outline-none px-3 py-2.5 text-sm font-mono text-white placeholder:text-zinc-700 transition-colors`;
  return (
    <div className="space-y-3">
      {[
        { key: "headline", ph: "RE:DISTRICT" },
        { key: "subline",  ph: "Rebuild your time." },
        { key: "cta",      ph: "Explore Watches" },
        { key: "ctaHref",  ph: "/shop" },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1">{f.key}</label>
          <input className={inp} value={(data[f.key] as string) ?? ""} placeholder={f.ph}
            onChange={e => onChange({ ...data, [f.key]: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

function TextEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const inp = `w-full bg-transparent border border-white/10 focus:border-white/30 outline-none px-3 py-2.5 text-sm font-mono text-white resize-none transition-colors`;
  return (
    <div>
      <label className="block text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1">Content</label>
      <textarea className={inp} rows={5} value={(data.content as string) ?? ""}
        onChange={e => onChange({ ...data, content: e.target.value })} />
    </div>
  );
}

function ManifestoEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const inp = `w-full bg-transparent border border-white/10 focus:border-white/30 outline-none px-3 py-2.5 text-sm font-mono text-white resize-none transition-colors`;
  return (
    <div>
      <label className="block text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1">Text</label>
      <textarea className={inp} rows={4} value={(data.text as string) ?? ""}
        onChange={e => onChange({ ...data, text: e.target.value })} />
    </div>
  );
}

function CtaEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const inp = `w-full bg-transparent border border-white/10 focus:border-white/30 outline-none px-3 py-2.5 text-sm font-mono text-white transition-colors`;
  return (
    <div className="space-y-3">
      {[{ key: "text", ph: "Shop Now" }, { key: "href", ph: "/shop" }, { key: "sub", ph: "Subtitle (optional)" }].map(f => (
        <div key={f.key}>
          <label className="block text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1">{f.key}</label>
          <input className={inp} value={(data[f.key] as string) ?? ""} placeholder={f.ph}
            onChange={e => onChange({ ...data, [f.key]: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

function ProductGridEditor({ data, onChange, products }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; products: Product[] }) {
  const inp = `w-full bg-transparent border border-white/10 focus:border-white/30 outline-none px-3 py-2.5 text-sm font-mono text-white transition-colors`;
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1">Section title</label>
        <input className={inp} value={(data.title as string) ?? ""} placeholder="Current Selection"
          onChange={e => onChange({ ...data, title: e.target.value })} />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={!!(data.showAll)}
          onChange={e => onChange({ ...data, showAll: e.target.checked })} className="accent-white" />
        <span className="text-[9px] font-mono text-zinc-500 tracking-wider">Show all products</span>
      </label>
    </div>
  );
}

function GalleryEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const images = (data.images as string[]) ?? [];
  return (
    <div>
      <label className="block text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1">Image URLs (one per line)</label>
      <textarea
        className="w-full bg-transparent border border-white/10 focus:border-white/30 outline-none px-3 py-2.5 text-sm font-mono text-white resize-none transition-colors"
        rows={4}
        value={images.join("\n")}
        onChange={e => onChange({ ...data, images: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })}
      />
    </div>
  );
}

function BlockEditor({ block, products, onChange }: {
  block: Block; products: Product[];
  onChange: (data: Record<string, unknown>) => void;
}) {
  const data = block.data as Record<string, unknown>;
  switch (block.type) {
    case "hero":             return <HeroEditor data={data} onChange={onChange} />;
    case "manifesto":        return <ManifestoEditor data={data} onChange={onChange} />;
    case "textBlock":        return <TextEditor data={data} onChange={onChange} />;
    case "cta":              return <CtaEditor data={data} onChange={onChange} />;
    case "productGrid":      return <ProductGridEditor data={data} onChange={onChange} products={products} />;
    case "gallery":          return <GalleryEditor data={data} onChange={onChange} />;
    default:                 return <p className="text-xs font-mono text-zinc-600">No editor for this block type yet.</p>;
  }
}

// ── Main Page Builder ─────────────────────────────────────────────────────────

export default function PageBuilderPage() {
  const [page,     setPage]     = useState("home");
  const [blocks,   setBlocks]   = useState<Block[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addOpen,  setAddOpen]  = useState(false);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/pages?page=${page}`)
      .then(r => r.json())
      .then((cfg: PageConfig) => { setBlocks(cfg.blocks ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page]);

  const addBlock = (type: BlockType) => {
    const b = newBlock(type);
    setBlocks(prev => [...prev, b]);
    setExpanded(b.id);
    setAddOpen(false);
  };

  const removeBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks(prev => {
      const idx  = prev.findIndex(b => b.id === id);
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const updateBlockData = (id: string, data: Record<string, unknown>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, data } as Block : b));
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/pages", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": "redistrict2026" },
        body:    JSON.stringify({ page, config: { blocks } }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 mb-2">Admin</p>
          <h1 className="text-3xl font-light" style={{ fontFamily: "var(--font-display, serif)" }}>Page Builder</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Page selector */}
          <select value={page} onChange={e => setPage(e.target.value)}
            className="bg-black border border-white/10 text-[9px] font-mono text-zinc-400 px-3 py-2 outline-none">
            <option value="home">Home</option>
            <option value="shop">Shop</option>
          </select>
          {/* Save */}
          <button onClick={save} disabled={saving}
            className={`text-[9px] tracking-[0.3em] uppercase px-6 py-2.5 transition-all
              ${saved ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"}`}>
            {saved ? "✓ Saved" : saving ? "Saving…" : "Save Page"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-zinc-700 font-mono text-xs tracking-widest">Loading…</p>
      ) : (
        <div className="flex gap-8">

          {/* Block list */}
          <div className="flex-1 min-w-0">
            {blocks.length === 0 && (
              <div className="border border-dashed border-white/8 py-16 text-center mb-4">
                <p className="text-zinc-700 font-mono text-xs tracking-widest">No blocks. Add one below.</p>
              </div>
            )}

            <div className="space-y-2 mb-6">
              {blocks.map((block, i) => (
                <div key={block.id} className="border border-white/5 bg-black">
                  {/* Block header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Move buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={() => moveBlock(block.id, -1)}
                        className="text-zinc-700 hover:text-white text-xs leading-none transition-colors">▲</button>
                      <button onClick={() => moveBlock(block.id, 1)}
                        className="text-zinc-700 hover:text-white text-xs leading-none transition-colors">▼</button>
                    </div>

                    {/* Index */}
                    <span className="text-[9px] font-mono text-zinc-700 tabular-nums w-5">{String(i + 1).padStart(2,"0")}</span>

                    {/* Type */}
                    <button
                      onClick={() => setExpanded(expanded === block.id ? null : block.id)}
                      className="flex-1 text-left text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 hover:text-white transition-colors"
                    >
                      {block.type}
                    </button>

                    {/* Delete */}
                    <button onClick={() => removeBlock(block.id)}
                      className="text-[8px] font-mono text-zinc-700 hover:text-red-700 tracking-wider uppercase transition-colors shrink-0">
                      Remove
                    </button>
                  </div>

                  {/* Expanded editor */}
                  <AnimatePresence>
                    {expanded === block.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-white/5 px-4 py-4"
                      >
                        <BlockEditor
                          block={block}
                          products={products}
                          onChange={data => updateBlockData(block.id, data)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Add block */}
            <div className="relative">
              <button
                onClick={() => setAddOpen(!addOpen)}
                className="w-full border border-dashed border-white/10 hover:border-white/30 py-3
                           text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-600 hover:text-white
                           transition-all"
              >
                + Add Block
              </button>
              <AnimatePresence>
                {addOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 z-20 bg-black border border-white/10 mt-1"
                  >
                    {BLOCK_TYPES.map(bt => (
                      <button
                        key={bt.type}
                        onClick={() => addBlock(bt.type)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                      >
                        <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-zinc-400">{bt.label}</span>
                        <span className="text-[8px] font-mono text-zinc-700">{bt.desc}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar: legend */}
          <div className="hidden xl:block w-56 shrink-0">
            <p className="text-[8px] tracking-[0.3em] uppercase text-zinc-700 mb-4">Blocks</p>
            <div className="space-y-2">
              {BLOCK_TYPES.map(bt => (
                <div key={bt.type} className="border-b border-white/5 pb-2">
                  <p className="text-[8px] font-mono text-zinc-600 tracking-wider">{bt.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
