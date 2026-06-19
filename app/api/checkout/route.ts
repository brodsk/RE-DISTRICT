import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CheckoutItem } from "@/lib/types";
import { SHIPPING_OPTIONS } from "@/lib/shipping";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set — add it to Vercel environment variables");
  return new Stripe(key);
}

const BASE = process.env.NEXT_PUBLIC_URL ?? "https://re-district.vercel.app";

// Build Stripe shipping options from the shared shipping config.
// To add a new country: update lib/shipping.ts only.
const STRIPE_SHIPPING: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
  SHIPPING_OPTIONS.map(opt => ({
    shipping_rate_data: {
      type: "fixed_amount" as const,
      fixed_amount: { amount: Math.round(opt.price * 100), currency: "eur" },
      display_name: opt.label,
      delivery_estimate: parseDays(opt.days),
      metadata: { carrier: opt.carrier, country: opt.country },
    },
  }));

function parseDays(days: string): Stripe.ShippingRateCreateParams.DeliveryEstimate {
  // "1–2 business days" → min: 1, max: 2
  const match = days.match(/(\d+)[–-](\d+)/);
  if (match) {
    return {
      minimum: { unit: "business_day", value: parseInt(match[1]) },
      maximum: { unit: "business_day", value: parseInt(match[2]) },
    };
  }
  return { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "business_day", value: 7 } };
}

// All supported Stripe allowed_countries values
type StripeCountry = Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;
const ALLOWED_COUNTRIES: StripeCountry[] = ["SK", "CZ", "PL", "DE", "AT", "HU"];

export async function POST(req: NextRequest) {
  try {
    const body      = await req.json();
    const items: CheckoutItem[]                          = body.items;
    const orderData: { name?: string; email?: string } = body.orderData ?? {};

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
      shipping_options:            STRIPE_SHIPPING,
      shipping_address_collection: { allowed_countries: ALLOWED_COUNTRIES },
      phone_number_collection:     { enabled: true },
      ...(orderData.email ? { customer_email: orderData.email } : {}),
      success_url: `${BASE}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE}/checkout/cancel`,
      locale:      "auto",
      metadata: {
        source:        "redistrict-web",
        customer_name: orderData.name ?? "",
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
