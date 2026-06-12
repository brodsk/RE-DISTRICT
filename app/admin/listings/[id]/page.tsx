"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getListing, Listing } from "@/lib/admin-store";
import ListingForm from "@/components/admin/ListingForm";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [ready, setReady]     = useState(false);

  useEffect(() => {
    setListing(getListing(id));
    setReady(true);
  }, [id]);

  if (!ready) return <div className="pt-12 text-zinc-700 font-mono text-xs">Loading…</div>;

  if (!listing) return (
    <div className="pt-12">
      <p className="text-zinc-700 font-mono text-sm">Listing not found.</p>
    </div>
  );

  return (
    <div className="pt-12">
      <p className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 mb-2">
        Listings / Edit
      </p>
      <h1 className="text-3xl font-light text-white mb-12" style={{ fontFamily: "var(--font-display, serif)" }}>
        {listing.brand} {listing.name}
      </h1>
      <ListingForm initial={listing} />
    </div>
  );
}
