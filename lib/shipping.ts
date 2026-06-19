// lib/shipping.ts
// Extensible Packeta shipping configuration.
// To add a new country: add one entry to SHIPPING_OPTIONS and COUNTRIES.

import { ShippingOption } from "@/lib/types";

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id:      "packeta-sk",
    label:   "Packeta – Slovakia",
    country: "SK",
    price:   3.99,
    days:    "1–2 business days",
    carrier: "packeta",
  },
  {
    id:      "packeta-cz",
    label:   "Packeta – Czech Republic",
    country: "CZ",
    price:   4.99,
    days:    "2–3 business days",
    carrier: "packeta",
  },
  {
    id:      "packeta-pl",
    label:   "Packeta – Poland",
    country: "PL",
    price:   5.99,
    days:    "3–5 business days",
    carrier: "packeta",
  },
  {
    id:      "packeta-de",
    label:   "Packeta – Germany",
    country: "DE",
    price:   7.99,
    days:    "3–5 business days",
    carrier: "packeta",
  },
  {
    id:      "packeta-at",
    label:   "Packeta – Austria",
    country: "AT",
    price:   6.99,
    days:    "3–4 business days",
    carrier: "packeta",
  },
  {
    id:      "packeta-hu",
    label:   "Packeta – Hungary",
    country: "HU",
    price:   5.99,
    days:    "2–4 business days",
    carrier: "packeta",
  },
];

export const COUNTRIES = [
  { code: "SK", name: "Slovakia"       },
  { code: "CZ", name: "Czech Republic" },
  { code: "PL", name: "Poland"         },
  { code: "DE", name: "Germany"        },
  { code: "AT", name: "Austria"        },
  { code: "HU", name: "Hungary"        },
];

export function getShippingForCountry(countryCode: string): ShippingOption[] {
  return SHIPPING_OPTIONS.filter(o => o.country === countryCode);
}

/** All country codes supported by Packeta in this config */
export const PACKETA_COUNTRIES = COUNTRIES.map(c => c.code) as
  ("SK" | "CZ" | "PL" | "DE" | "AT" | "HU")[];
