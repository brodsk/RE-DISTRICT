"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/lib/types";

// ── QR via Google Charts API ──────────────────────────────────────────────────
function QR({ value, size }: { value: string; size: number }) {
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(value)}&choe=UTF-8&chld=M|1`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="QR" width={size} height={size} style={{ display:"block", imageRendering:"pixelated" }} />;
}

// ── Shared constants ──────────────────────────────────────────────────────────
const MONO   = "ui-monospace, 'Courier New', monospace";
const BRAND  = "#000";
const LIGHT  = "#555";
const XLIGHT = "#999";

const STATUS_LABEL: Record<string, string> = {
  available: "AVAILABLE",
  reserved:  "RESERVED",
  sold:      "SOLD",
  limited:   "LIMITED",
  concept:   "CONCEPT",
};

function gradeDesc(g?: string) {
  return g === "A" ? "Excellent condition" : g === "B" ? "Good condition" : g === "C" ? "Collector condition" : "";
}

// ── Card FRONT (85×55mm) ─────────────────────────────────────────────────────
function CardFront({ p, passUrl }: { p: Product; passUrl: string }) {
  return (
    <div style={{
      width:"85mm", height:"55mm", background:"#fff", color:BRAND,
      border:"0.5pt solid #000", padding:"4mm 5mm",
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      fontFamily:MONO, boxSizing:"border-box", pageBreakInside:"avoid",
    }}>
      {/* Top */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:"10pt", fontWeight:"bold", letterSpacing:"0.08em" }}>RE:DISTRICT</div>
          <div style={{ fontSize:"7pt", color:LIGHT, marginTop:"0.5mm", letterSpacing:"0.03em" }}>
            {p.rdWatchId ?? p.id}
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          {p.grade && (
            <div style={{ fontSize:"14pt", fontWeight:"bold", lineHeight:1 }}>{p.grade}</div>
          )}
          <div style={{ fontSize:"6pt", color:LIGHT, marginTop:"0.5mm", textTransform:"uppercase" }}>
            {STATUS_LABEL[p.status] ?? p.status}
          </div>
        </div>
      </div>

      {/* Model */}
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"11pt", fontWeight:"bold", letterSpacing:"0.02em" }}>
          {p.brand} {p.name}
        </div>
        {p.tagline && (
          <div style={{ fontSize:"7pt", color:LIGHT, fontStyle:"italic", marginTop:"1mm" }}>
            {p.tagline}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:"6.5pt", color:LIGHT }}>{p.year} · {p.category}</div>
          <div style={{ fontSize:"8pt", fontWeight:"bold", marginTop:"0.5mm" }}>€{p.price}</div>
        </div>
        <QR value={passUrl} size={55} />
      </div>
    </div>
  );
}

// ── Card BACK (85×55mm) ──────────────────────────────────────────────────────
function CardBack({ p }: { p: Product }) {
  const specs = Object.entries(p.specifications).filter(([,v]) => v).slice(0, 5);
  return (
    <div style={{
      width:"85mm", height:"55mm", background:"#fff", color:BRAND,
      border:"0.5pt solid #000", padding:"4mm 5mm",
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      fontFamily:MONO, boxSizing:"border-box", pageBreakInside:"avoid",
    }}>
      {/* Grade + desc */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:"3mm" }}>
        {p.grade && (
          <div style={{ fontSize:"20pt", fontWeight:"bold", lineHeight:1, flexShrink:0 }}>
            {p.grade}
          </div>
        )}
        <div>
          {p.grade && (
            <div style={{ fontSize:"6.5pt", color:LIGHT, marginBottom:"1mm" }}>{gradeDesc(p.grade)}</div>
          )}
          {(p.module || p.movementType) && (
            <div style={{ fontSize:"6pt", color:XLIGHT }}>
              {[p.module, p.movementType].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      </div>

      {/* Specs */}
      <div style={{ borderTop:"0.5pt solid #eee", paddingTop:"2mm" }}>
        {specs.map(([k, v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:"5.5pt", marginBottom:"0.8mm" }}>
            <span style={{ color:XLIGHT, textTransform:"uppercase" }}>{k}</span>
            <span style={{ color:BRAND, maxWidth:"55%", textAlign:"right" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Service summary */}
      {p.serviceSummary && (
        <div style={{ borderTop:"0.5pt solid #eee", paddingTop:"2mm" }}>
          <div style={{ fontSize:"5pt", color:XLIGHT, textTransform:"uppercase", marginBottom:"0.5mm" }}>
            Service
          </div>
          <div style={{ fontSize:"5.5pt", color:LIGHT, lineHeight:1.4 }}>
            {p.serviceSummary.slice(0, 150)}{p.serviceSummary.length > 150 ? "…" : ""}
          </div>
        </div>
      )}

      <div style={{ fontSize:"5pt", color:XLIGHT, textAlign:"right" }}>redistrict.studio</div>
    </div>
  );
}

// ── Label (configurable size, default 50×25mm) ────────────────────────────────
function WatchLabel({ p, passUrl, w = 50, h = 25 }: { p: Product; passUrl: string; w?: number; h?: number }) {
  return (
    <div style={{
      width:`${w}mm`, height:`${h}mm`, background:"#fff", color:BRAND,
      border:"0.5pt solid #000", padding:"2mm 3mm",
      display:"flex", alignItems:"center", justifyContent:"space-between", gap:"2mm",
      fontFamily:MONO, boxSizing:"border-box", pageBreakInside:"avoid",
    }}>
      <div style={{ flex:1, overflow:"hidden" }}>
        <div style={{ fontSize:"8pt", fontWeight:"bold", letterSpacing:"0.03em" }}>
          {p.rdWatchId ?? p.id}
        </div>
        <div style={{ fontSize:"6pt", color:LIGHT, marginTop:"0.5mm" }}>
          {p.brand} {p.name}
        </div>
        {p.grade && (
          <div style={{ fontSize:"7pt", fontWeight:"bold", marginTop:"1mm" }}>
            Grade {p.grade}
          </div>
        )}
        <div style={{ fontSize:"5.5pt", color:XLIGHT, marginTop:"0.5mm", textTransform:"uppercase" }}>
          {STATUS_LABEL[p.status] ?? p.status}
        </div>
      </div>
      <QR value={passUrl} size={Math.min(h * 3 - 6, 60)} />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
type PrintMode = "card" | "label" | "both";

function PrintContent() {
  const sp          = useSearchParams();
  const productId   = sp.get("id");
  const mode        = (sp.get("type") ?? "both") as PrintMode;
  const labelW      = parseInt(sp.get("lw") ?? "50");
  const labelH      = parseInt(sp.get("lh") ?? "25");

  const [p,  setP]   = useState<Product | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const base = `${window.location.protocol}//${window.location.host}`;
      setUrl(`${base}/watch/${productId}`);
    }
    if (!productId) return;
    fetch(`/api/products?t=${Date.now()}`, { cache:"no-store" })
      .then(r => r.json())
      .then((list: Product[]) => {
        setP(list.find(pr => pr.id === productId || pr.rdWatchId === productId) ?? null);
      });
  }, [productId]);

  if (!productId) {
    return <div style={{ padding:"20mm", fontFamily:MONO }}>No product ID. Add ?id=&lt;id&gt; to URL.</div>;
  }
  if (!p) {
    return <div style={{ padding:"20mm", fontFamily:MONO }}>Loading…</div>;
  }

  const showCard  = mode === "card"  || mode === "both";
  const showLabel = mode === "label" || mode === "both";

  return (
    <>
      <style>{`
        @page { margin: 10mm; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: #fff; }
        }
        @media screen {
          body { background: #f5f5f5; padding: 20px; }
          .print-item { margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.15); display: inline-block; }
        }
      `}</style>

      {/* Screen toolbar */}
      <div className="no-print" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background:"#111", color:"#fff", fontFamily:MONO,
        padding:"10px 16px", display:"flex", alignItems:"center", gap:"12px", fontSize:"11px",
      }}>
        <span style={{ opacity:0.5 }}>RE:DISTRICT / PRINT</span>
        <strong>{p.rdWatchId ?? p.id}</strong>
        <span style={{ opacity:0.5 }}>·</span>
        <strong>{p.brand} {p.name}</strong>
        <span style={{ marginLeft:"auto", display:"flex", gap:"8px" }}>
          {(["card","label","both"] as PrintMode[]).map(m => (
            <a key={m} href={`?id=${productId}&type=${m}`}
              style={{
                color: mode === m ? "#fff" : "#666",
                textDecoration:"none", border:`1px solid ${mode === m ? "#666" : "#333"}`,
                padding:"3px 10px", textTransform:"uppercase", fontSize:"10px",
              }}>
              {m}
            </a>
          ))}
          <span style={{ width:1, background:"#333", margin:"0 4px" }} />
          <button onClick={() => window.print()}
            style={{ background:"#fff", color:"#000", border:"none", padding:"3px 12px", cursor:"pointer", fontFamily:MONO, fontWeight:"bold" }}>
            Print ⌘P
          </button>
          <a href={`/admin/products/${p.id}`}
            style={{ color:"#666", textDecoration:"none", border:"1px solid #333", padding:"3px 10px" }}>
            ← Edit
          </a>
          <a href={`/watch/${p.rdWatchId ?? p.id}`} target="_blank"
            style={{ color:"#666", textDecoration:"none", border:"1px solid #333", padding:"3px 10px" }}>
            Passport ↗
          </a>
        </span>
      </div>

      {/* Print content */}
      <div style={{ paddingTop: "56px" }}>
        {showCard && (
          <div style={{ marginBottom:"24px" }}>
            <div className="no-print" style={{ fontFamily:MONO, fontSize:"9px", color:"#999", textTransform:"uppercase", marginBottom:"8px", paddingLeft:"2px" }}>
              Card — Front (85×55mm)
            </div>
            <div className="print-item"><CardFront p={p} passUrl={url} /></div>
          </div>
        )}
        {showCard && (
          <div style={{ marginBottom:"24px" }}>
            <div className="no-print" style={{ fontFamily:MONO, fontSize:"9px", color:"#999", textTransform:"uppercase", marginBottom:"8px", paddingLeft:"2px" }}>
              Card — Back (85×55mm)
            </div>
            <div className="print-item"><CardBack p={p} /></div>
          </div>
        )}
        {showLabel && (
          <div style={{ marginBottom:"16px" }}>
            <div className="no-print" style={{ fontFamily:MONO, fontSize:"9px", color:"#999", textTransform:"uppercase", marginBottom:"8px", paddingLeft:"2px" }}>
              Label ({labelW}×{labelH}mm) — adjust via ?lw=50&lh=25
            </div>
            <div className="print-item"><WatchLabel p={p} passUrl={url} w={labelW} h={labelH} /></div>
          </div>
        )}
      </div>
    </>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div style={{ padding:"20mm", fontFamily:"monospace" }}>Loading…</div>}>
      <PrintContent />
    </Suspense>
  );
}
