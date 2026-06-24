import { NextRequest, NextResponse } from "next/server";

interface PickupPoint {
  id:      string;
  name:    string;
  address: string;
  country: string;
  city:    string;
}

function getString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function pick(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = getString(record[key]);
    if (value) return value;
  }
  return "";
}

function normalizePoint(value: unknown): PickupPoint | null {
  if (!value || typeof value !== "object") return null;
  const point = value as Record<string, unknown>;
  const id = pick(point, ["id", "branchId", "branchCode", "code"]);
  if (!id) return null;

  const name = pick(point, ["name", "place", "label", "title"]) || `Packeta ${id}`;
  const city = pick(point, ["city", "municipality"]);
  const zip = pick(point, ["zip", "postcode", "postalCode"]);
  const street = pick(point, ["street", "addressStreet", "address"]);
  const country = pick(point, ["country", "countryCode"]).toUpperCase();
  const address = [street, [zip, city].filter(Boolean).join(" "), country]
    .filter(Boolean)
    .join(", ");

  return { id, name, address: address || name, country, city };
}

function getPointList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["data", "branches", "items", "points"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.PACKETA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "PACKETA_API_KEY is not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const country = (searchParams.get("country") ?? "").trim().toUpperCase();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const lang = process.env.PACKETA_PICKUP_LANG ?? "en";
  const limit = Number(process.env.PACKETA_PICKUP_LIMIT ?? 30);
  const template = process.env.PACKETA_PICKUP_FEED_URL ??
    "https://pickup-point.api.packeta.com/v5/__API_KEY__/branch/json?lang=__LANGUAGE__";
  const url = template
    .replace("__API_KEY__", encodeURIComponent(apiKey))
    .replace("__LANGUAGE__", encodeURIComponent(lang));

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Packeta pickup feed failed" }, { status: res.status });
    }

    const payload = await res.json();
    const points = getPointList(payload)
      .map(normalizePoint)
      .filter((point): point is PickupPoint => {
        if (!point) return false;
        if (country && point.country && point.country !== country) return false;
        if (!query) return true;
        return `${point.name} ${point.address} ${point.city}`.toLowerCase().includes(query);
      })
      .slice(0, Number.isFinite(limit) && limit > 0 ? limit : 30);

    return NextResponse.json({ points }, { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Packeta pickup feed error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
