import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CheckoutItem, OrderData, SavedOrder } from "@/lib/types";
import { SHIPPING_OPTIONS } from "@/lib/shipping";
import { saveOrder } from "@/lib/orders";
import { sendOrderEmails } from "@/lib/email";

const BASE = "https://redistrict.watch";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");

  return new Stripe(key);
}

function parseDays(days: string): Stripe.ShippingRateCreateParams.DeliveryEstimate {
  const match = days.match(/(\d+)[–-](\d+)/);

  if (match) {
    return {
      minimum: { unit: "business_day", value: parseInt(match[1]) },
      maximum: { unit: "business_day", value: parseInt(match[2]) },
    };
  }

  return {
    minimum: { unit: "business_day", value: 3 },
    maximum: { unit: "business_day", value: 7 },
  };
}

function toStripeShippingOption(opt: typeof SHIPPING_OPTIONS[number]): Stripe.Checkout.SessionCreateParams.ShippingOption {
  return {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: {
        amount: Math.round(opt.price * 100),
        currency: "eur",
      },
      display_name: opt.label,
      delivery_estimate: parseDays(opt.days),
      metadata: {
        carrier: opt.carrier,
        country: opt.country,
        deliveryMethod: opt.deliveryMethod,
      },
    },
  };
}

type StripeCountry = Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;

const ALLOWED_COUNTRIES: StripeCountry[] = ["SK", "CZ", "PL", "DE", "AT", "HU"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: CheckoutItem[] = body.items;
    const orderData: Partial<OrderData> = body.orderData ?? {};

    if (!items?.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    const shipping = SHIPPING_OPTIONS.find(opt => opt.id === orderData.shippingId);

    if (!shipping) {
      return NextResponse.json({ error: "Invalid delivery method" }, { status: 400 });
    }

    if (shipping.deliveryMethod === "pickup" && !orderData.pickupPointId) {
      return NextResponse.json({ error: "Packeta pickup point is required" }, { status: 400 });
    }

    if (shipping.deliveryMethod === "home" && !orderData.address) {
      return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
    }

    const stripe = getStripe();

    const itemTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          // ❌ images УБРАНЫ НАМЕРЕННО — они ломали Stripe
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,

      shipping_options: [toStripeShippingOption(shipping)],

      ...(shipping.deliveryMethod === "home"
        ? {
            shipping_address_collection: {
              allowed_countries: ALLOWED_COUNTRIES,
            },
          }
        : {}),

      phone_number_collection: { enabled: true },

      ...(orderData.email ? { customer_email: orderData.email } : {}),

      success_url: `${BASE}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE}/checkout/cancel`,
      locale: "auto",

      metadata: {
        source: "redistrict-web",
        customer_name: orderData.name ?? "",
        customer_phone: orderData.phone ?? "",
        shippingId: shipping.id,
        deliveryMethod: shipping.deliveryMethod,
        country: orderData.country ?? shipping.country,
        city: orderData.city ?? "",
        address: orderData.address ?? "",
        pickupPointId: orderData.pickupPointId ?? "",
        pickupPointName: orderData.pickupPointName ?? "",
        pickupPointAddress: orderData.pickupPointAddress ?? "",
      },
    });

    if (!session.url) {
      throw new Error("Stripe session URL missing");
    }

    const order: SavedOrder = {
      id: `rd-order-${Date.now()}`,
      stripeSessionId: session.id,
      status: "checkout_created",
      createdAt: new Date().toISOString(),

      items,
      total: itemTotal,
      shippingPrice: shipping.price,
      grandTotal: itemTotal + shipping.price,

      customerName: orderData.name ?? "",
      customerEmail: orderData.email ?? "",
      customerPhone: orderData.phone ?? "",

      country: orderData.country ?? shipping.country,
      city: orderData.city ?? "",
      address: orderData.address ?? "",

      shippingId: shipping.id,
      deliveryMethod: shipping.deliveryMethod,

      pickupPointId: orderData.pickupPointId,
      pickupPointName: orderData.pickupPointName,
      pickupPointAddress: orderData.pickupPointAddress,
    };

    await saveOrder(order);

    sendOrderEmails(order).catch(err =>
      console.error("[checkout] Email error:", err)
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout error";
    console.error("[checkout]", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
