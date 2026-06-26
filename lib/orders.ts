/**
 * RE:DISTRICT — Orders via Supabase
 * Prices stored in cents. Always divide by 100 for display.
 */

import { supabase } from "@/lib/supabase";
import type { SavedOrder } from "@/lib/types";

// ── DB row → SavedOrder ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(row: any): SavedOrder {
  return {
    id:               row.id,
    stripeSessionId:  row.stripe_session_id ?? "",
    status:           row.status ?? "checkout_created",
    createdAt:        row.created_at,

    items:            Array.isArray(row.items) ? row.items : [],

    // Prices stored in cents → keep as-is for the type,
    // but divide by 100 so UI always shows euros
    total:            (row.total ?? 0) / 100,
    shippingPrice:    (row.shipping_price ?? 0) / 100,
    grandTotal:       (row.grand_total ?? 0) / 100,

    customerName:     row.customer_name ?? "",
    customerEmail:    row.customer_email ?? "",
    customerPhone:    row.customer_phone ?? "",

    country:          row.country ?? "",
    city:             row.city ?? "",
    address:          row.address ?? "",

    shippingId:       row.shipping_id ?? "",
    deliveryMethod:   row.delivery_method ?? "home",

    pickupPointId:    row.pickup_point_id ?? undefined,
    pickupPointName:  row.pickup_point_name ?? undefined,
    pickupPointAddress: row.pickup_point_address ?? undefined,
  };
}

// ── SavedOrder → DB row ────────────────────────────────────────────────────

function orderToRow(order: SavedOrder) {
  return {
    id:                   order.id,
    stripe_session_id:    order.stripeSessionId,
    status:               order.status,
    created_at:           order.createdAt,

    items:                order.items,

    // Convert euros → cents for storage
    total:                Math.round(order.total * 100),
    shipping_price:       Math.round(order.shippingPrice * 100),
    grand_total:          Math.round(order.grandTotal * 100),

    customer_name:        order.customerName,
    customer_email:       order.customerEmail,
    customer_phone:       order.customerPhone,

    country:              order.country,
    city:                 order.city,
    address:              order.address,

    shipping_id:          order.shippingId,
    delivery_method:      order.deliveryMethod,

    pickup_point_id:      order.pickupPointId ?? null,
    pickup_point_name:    order.pickupPointName ?? null,
    pickup_point_address: order.pickupPointAddress ?? null,
  };
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function getOrders(): Promise<SavedOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders] getOrders error:", error.message);
    return [];
  }

  return (data ?? []).map(rowToOrder);
}

export async function getOrderById(id: string): Promise<SavedOrder | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToOrder(data);
}

export async function getOrderByStripeSession(sessionId: string): Promise<SavedOrder | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .single();

  if (error || !data) return null;
  return rowToOrder(data);
}

export async function saveOrder(order: SavedOrder): Promise<void> {
  const row = orderToRow(order);
  const { error } = await supabase
    .from("orders")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.error("[orders] saveOrder error:", error.message);
    throw new Error(`Failed to save order: ${error.message}`);
  }
}

export async function updateOrderStatus(
  id: string,
  status: SavedOrder["status"]
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[orders] updateOrderStatus error:", error.message);
    throw new Error(`Failed to update status: ${error.message}`);
  }
}
