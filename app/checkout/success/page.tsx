import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-[9px] tracking-[0.45em] uppercase font-mono text-zinc-600 mb-8">RE:DISTRICT</p>
        <h1 className="font-light text-white mb-4"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
          Order placed.
        </h1>
        <p className="text-[10px] font-mono text-zinc-500 leading-relaxed mb-2">
          Thank you. Your order has been confirmed.
        </p>
        <p className="text-[10px] font-mono text-zinc-600 leading-relaxed mb-10">
          We&apos;ll send shipping details to your email. Ships via Packeta from Trenčín, Slovakia.
        </p>
        <Link href="/shop"
          className="text-[9px] tracking-[0.35em] uppercase font-mono border border-white/10 hover:border-white/40 text-zinc-500 hover:text-white px-8 py-3.5 transition-all">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
