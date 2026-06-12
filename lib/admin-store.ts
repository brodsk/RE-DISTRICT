// lib/admin-store.ts
// Simple client-side store using localStorage for the admin panel.
// In production this would connect to a real database/API.

export type WatchCategory = "custom" | "restored" | "curated";
export type WatchCondition = "mint" | "excellent" | "good" | "fair";

export interface Listing {
  id:          string;
  name:        string;
  brand:       string;
  year:        number;
  price:       number;
  category:    WatchCategory;
  condition:   WatchCondition;
  slug:        string;
  tagline:     string;
  description: string;
  story:       string;
  restorationNotes:    string;
  customModifications: string;
  images:      string[];   // URLs
  featured:    boolean;
  sold:        boolean;
  createdAt:   string;     // ISO string
  updatedAt:   string;
}

const STORAGE_KEY = "redistrict_listings";

export function getListings(): Listing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveListing(listing: Listing): void {
  const list = getListings();
  const idx  = list.findIndex(l => l.id === listing.id);
  if (idx >= 0) list[idx] = listing;
  else          list.unshift(listing);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function deleteListing(id: string): void {
  const list = getListings().filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getListing(id: string): Listing | null {
  return getListings().find(l => l.id === id) ?? null;
}

export function newListing(): Listing {
  return {
    id:                  crypto.randomUUID(),
    name:                "",
    brand:               "",
    year:                new Date().getFullYear(),
    price:               0,
    category:            "curated",
    condition:           "excellent",
    slug:                "",
    tagline:             "",
    description:         "",
    story:               "",
    restorationNotes:    "",
    customModifications: "",
    images:              [],
    featured:            false,
    sold:                false,
    createdAt:           new Date().toISOString(),
    updatedAt:           new Date().toISOString(),
  };
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Simple password check — replace with real auth in production
const ADMIN_PASSWORD = "redistrict2026";

export function checkPassword(pw: string): boolean {
  return pw === ADMIN_PASSWORD;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("rd_admin") === "1";
}

export function setAuthenticated(): void {
  sessionStorage.setItem("rd_admin", "1");
}

export function logout(): void {
  sessionStorage.removeItem("rd_admin");
}
