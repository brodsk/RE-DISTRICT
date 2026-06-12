"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getListings, deleteListing, Listing } from "@/lib/admin-store";

const catColor: Record<string, string> = {
  custom:   "text-white",
  restored: "text-zinc-400",
  curated:  "text-zinc-500",
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { setListings(getListings()); }, []);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    setTimeout(() => {
      deleteListing(id);
      setListings(getListings());
      setDeleting(null);
    }, 300);
  };

  return (
    <div className="pt-12">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 mb-2">Manage</p>
          <h1 className="text-3xl font-light text-white" style={{ fontFamily: "var(--font-display, serif)" }}>
            Listings
          </h1>
        </div>
        <Link
          href="/admin/listings/new"
          className="text-[9px] tracking-[0.3em] uppercase bg-white text-black
                     px-5 py-2.5 hover:bg-zinc-200 transition-colors"
        >
          + New
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="border border-white/5 p-16 text-center">
          <p className="text-zinc-700 font-light text-lg mb-2" style={{ fontFamily: "var(--font-display, serif)" }}>
            No listings yet.
          </p>
          <Link href="/admin/listings/new" className="text-[9px] tracking-[0.3em] uppercase text-zinc-600 hover:text-white transition-colors">
            Create your first →
          </Link>
        </div>
      ) : (
        <div className="border-t border-white/5">
          {listings.map(listing => (
            <div
              key={listing.id}
              className={`border-b border-white/5 py-5 flex items-center gap-6
                          transition-opacity duration-300 ${deleting === listing.id ? "opacity-30" : ""}`}
            >
              {/* Status dot */}
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${listing.sold ? "bg-zinc-700" : "bg-white/40"}`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm text-white font-light truncate">
                    {listing.brand} {listing.name}
                  </span>
                  {listing.featured && (
                    <span className="text-[7px] tracking-[0.3em] uppercase text-zinc-600 border border-white/10 px-1.5 py-0.5">
                      Featured
                    </span>
                  )}
                  {listing.sold && (
                    <span className="text-[7px] tracking-[0.3em] uppercase text-zinc-700 border border-white/5 px-1.5 py-0.5">
                      Sold
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[8px] tracking-[0.25em] uppercase ${catColor[listing.category]}`}>
                    {listing.category}
                  </span>
                  <span className="text-zinc-800">·</span>
                  <span className="text-[8px] font-mono text-zinc-600">{listing.year}</span>
                  <span className="text-zinc-800">·</span>
                  <span className="text-[8px] font-mono text-zinc-500 tabular-nums">
                    ${listing.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href={`/product/${listing.slug}`}
                  target="_blank"
                  className="text-[8px] tracking-[0.2em] uppercase text-zinc-700 hover:text-white transition-colors"
                >
                  View ↗
                </Link>
                <Link
                  href={`/admin/listings/${listing.id}`}
                  className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 hover:text-white transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(listing.id, `${listing.brand} ${listing.name}`)}
                  className="text-[8px] tracking-[0.2em] uppercase text-zinc-800 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
