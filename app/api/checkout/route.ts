import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CheckoutItem } from "@/lib/types";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key);
}

const BASE = process.env.NEXT_PUBLIC_URL ?? "https://re-district.vercel.app";

// Packeta shipping — extensible: add more countries/carriers here
const SHIPPING_OPTIONS: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 399, currency: "eur" },
      display_name: "Packeta – Slovakia (1–2 business days)",
      delivery_estimate: {
        minimum: { unit: "business_day" as const, value: 1 },
        maximum: { unit: "business_day" as const, value: 2 },
      },
    },
  },
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 499, currency: "eur" },
      display_name: "Packeta – Czech Republic (2–3 business days)",
      delivery_estimate: {
        minimum: { unit: "business_day" as const, value: 2 },
        maximum: { unit: "business_day" as const, value: 3 },
      },
    },
  },
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 599, currency: "eur" },
      display_name: "Packeta – Poland (3–5 business days)",
      delivery_estimate: {
        minimum: { unit: "business_day" as const, value: 3 },
        maximum: { unit: "business_day" as const, value: 5 },
      },
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: CheckoutItem[] = body.items;
    const orderData = body.orderData as { name?: string; email?: string } | undefined;

    if (!items?.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const stripe = getStripe();

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode:       "payment",
      line_items,
      shipping_options: SHIPPING_OPTIONS,
      shipping_address_collection: {
        allowed_countries: ["SK", "CZ", "PL"],
      },
      phone_number_collection: { enabled: true },
      ...(orderData?.email ? { customer_email: orderData.email } : {}),
      success_url: `${BASE}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE}/checkout/cancel`,
      locale: "auto",
      metadata: {
        source:        "redistrict-web",
        customer_name: orderData?.name ?? "",
        origin:        "Trenčín, Slovakia",
      },
      custom_text: {
        submit: {
          message: "Ships via Packeta (Zásielkovňa) from Trenčín, Slovakia.",
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout error";
    console.error("[checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
