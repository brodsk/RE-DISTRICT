// lib/shipping.ts
// Extensible Packeta shipping configuration.
// To add a new country: add one entry to SHIPPING_OPTIONS and COUNTRIES.

import { ShippingOption } from "@/lib/types";

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id:             "packeta-pickup-sk",
    label:          "Packeta Pickup Point",
    country:        "SK",
    price:          3.99,
    days:           "1–2 business days",
    carrier:        "packeta",
    deliveryMethod: "pickup",
  },
  {
    id:             "packeta-home-sk",
    label:          "Home Delivery",
    country:        "SK",
    price:          5.99,
    days:           "1–2 business days",
    carrier:        "packeta",
    deliveryMethod: "home",
  },
  {
    id:             "packeta-pickup-cz",
    label:          "Packeta Pickup Point",
    country:        "CZ",
    price:          4.99,
    days:           "2–3 business days",
    carrier:        "packeta",
    deliveryMethod: "pickup",
  },
  {
    id:             "packeta-home-cz",
    label:          "Home Delivery",
    country:        "CZ",
    price:          6.99,
    days:           "2–3 business days",
    carrier:        "packeta",
    deliveryMethod: "home",
  },
  {
    id:             "packeta-pickup-pl",
    label:          "Packeta Pickup Point",
    country:        "PL",
    price:          5.99,
    days:           "3–5 business days",
    carrier:        "packeta",
    deliveryMethod: "pickup",
  },
  {
    id:             "packeta-home-pl",
    label:          "Home Delivery",
    country:        "PL",
    price:          7.99,
    days:           "3–5 business days",
    carrier:        "packeta",
    deliveryMethod: "home",
  },
  {
    id:             "packeta-home-de",
    label:          "Home Delivery",
    country:        "DE",
    price:          7.99,
    days:           "3–5 business days",
    carrier:        "packeta",
    deliveryMethod: "home",
  },
  {
    id:             "packeta-home-at",
    label:          "Home Delivery",
    country:        "AT",
    price:          6.99,
    days:           "3–4 business days",
    carrier:        "packeta",
    deliveryMethod: "home",
  },
  {
    id:             "packeta-home-hu",
    label:          "Home Delivery",
    country:        "HU",
    price:          5.99,
    days:           "2–4 business days",
    carrier:        "packeta",
    deliveryMethod: "home",
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
