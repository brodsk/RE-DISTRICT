import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CheckoutItem } from "@/lib/types";

// Initialise Stripe — key comes from env variable set in Vercel dashboard
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

export async function POST(req: NextRequest) {
  try {
    const { items }: { items: CheckoutItem[] } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const stripe  = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100), // cents
        product_data: {
          name:   item.name,
          images: item.image ? [item.image] : [],
          metadata: { productId: item.productId },
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode:           "payment",
      line_items,
      success_url:    `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:     `${baseUrl}/checkout/cancel`,
      shipping_address_collection: { allowed_countries: ["US", "GB", "DE", "FR", "RU", "SK", "CZ", "PL", "NL"] },
      metadata:       { source: "redistrict-web" },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
