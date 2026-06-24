/**
 * lib/email.ts
 * Email notifications via Outlook SMTP (smtp-mail.outlook.com:587 / STARTTLS)
 *
 * Required environment variables (set in Vercel):
 *   EMAIL_USER      — RE.DISTRICT@outlook.com
 *   EMAIL_PASS      — Outlook app password or account password
 *
 * Optional overrides:
 *   EMAIL_FROM      — defaults to EMAIL_USER
 *   EMAIL_ADMIN_TO  — defaults to EMAIL_USER (admin inbox)
 *   SMTP_HOST       — defaults to smtp-mail.outlook.com
 *   SMTP_PORT       — defaults to 587
 */

import nodemailer from "nodemailer";
import type { SavedOrder } from "@/lib/types";

// ── Transport ─────────────────────────────────────────────────────────────────

function createTransport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "EMAIL_USER and EMAIL_PASS must be set in environment variables. " +
      "Add them to Vercel Dashboard → Settings → Environment Variables."
    );
  }

  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? "smtp-mail.outlook.com",
    port:   parseInt(process.env.SMTP_PORT ?? "587"),
    secure: false,          // STARTTLS on port 587
    auth:   { user, pass },
    tls:    { ciphers: "SSLv3" }, // required for Outlook
  });
}

// ── Shared email config ───────────────────────────────────────────────────────

function from() {
  const addr = process.env.EMAIL_FROM ?? process.env.EMAIL_USER ?? "RE.DISTRICT@outlook.com";
  return `RE:DISTRICT <${addr}>`;
}

function adminTo() {
  return process.env.EMAIL_ADMIN_TO ?? process.env.EMAIL_USER ?? "RE.DISTRICT@outlook.com";
}

// ── Shared CSS for HTML emails ─────────────────────────────────────────────────
const CSS = `
  body { margin:0; padding:0; background:#000; color:#fff; font-family: ui-monospace,'Courier New',monospace; }
  .wrap { max-width:520px; margin:0 auto; padding:32px 24px; }
  .brand { font-size:13px; letter-spacing:0.2em; text-transform:uppercase; color:#fff; margin-bottom:24px; }
  .brand span { opacity:0.4; }
  h1 { font-size:22px; font-weight:300; letter-spacing:-0.01em; color:#fff; margin:0 0 24px; }
  .divider { border:none; border-top:1px solid rgba(255,255,255,0.08); margin:20px 0; }
  .label { font-size:9px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:4px; }
  .value { font-size:11px; color:#fff; margin-bottom:14px; }
  .table { width:100%; border-collapse:collapse; margin:16px 0; }
  .table th { font-size:8px; letter-spacing:0.25em; text-transform:uppercase; color:rgba(255,255,255,0.4); text-align:left; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .table td { font-size:11px; color:#fff; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:top; }
  .table .price { text-align:right; font-variant-numeric:tabular-nums; }
  .total-row td { border-top:1px solid rgba(255,255,255,0.12); border-bottom:none; padding-top:14px; font-size:13px; }
  .badge { display:inline-block; font-size:8px; letter-spacing:0.25em; text-transform:uppercase; border:1px solid rgba(255,255,255,0.2); padding:3px 8px; color:rgba(255,255,255,0.6); }
  .footer { margin-top:40px; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.2); }
`;

// ── Formatters ────────────────────────────────────────────────────────────────

function deliveryBlock(order: SavedOrder): string {
  if (order.deliveryMethod === "pickup") {
    return `
      <div class="label">Delivery Method</div>
      <div class="value">Packeta Pickup Point</div>
      <div class="label">Pickup Point</div>
      <div class="value">${order.pickupPointName ?? "—"}</div>
      <div class="label">Pickup Address</div>
      <div class="value">${order.pickupPointAddress ?? "—"}</div>
      <div class="label">Packeta Point ID</div>
      <div class="value">${order.pickupPointId ?? "—"}</div>
    `;
  }
  return `
    <div class="label">Delivery Method</div>
    <div class="value">Home Delivery (Packeta)</div>
    <div class="label">Delivery Address</div>
    <div class="value">${[order.address, order.city, order.country].filter(Boolean).join(", ")}</div>
  `;
}

function itemsTable(order: SavedOrder): string {
  const rows = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center;color:rgba(255,255,255,0.5)">×${item.quantity}</td>
      <td class="price">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Price</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr>
          <td style="color:rgba(255,255,255,0.4);font-size:10px">Shipping</td>
          <td></td>
          <td class="price" style="color:rgba(255,255,255,0.4)">€${order.shippingPrice.toFixed(2)}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td>Total</td>
          <td></td>
          <td class="price">€${order.grandTotal.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

// ── Customer email ─────────────────────────────────────────────────────────────

function customerHtml(order: SavedOrder): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="wrap">
    <div class="brand">RE<span>:</span>DISTRICT</div>
    <h1>Order confirmed.</h1>

    <div class="label">Order ID</div>
    <div class="value">${order.id}</div>

    <div class="label">Status</div>
    <div class="value"><span class="badge">Confirmed</span></div>

    <hr class="divider">

    ${itemsTable(order)}

    <hr class="divider">

    ${deliveryBlock(order)}

    <hr class="divider">

    <div class="label">Customer</div>
    <div class="value">${order.customerName}</div>
    <div class="label">Phone</div>
    <div class="value">${order.customerPhone || "—"}</div>

    <hr class="divider">

    <div class="value" style="color:rgba(255,255,255,0.4);font-size:10px;line-height:1.6">
      We'll send tracking information once your order is dispatched.<br>
      Ships via Packeta from Trenčín, Slovakia.<br><br>
      Questions? Reply to this email or contact us on Instagram @re.district
    </div>

    <div class="footer">RE:DISTRICT · Rebuild your time. · redistrict.studio</div>
  </div>
  </body></html>`;
}

function customerText(order: SavedOrder): string {
  const delivery = order.deliveryMethod === "pickup"
    ? `Pickup Point: ${order.pickupPointName ?? "—"}\nAddress: ${order.pickupPointAddress ?? "—"}\nPoint ID: ${order.pickupPointId ?? "—"}`
    : `Home Delivery\nAddress: ${[order.address, order.city, order.country].filter(Boolean).join(", ")}`;

  const items = order.items.map(i => `  ${i.name} ×${i.quantity}  €${(i.price * i.quantity).toFixed(2)}`).join("\n");

  return `RE:DISTRICT — Order Confirmed

Order ID: ${order.id}

PRODUCTS
${items}
  Shipping: €${order.shippingPrice.toFixed(2)}
  ─────────
  Total: €${order.grandTotal.toFixed(2)}

DELIVERY
${delivery}

CUSTOMER
${order.customerName}
${order.customerPhone || ""}

We'll send tracking info once dispatched.
Ships via Packeta from Trenčín, Slovakia.

Questions? Contact us on Instagram @re.district

RE:DISTRICT · Rebuild your time.`;
}

// ── Admin email ────────────────────────────────────────────────────────────────

function adminHtml(order: SavedOrder): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="wrap">
    <div class="brand">RE<span>:</span>DISTRICT · New Order</div>
    <h1>New order received.</h1>

    <div class="label">Order ID</div>
    <div class="value">${order.id}</div>
    <div class="label">Stripe Session</div>
    <div class="value" style="font-size:9px;color:rgba(255,255,255,0.4)">${order.stripeSessionId}</div>

    <hr class="divider">

    <div class="label">Customer</div>
    <div class="value">${order.customerName}</div>
    <div class="label">Email</div>
    <div class="value">${order.customerEmail}</div>
    <div class="label">Phone</div>
    <div class="value">${order.customerPhone || "—"}</div>

    <hr class="divider">

    ${itemsTable(order)}

    <hr class="divider">

    ${deliveryBlock(order)}

    <hr class="divider">

    <div class="value" style="font-size:10px;color:rgba(255,255,255,0.4)">
      Received: ${new Date(order.createdAt).toLocaleString("en-GB", { timeZone: "Europe/Bratislava" })} (Bratislava time)
    </div>

    <div class="footer">RE:DISTRICT Admin Notification</div>
  </div>
  </body></html>`;
}

function adminText(order: SavedOrder): string {
  const delivery = order.deliveryMethod === "pickup"
    ? `Pickup: ${order.pickupPointName ?? "—"} (${order.pickupPointAddress ?? "—"}) ID: ${order.pickupPointId ?? "—"}`
    : `Home delivery: ${[order.address, order.city, order.country].filter(Boolean).join(", ")}`;

  const items = order.items.map(i => `  ${i.name} x${i.quantity}  €${(i.price * i.quantity).toFixed(2)}`).join("\n");

  return `NEW ORDER — RE:DISTRICT

Order ID: ${order.id}
Stripe: ${order.stripeSessionId}

CUSTOMER
Name:  ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone || "—"}

PRODUCTS
${items}
Shipping: €${order.shippingPrice.toFixed(2)}
Total:    €${order.grandTotal.toFixed(2)}

DELIVERY
${delivery}

Received: ${order.createdAt}`;
}

// ── Public send functions ─────────────────────────────────────────────────────

export async function sendOrderEmails(order: SavedOrder): Promise<void> {
  // Guard: if email is not configured, log and skip — don't crash checkout
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      "[email] EMAIL_USER or EMAIL_PASS not set. " +
      "Order emails will not be sent. " +
      "Add them to Vercel environment variables to enable email notifications."
    );
    return;
  }

  const transport = createTransport();

  // Send both in parallel; catch individually so one failure doesn't block the other
  const [customerResult, adminResult] = await Promise.allSettled([
    // 1. Customer confirmation
    transport.sendMail({
      from:    from(),
      to:      order.customerEmail,
      subject: `Order confirmed — ${order.id} | RE:DISTRICT`,
      text:    customerText(order),
      html:    customerHtml(order),
    }),

    // 2. Admin notification
    transport.sendMail({
      from:    from(),
      to:      adminTo(),
      subject: `[New Order] ${order.id} · ${order.customerName} · €${order.grandTotal.toFixed(2)}`,
      text:    adminText(order),
      html:    adminHtml(order),
    }),
  ]);

  if (customerResult.status === "rejected") {
    console.error("[email] Customer email failed:", customerResult.reason);
  } else {
    console.log("[email] Customer email sent to:", order.customerEmail);
  }

  if (adminResult.status === "rejected") {
    console.error("[email] Admin email failed:", adminResult.reason);
  } else {
    console.log("[email] Admin email sent to:", adminTo());
  }
}
