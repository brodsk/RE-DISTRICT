"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";
import { SHIPPING_OPTIONS, COUNTRIES } from "@/lib/shipping";
import Link from "next/link";
import PacketaPickupSelector, { type PacketaPoint } from "@/components/PacketaPickupSelector";

const inp = `w-full bg-transparent border border-white/10 hover:border-white/20 focus:border-white/40
  outline-none px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-800 transition-colors`;
const lbl = "block text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-2";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { t } = useLang();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", country: "SK", city: "", address: "",
    shippingId: "packeta-pickup-sk",
  });
  const [pickupPoint, setPickupPoint] = useState<PacketaPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === "country") {
        const currentMethod = SHIPPING_OPTIONS.find(o => o.id === prev.shippingId)?.deliveryMethod;
        const opt = SHIPPING_OPTIONS.find(o => o.country === v && o.deliveryMethod === currentMethod) ??
          SHIPPING_OPTIONS.find(o => o.country === v);
        if (opt) next.shippingId = opt.id;
        setPickupPoint(null);
      }
      if (k === "shippingId") {
        setPickupPoint(null);
      }
      return next;
    });
  };

  const shipping = SHIPPING_OPTIONS.find(o => o.id === form.shippingId) ?? SHIPPING_OPTIONS[0];
  const isPickup = shipping.deliveryMethod === "pickup";
  const shippingForCountry = SHIPPING_OPTIONS.filter(o => o.country === form.country);
  const grandTotal = total + (shipping?.price ?? 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (isPickup && !pickupPoint?.id) {
      setError(t("Select a Packeta pickup point.", "Выберите пункт выдачи Packeta."));
      return;
    }
    if (!isPickup && !form.address.trim()) {
      setError(t("Enter a delivery address.", "Введите адрес доставки."));
      return;
    }

    setLoading(true);
    setError("");
    try {
      const pickupAddress = pickupPoint
        ? `${pickupPoint.street}, ${pickupPoint.zip} ${pickupPoint.city}`
        : "";
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, image: i.image, quantity: i.quantity })),
          orderData: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            country: form.country,
            city: form.city,
            address: isPickup ? pickupAddress : form.address,
            shippingId: form.shippingId,
            deliveryMethod: shipping.deliveryMethod,
            pickupPointId: pickupPoint?.id ?? "",
            pickupPointName: pickupPoint?.name ?? "",
            pickupPointAddress: pickupAddress,
          },
        }),
      });
      const data = await res.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        setError(data.error ?? t("Checkout failed. Please try again.", "Ошибка оформления. Попробуйте ещё раз."));
      }
    } catch {
      setError(t("Network error. Please try again.", "Ошибка сети. Попробуйте ещё раз."));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-zinc-700 font-mono text-xs tracking-widest mb-6">
          {t("Your cart is empty.", "Корзина пуста.")}
        </p>
        <Link href="/shop" className="text-[9px] tracking-[0.3em] uppercase font-mono text-zinc-600 hover:text-white transition-colors">
          {t("Browse watches ->", "Смотреть часы ->")}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-28 pb-24 px-6 md:px-12">
      <style>{`
        .checkout-select { background: #050505; color: #f4f4f5; color-scheme: dark; }
        .checkout-select option { background: #09090b; color: #e4e4e7; }
      `}</style>
      <div className="max-w-screen-lg mx-auto">
        <div className="mb-10">
          <p className="text-[9px] tracking-[0.45em] uppercase font-mono text-zinc-700 mb-2">
            {t("Order", "Заказ")}
          </p>
          <h1 className="font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 4rem)" }}>
            {t("Checkout", "Оформление")}
          </h1>
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3 space-y-10">
              <section>
                <p className="text-[8px] tracking-[0.35em] uppercase font-mono text-zinc-600 mb-5 pb-3 border-b border-white/5">
                  {t("Contact", "Контакты")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>{t("Full Name", "Полное имя")} *</label>
                    <input className={inp} required value={form.name} onChange={e => set("name", e.target.value)}
                      placeholder={t("Jan Novak", "Иван Иванов")} />
                  </div>
                  <div>
                    <label className={lbl}>{t("Email", "Почта")} *</label>
                    <input className={inp} type="email" required value={form.email} onChange={e => set("email", e.target.value)}
                      placeholder="jan@example.com" />
                  </div>
                  <div>
                    <label className={lbl}>{t("Phone", "Телефон")} *</label>
                    <input className={inp} type="tel" required value={form.phone} onChange={e => set("phone", e.target.value)}
                      placeholder="+421 900 000 000" />
                  </div>
                </div>
              </section>

              <section>
                <p className="text-[8px] tracking-[0.35em] uppercase font-mono text-zinc-600 mb-5 pb-3 border-b border-white/5">
                  {t("Delivery", "Доставка")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className={lbl}>{t("Country", "Страна")} *</label>
                    <select
                      className="w-full border border-white/10 outline-none px-4 py-3 text-sm font-mono transition-colors checkout-select"
                      required value={form.country} onChange={e => set("country", e.target.value)}
                    >
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>{t("City", "Город")} *</label>
                    <input className={inp} required value={form.city} onChange={e => set("city", e.target.value)}
                      placeholder={t("Bratislava", "Братислава")} />
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <label className={lbl}>{t("Delivery Method", "Способ доставки")} *</label>
                  {shippingForCountry.map(opt => (
                    <label key={opt.id}
                      className={`flex items-center justify-between gap-4 border px-4 py-3.5 cursor-pointer transition-all
                        ${form.shippingId === opt.id ? "border-white/40 bg-white/[0.03]" : "border-white/10 hover:border-white/20"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all
                          ${form.shippingId === opt.id ? "border-white" : "border-white/30"}`}>
                          {form.shippingId === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-white">{opt.label}</p>
                          <p className="text-[8px] font-mono text-zinc-600">{opt.days}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-300 tabular-nums shrink-0">€{opt.price.toFixed(2)}</span>
                      <input type="radio" name="shipping" value={opt.id} checked={form.shippingId === opt.id}
                        onChange={() => set("shippingId", opt.id)} className="sr-only" required />
                    </label>
                  ))}
                </div>

                {isPickup ? (
                  <PacketaPickupSelector
                    country={form.country.toLowerCase()}
                    onSelect={setPickupPoint}
                    selected={pickupPoint}
                  />
                ) : (
                  <div>
                    <label className={lbl}>{t("Delivery Address", "Адрес доставки")} *</label>
                    <input className={inp} required value={form.address} onChange={e => set("address", e.target.value)}
                      placeholder={t("Street address", "Улица и дом")} />
                  </div>
                )}

                <p className="text-[8px] font-mono text-zinc-700 mt-4">
                  {t("Ships via Packeta from Trencin, Slovakia.", "Доставка через Packeta из Тренчина, Словакия.")}
                </p>
              </section>

              {error && (
                <p className="text-[10px] font-mono text-red-700 border border-red-900/30 px-4 py-3">{error}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 border border-white/5 p-6">
                <p className="text-[8px] tracking-[0.35em] uppercase font-mono text-zinc-600 mb-6">
                  {t("Order Summary", "Итог заказа")}
                </p>

                <div className="divide-y divide-white/5 mb-6">
                  {items.map(item => (
                    <div key={item.productId} className="flex items-center gap-3 py-4">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover shrink-0 border border-white/5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono text-white truncate">{item.name}</p>
                        <p className="text-[8px] font-mono text-zinc-600">x{item.quantity}</p>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-300 tabular-nums shrink-0">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-mono text-zinc-600">{t("Subtotal", "Сумма")}</span>
                    <span className="text-[10px] font-mono text-white tabular-nums">€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-mono text-zinc-600">{t("Shipping", "Доставка")}</span>
                    <span className="text-[10px] font-mono text-white tabular-nums">€{(shipping?.price ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-3 mt-3">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">{t("Total", "Итого")}</span>
                    <span className="text-base font-mono text-white tabular-nums">€{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className={`w-full text-[10px] tracking-[0.35em] uppercase font-mono py-4 transition-all
                    ${loading ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"}`}>
                  {loading
                    ? t("Redirecting...", "Переходим...")
                    : t("Pay with Stripe ->", "Оплатить через Stripe ->")}
                </button>

                <p className="text-[8px] font-mono text-zinc-700 text-center mt-3">
                  {t("Secure payment via Stripe. You will be redirected.",
                     "Безопасная оплата через Stripe. Вас перенаправят.")}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
