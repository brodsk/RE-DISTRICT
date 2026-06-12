"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getListings, Listing } from "@/lib/admin-store";

export default function AdminDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    setListings(getListings());
  }, []);

  const stats = {
    total:    listings.length,
    active:   listings.filter(l => !l.sold).length,
    sold:     listings.filter(l => l.sold).length,
    featured: listings.filter(l => l.featured).length,
    custom:   listings.filter(l => l.category === "custom").length,
    restored: listings.filter(l => l.category === "restored").length,
    curated:  listings.filter(l => l.category === "curated").length,
  };

  return (
    <div className="pt-12">
      <p className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 mb-2">Overview</p>
      <h1 className="text-3xl font-light text-white mb-12" style={{ fontFamily: "var(--font-display, serif)" }}>
        Dashboard
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 mb-16">
        {[
          { label: "Total",    value: stats.total    },
          { label: "Active",   value: stats.active   },
          { label: "Sold",     value: stats.sold     },
          { label: "Featured", value: stats.featured },
        ].map(stat => (
          <div key={stat.label} className="bg-black p-6 md:p-8">
            <p className="text-[8px] tracking-[0.35em] uppercase text-zinc-600 mb-3">{stat.label}</p>
            <p className="text-4xl font-light text-white tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="border-t border-white/5 pt-8 mb-12">
        <p className="text-[9px] tracking-[0.3em] uppercase text-zinc-600 mb-6">By Category</p>
        <div className="flex gap-8">
          {[
            { label: "Custom",   value: stats.custom   },
            { label: "Restored", value: stats.restored },
            { label: "Curated",  value: stats.curated  },
          ].map(c => (
            <div key={c.label}>
              <p className="text-[8px] tracking-[0.3em] uppercase text-zinc-700 mb-1">{c.label}</p>
              <p className="text-2xl font-light text-zinc-300 tabular-nums">{c.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-4">
        <Link
          href="/admin/listings/new"
          className="text-[9px] tracking-[0.3em] uppercase bg-white text-black
                     px-6 py-3 hover:bg-zinc-200 transition-colors"
        >
          + New Listing
        </Link>
        <Link
          href="/admin/listings"
          className="text-[9px] tracking-[0.3em] uppercase border border-white/10
                     text-zinc-400 hover:text-white hover:border-white/30
                     px-6 py-3 transition-all"
        >
          View All
        </Link>
        <Link
          href="/shop"
          target="_blank"
          className="text-[9px] tracking-[0.3em] uppercase border border-white/10
                     text-zinc-400 hover:text-white hover:border-white/30
                     px-6 py-3 transition-all"
        >
          View Shop ↗
        </Link>
      </div>
    </div>
  );
}
