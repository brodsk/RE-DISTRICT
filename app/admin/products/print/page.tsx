"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Product } from "@/lib/types";

// ── QR code via Google Charts API (no extra package needed) ───────────────────
function QRCode({ value, size = 80 }: { value: string; size?: number }) {
  const url = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(value)}&choe=UTF-8`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="QR" width={size} height={size} style={{ imageRendering: "pixelated" }} />;
}

// ── Grade from status ─────────────────────────────────────────────────────────
function grade(p: Product): string {
  const map: Record<string, string> = {
    available: "A",
    limited:   "B",
    sold:      "S",
    concept:   "C",
  };
  return map[p.status] ?? "?";
}

// ── Print CARD (85×55mm) ──────────────────────────────────────────────────────
function WatchCard({ p, baseUrl }: { p: Product; baseUrl: string }) {
  const qrUrl = `${baseUrl}/watch/${p.rdWatchId ?? p.id}`;
  const specs  = Object.entries(p.specifications).slice(0, 4);

  return (
    <div className="watch-card" style={{
      width: "85mm", height: "55mm",
      border: "1px solid #000",
      padding: "4mm",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      fontFamily: "monospace",
      fontSize: "7pt",
      boxSizing: "border-box",
      background: "#fff",
      color: "#000",
      pageBreakInside: "avoid",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11pt", fontWeight: "bold", letterSpacing: "0.05em" }}>RE:DISTRICT</div>
          <div style={{ fontSize: "8pt", marginTop: "1mm" }}>{p.brand} {p.name}</div>
          {p.tagline && <div style={{ fontSize: "6pt", color: "#555", fontStyle: "italic" }}>{p.tagline}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "9pt", fontWeight: "bold" }}>{p.rdWatchId ?? p.id}</div>
          <div style={{ fontSize: "7pt", color: "#555" }}>{p.category.toUpperCase()}</div>
          <div style={{ fontSize: "8pt", fontWeight: "bold", marginTop: "1mm" }}>Grade {grade(p)}</div>
        </div>
      </div>

      {/* Specs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1mm 4mm", margin: "2mm 0" }}>
        {specs.map(([k, v]) => (
          <div key={k}>
            <span style={{ color: "#888", fontSize: "5.5pt", textTransform: "uppercase" }}>{k}: </span>
            <span style={{ fontSize: "6pt" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "6pt", color: "#888" }}>Service: Ready for sale</div>
          <div style={{ fontSize: "6pt", color: "#888" }}>{p.year} · €{p.price}</div>
          <div style={{ fontSize: "5pt", color: "#aaa", marginTop: "1mm" }}>redistrict.studio</div>
        </div>
        <QRCode value={qrUrl} size={60} />
      </div>
    </div>
  );
}

// ── Print LABEL (case sticker, ~50×25mm) ─────────────────────────────────────
function WatchLabel({ p, baseUrl }: { p: Product; baseUrl: string }) {
  const qrUrl = `${baseUrl}/watch/${p.rdWatchId ?? p.id}`;
  return (
    <div className="watch-label" style={{
      width: "50mm", height: "25mm",
      border: "1px solid #000",
      padding: "2mm 3mm",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "monospace",
      fontSize: "6pt",
      boxSizing: "border-box",
      background: "#fff",
      color: "#000",
      pageBreakInside: "avoid",
    }}>
      <div>
        <div style={{ fontWeight: "bold", fontSize: "7.5pt" }}>{p.rdWatchId ?? p.id}</div>
        <div style={{ marginTop: "1mm" }}>{p.brand} {p.name}</div>
        <div style={{ color: "#555", marginTop: "0.5mm" }}>Grade {grade(p)}</div>
      </div>
      <QRCode value={qrUrl} size={50} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function PrintContent() {
  const sp        = useSearchParams();
  const id        = sp.get("id");
  const type      = sp.get("type") ?? "card"; // "card" | "label" | "both"
  const [p, setP] = useState<Product | null>(null);
  const printRef  = useRef<HTMLDivElement>(null);

  const baseUrl = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "https://re-district.vercel.app";

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" })
      .then(r => r.json())
      .then((list: Product[]) => {
        const found = list.find(pr => pr.id === id || pr.rdWatchId === id);
        setP(found ?? null);
      });
  }, [id]);

  const handlePrint = () => window.print();

  if (!p) return (
    <div style={{ padding: "20mm", fontFamily: "monospace" }}>
      {id ? "Product not found." : "No product ID specified. Add ?id=<product-id> to the URL."}
    </div>
  );

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: #fff; }
          .print-area { padding: 10mm; }
          .watch-card, .watch-label { margin-bottom: 5mm; }
        }
        @media screen {
          body { background: #f3f3f3; }
          .print-area { padding: 20px; }
          .watch-card, .watch-label { margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        }
      `}</style>

      {/* Screen controls */}
      <div className="no-print" style={{ padding: "16px 20px", background: "#111", color: "#fff", display: "flex", gap: "12px", alignItems: "center", fontFamily: "monospace", fontSize: "12px" }}>
        <span style={{ opacity: 0.5 }}>RE:DISTRICT / PRINT /</span>
        <strong>{p.rdWatchId ?? p.id}</strong>
        <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <a href={`/admin/products/${p.id}`}
            style={{ color: "#aaa", textDecoration: "none", border: "1px solid #444", padding: "4px 10px" }}>
            ← Edit
          </a>
          <button onClick={handlePrint}
            style={{ background: "#fff", color: "#000", border: "none", padding: "4px 14px", cursor: "pointer", fontFamily: "monospace", fontSize: "11px", fontWeight: "bold" }}>
            Print ⌘P
          </button>
        </span>
      </div>

      <div ref={printRef} className="print-area">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {(type === "card" || type === "both") && <WatchCard p={p} baseUrl={baseUrl} />}
          {(type === "label" || type === "both") && <WatchLabel p={p} baseUrl={baseUrl} />}
          {type === "both" && (
            <>
              <WatchCard p={p} baseUrl={baseUrl} />
              <WatchLabel p={p} baseUrl={baseUrl} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: "20mm", fontFamily: "monospace" }}>Loading…</div>}>
      <PrintContent />
    </Suspense>
  );
}
