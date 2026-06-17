// lib/shipping.ts
import { ShippingOption } from "@/lib/types";

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id:      "packeta-sk",
    label:   "Packeta (Zásielkovňa) – Slovakia",
    country: "SK",
    price:   3.99,
    days:    "1–2 business days",
    carrier: "packeta",
  },
  {
    id:      "packeta-cz",
    label:   "Packeta (Zásilkovna) – Czech Republic",
    country: "CZ",
    price:   4.99,
    days:    "2–3 business days",
    carrier: "packeta",
  },
  {
    id:      "packeta-pl",
    label:   "Packeta (InPost) – Poland",
    country: "PL",
    price:   5.99,
    days:    "3–5 business days",
    carrier: "packeta",
  },
];

export const COUNTRIES = [
  { code: "SK", name: "Slovakia" },
  { code: "CZ", name: "Czech Republic" },
  { code: "PL", name: "Poland" },
];

export function getShippingForCountry(countryCode: string): ShippingOption[] {
  return SHIPPING_OPTIONS.filter(o => o.country === countryCode);
}
