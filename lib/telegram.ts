// lib/telegram.ts
export async function sendTelegramNotification(order: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram credentials missing");
    return;
  }

  const itemsList = (order.items || [])
    .map((i: any) => `• ${i.name} × ${i.quantity}`)
    .join('\n');

  const deliveryInfo = order.deliveryMethod === 'pickup' 
    ? `📍 Packeta: ${order.pickupPointName || ''}\n${order.pickupPointAddress || ''}`
    : `📍 ${order.address || ''}`;

  const message = `
🛎️ <b>Новый заказ в RE:DISTRICT</b>

🆔 <code>${order.id}</code>
👤 ${order.customerName}
📧 ${order.customerEmail}
☎️ ${order.customerPhone || '—'}

🌍 ${order.country} • ${order.city}
${deliveryInfo}

────────────────
${itemsList}

💰 <b>€${(order.grandTotal / 100).toFixed(2)}</b> 
${order.shippingPrice > 0 ? `(доставка €${(order.shippingPrice/100).toFixed(2)})` : '(доставка бесплатно)'}

🕒 ${new Date(order.createdAt).toLocaleString('ru-RU')}
  `.trim();

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      console.error("Telegram error:", await res.text());
    }
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
}
