import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-mono font-light text-white text-3xl mb-4">Cancelled.</h1>
        <p className="text-[10px] font-mono text-zinc-600 mb-8">Your order was not completed.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/checkout" className="text-[9px] tracking-[0.3em] uppercase font-mono bg-white text-black px-6 py-3 hover:bg-zinc-200 transition-colors">
            Try Again
          </Link>
          <Link href="/shop" className="text-[9px] tracking-[0.3em] uppercase font-mono border border-white/10 text-zinc-500 hover:text-white px-6 py-3 transition-colors">
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
