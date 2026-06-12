"use client";
import { newListing } from "@/lib/admin-store";
import ListingForm from "@/components/admin/ListingForm";

export default function NewListingPage() {
  return (
    <div className="pt-12">
      <p className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 mb-2">Listings / New</p>
      <h1 className="text-3xl font-light text-white mb-12" style={{ fontFamily: "var(--font-display, serif)" }}>
        New Listing
      </h1>
      <ListingForm initial={newListing()} isNew />
    </div>
  );
}
