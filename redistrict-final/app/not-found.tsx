import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-700 font-mono mb-6">
          404
        </p>
        <h1 className="font-display text-7xl md:text-9xl font-light text-white mb-4">
          Lost.
        </h1>
        <p className="text-sm text-zinc-500 mb-10 font-display italic text-xl">
          This page doesn't exist — yet.
        </p>
        <Link
          href="/"
          className="text-xs tracking-[0.3em] uppercase border border-white/20 hover:border-white hover:bg-white hover:text-black text-white px-8 py-4 transition-all duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
