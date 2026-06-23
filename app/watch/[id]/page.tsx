"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "@/lib/types";
import Link from "next/link";

// ── QR via Google Charts ──────────────────────────────────────────────────────
function QRCode({ value, size = 100 }: { value: string; size?: number }) {
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(value)}&choe=UTF-8&chld=M|1`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="QR" width={size} height={size} className="block" />;
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  available: "border-white/40 text-white",
  reserved:  "border-amber-500/60 text-amber-400",
  sold:      "border-white/10 text-zinc-600",
  limited:   "border-white/30 text-zinc-300",
  concept:   "border-white/10 text-zinc-700",
};
const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  reserved:  "Reserved",
  sold:      "Sold",
  limited:   "Limited",
  concept:   "Concept",
};

// ── Grade badge ───────────────────────────────────────────────────────────────
const GRADE_DESC: Record<string, string> = {
  A: "Excellent condition — minimal signs of use",
  B: "Good condition — light wear consistent with age",
  C: "Collector condition — honest patina and character",
};

export default function WatchPassportPage() {
  const { id }  = useParams<{ id: string }>();
  const [p, setP]       = useState<Product | null>(null);
  const [loading, setL] = useState(true);
  const [imgIdx,  setImg] = useState(0);
  const [passUrl, setPassUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPassUrl(`${window.location.protocol}//${window.location.host}/watch/${id}`);
    }
    fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then((list: Product[]) => {
        // Match by rdWatchId or internal id
        const found = list.find(pr =>
          pr.rdWatchId === id ||
          pr.id === id ||
          pr.rdWatchId?.toLowerCase() === String(id).toLowerCase()
        );
        setP(found ?? null);
        setL(false);
      })
      .catch(() => setL(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-700 font-mono text-xs tracking-widest">Loading…</p>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[8px] font-mono tracking-[0.4em] uppercase text-zinc-700 mb-4">RE:DISTRICT</p>
          <p className="text-zinc-600 font-mono text-sm mb-6">Watch not found: {id}</p>
          <Link href="/shop" className="text-[9px] font-mono tracking-[0.3em] uppercase text-zinc-600 hover:text-white transition-colors">
            Browse Shop →
          </Link>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLE[p.status] ?? "border-white/10 text-zinc-500";
  const specs       = Object.entries(p.specifications).filter(([, v]) => v);

  return (
    <div className="min-h-screen bg-black">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10 max-w-screen-sm mx-auto px-6 pt-16 pb-24">

        {/* ── Header ── */}
        <div className="border-b border-white/5 pb-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[8px] font-mono tracking-[0.5em] uppercase text-zinc-600 mb-2">
                RE:DISTRICT / DIGITAL PASSPORT
              </p>
              <p className="text-[11px] font-mono text-zinc-400 tracking-widest">
                {p.rdWatchId ?? p.id}
              </p>
            </div>
            {/* Status */}
            <span className={`text-[8px] font-mono tracking-[0.3em] uppercase border px-2.5 py-1 shrink-0 ${statusStyle}`}>
              {STATUS_LABEL[p.status] ?? p.status}
            </span>
          </div>
        </div>

        {/* ── Images ── */}
        {p.images.length > 0 && (
          <div className="mb-8">
            <div className="aspect-square bg-zinc-950 overflow-hidden mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.images[imgIdx]}
                alt={`${p.brand} ${p.name}`}
                className="w-full h-full object-cover"
              />
            </div>
            {p.images.length > 1 && (
              <div className="flex gap-2">
                {p.images.map((img, i) => (
                  <button key={i} onClick={() => setImg(i)}
                    className={`w-12 h-12 overflow-hidden border transition-all ${
                      imgIdx === i ? "border-white/50" : "border-white/10 opacity-40 hover:opacity-70"
                    }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Identity ── */}
        <div className="mb-8">
          <p className="text-[8px] font-mono text-zinc-600 tracking-wider mb-1">{p.brand} · {p.year}</p>
          <h1 className="font-mono font-light text-white text-2xl mb-1" style={{ letterSpacing: "-0.01em" }}>
            {p.name}
          </h1>
          {p.tagline && (
            <p className="text-[10px] font-mono text-zinc-500 italic">{p.tagline}</p>
          )}
        </div>

        {/* ── Grade ── */}
        {p.grade && (
          <div className="border border-white/8 p-5 mb-6">
            <p className="text-[7px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-3">Grade</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-mono font-light text-white">{p.grade}</span>
              <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                {GRADE_DESC[p.grade]}
              </p>
            </div>
          </div>
        )}

        {/* ── Specifications ── */}
        {specs.length > 0 && (
          <div className="mb-6">
            <p className="text-[7px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-4">
              Specifications
            </p>
            <div className="divide-y divide-white/5">
              {/* Extra passport-specific fields first */}
              {p.module && (
                <div className="flex justify-between py-2.5">
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">Module</span>
                  <span className="text-[9px] font-mono text-zinc-300">{p.module}</span>
                </div>
              )}
              {p.movementType && (
                <div className="flex justify-between py-2.5">
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">Movement</span>
                  <span className="text-[9px] font-mono text-zinc-300">{p.movementType}</span>
                </div>
              )}
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5">
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider capitalize">{k}</span>
                  <span className="text-[9px] font-mono text-zinc-300 text-right max-w-[55%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Condition ── */}
        {p.condition && (p.condition.case || p.condition.glass || p.condition.strap) && (
          <div className="mb-6">
            <p className="text-[7px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-4">
              Condition Report
            </p>
            <div className="divide-y divide-white/5">
              {[
                { k: "Case",  v: p.condition.case  },
                { k: "Glass", v: p.condition.glass },
                { k: "Strap", v: p.condition.strap },
              ].filter(r => r.v).map(r => (
                <div key={r.k} className="flex justify-between py-2.5">
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">{r.k}</span>
                  <span className="text-[9px] font-mono text-zinc-300 text-right max-w-[60%]">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Service Summary ── */}
        {p.serviceSummary && (
          <div className="border-l-2 border-white/10 pl-4 mb-8">
            <p className="text-[7px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-2">
              Service Summary
            </p>
            <p className="text-[10px] font-mono text-zinc-400 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
              {p.serviceSummary}
            </p>
          </div>
        )}

        {/* ── Description ── */}
        {p.description && (
          <div className="mb-8">
            <p className="text-[7px] font-mono tracking-[0.4em] uppercase text-zinc-600 mb-3">About</p>
            <p className="text-[10px] font-mono text-zinc-400 leading-relaxed" style={{ whiteSpace: "pre-line" }}>
              {p.description}
            </p>
          </div>
        )}

        {/* ── QR + footer ── */}
        <div className="border-t border-white/5 pt-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-[7px] font-mono tracking-[0.4em] uppercase text-zinc-700 mb-1">
              RE:DISTRICT
            </p>
            <p className="text-[8px] font-mono text-zinc-700">
              Rebuild your time.
            </p>
            {p.status === "available" && (
              <Link
                href={`/product/${p.slug}`}
                className="mt-4 inline-block text-[9px] font-mono tracking-[0.3em] uppercase border border-white/20 hover:border-white/50 text-zinc-400 hover:text-white px-5 py-2.5 transition-all"
              >
                View in Shop →
              </Link>
            )}
          </div>
          {passUrl && (
            <div className="shrink-0">
              <QRCode value={passUrl} size={80} />
              <p className="text-[6px] font-mono text-zinc-800 text-center mt-1">
                {p.rdWatchId ?? p.id}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
