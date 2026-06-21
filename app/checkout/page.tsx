"use client";
import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/lang";
import { SHIPPING_OPTIONS, COUNTRIES } from "@/lib/shipping";
import Link from "next/link";

// ── Mock Packeta pickup data — replace with real Packeta API call ──────────────
// Structure: { [countryCode]: { [city]: PickupPoint[] } }
// Real API: GET https://www.zasilkovna.cz/api/v5/{apiKey}/branch?country={cc}&city={city}
interface PickupPoint { id: string; name: string; address: string; }
const MOCK_PICKUPS: Record<string, Record<string, PickupPoint[]>> = {
  SK: {
    Trenčín:    [{ id:"sk-tn-001", name:"Packeta – Trenčín Centrum",  address:"Mierové nám. 2, 911 01 Trenčín" },
                 { id:"sk-tn-002", name:"Packeta – Trenčín Laugaricio",address:"Laugaricio Shopping, Trenčín"   }],
    Bratislava: [{ id:"sk-ba-001", name:"Packeta – Bratislava Aupark",  address:"Einsteinova 18, 851 01"        },
                 { id:"sk-ba-002", name:"Packeta – Bratislava Eurovea", address:"Pribinova 8, 821 09"           }],
  },
  CZ: {
    Praha:  [{ id:"cz-pr-001", name:"Zásilkovna – Praha 1 Centrum", address:"Václavské nám. 1, 110 00" },
             { id:"cz-pr-002", name:"Zásilkovna – Praha Anděl",      address:"Nádražní 32, 150 00"     }],
    Brno:   [{ id:"cz-br-001", name:"Zásilkovna – Brno Centrum",    address:"Náměstí Svobody 1, 602 00"}],
  },
  PL: {
    Warszawa: [{ id:"pl-wa-001", name:"Packeta – Warszawa Centrum", address:"ul. Marszałkowska 1, 00-001" }],
    Kraków:   [{ id:"pl-kr-001", name:"Packeta – Kraków Stare Miasto",address:"ul. Floriańska 5, 31-019" }],
  },
};

function PacketaPickupSelector({
  country, city, onSelect, t,
}: {
  country:  string;
  city:     string;
  onSelect: (id: string) => void;
  t:        (en: string, ru: string) => string;
}) {
  const [selected, setSelected] = useState("");

  const points = useMemo(() => {
    if (!city) return [];
    const normalised = city.trim();
    const byCountry  = MOCK_PICKUPS[country] ?? {};
    // Case-insensitive city match
    const key = Object.keys(byCountry).find(k => k.toLowerCase() === normalised.toLowerCase());
    return key ? byCountry[key] : [];
  }, [country, city]);

  if (points.length === 0) return null;

  return (
    <div className="mt-4">
      <label className="block text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-2">
        {t("Packeta Pickup Points","Пункты выдачи Packeta")}
      </label>
      <div className="space-y-2">
        {points.map(p => (
          <label key={p.id}
            className={`flex items-start gap-3 border px-4 py-3 cursor-pointer transition-all ${
              selected === p.id ? "border-white/40 bg-white/[0.03]" : "border-white/10 hover:border-white/20"
            }`}
            onClick={() => { setSelected(p.id); onSelect(p.id); }}
          >
            <div className={`w-3 h-3 rounded-full border flex-shrink-0 mt-0.5 flex items-center justify-center ${
              selected === p.id ? "border-white" : "border-white/30"
            }`}>
              {selected === p.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className="text-[10px] font-mono text-white">{p.name}</p>
              <p className="text-[8px] font-mono text-zinc-600">{p.address}</p>
              <p className="text-[7px] font-mono text-zinc-800 mt-0.5">ID: {p.id}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const inp = `w-full bg-transparent border border-white/10 hover:border-white/20 focus:border-white/40
  outline-none px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-800 transition-colors`;
const lbl = "block text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-2";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { t } = useLang();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", country: "SK", city: "", address: "", shippingId: "packeta-sk",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k: string, v: string) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      // Auto-select shipping when country changes
      if (k === "country") {
        const opt = SHIPPING_OPTIONS.find(o => o.country === v);
        if (opt) next.shippingId = opt.id;
      }
      return next;
    });
  };

  const shipping = SHIPPING_OPTIONS.find(o => o.id === form.shippingId) ?? SHIPPING_OPTIONS[0];
  const shippingForCountry = SHIPPING_OPTIONS.filter(o => o.country === form.country);
  const grandTotal = total + (shipping?.price ?? 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, image: i.image, quantity: i.quantity })),
          orderData: { name: form.name, email: form.email, phone: form.phone },
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
          {t("Browse watches →","Смотреть часы →")}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-28 pb-24 px-6 md:px-12">
      {/* FIX #4: force dark text on white bg for <option> elements */}
      <style>{`
        .checkout-select option {
          background: #ffffff;
          color: #111111;
        }
        .checkout-select option:hover,
        .checkout-select option:checked {
          background: #374151;
          color: #ffffff;
        }
      `}</style>
      <div className="max-w-screen-lg mx-auto">
        <div className="mb-10">
          <p className="text-[9px] tracking-[0.45em] uppercase font-mono text-zinc-700 mb-2">
            {t("Order","Заказ")}
          </p>
          <h1 className="font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 4rem)" }}>
            {t("Checkout","Оформление")}
          </h1>
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* LEFT: Form */}
            <div className="lg:col-span-3 space-y-10">

              {/* Contact */}
              <section>
                <p className="text-[8px] tracking-[0.35em] uppercase font-mono text-zinc-600 mb-5 pb-3 border-b border-white/5">
                  {t("Contact","Контакты")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={lbl}>{t("Full Name","Полное имя")} *</label>
                    <input className={inp} required value={form.name} onChange={e => set("name", e.target.value)}
                      placeholder={t("Jan Novák","Иван Иванов")} />
                  </div>
                  <div>
                    <label className={lbl}>{t("Email","Почта")} *</label>
                    <input className={inp} type="email" required value={form.email} onChange={e => set("email", e.target.value)}
                      placeholder="jan@example.com" />
                  </div>
                  <div>
                    <label className={lbl}>{t("Phone","Телефон")} *</label>
                    <input className={inp} type="tel" required value={form.phone} onChange={e => set("phone", e.target.value)}
                      placeholder="+421 900 000 000" />
                  </div>
                </div>
              </section>

              {/* Delivery */}
              <section>
                <p className="text-[8px] tracking-[0.35em] uppercase font-mono text-zinc-600 mb-5 pb-3 border-b border-white/5">
                  {t("Delivery","Доставка")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className={lbl}>{t("Country","Страна")} *</label>
                    <select
                      style={{ background: "white", color: "#111" }}
                      className="w-full border border-white/10 outline-none px-4 py-3 text-sm font-mono transition-colors checkout-select"
                      required value={form.country} onChange={e => set("country", e.target.value)}
                    >
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>{t("City","Город")} *</label>
                    <input className={inp} required value={form.city} onChange={e => set("city", e.target.value)}
                      placeholder={t("Bratislava","Братислава")} />
                  </div>
                </div>

                {/* Shipping method */}
                <div className="space-y-2 mb-4">
                  <label className={lbl}>{t("Shipping Method","Способ доставки")} *</label>
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

                <div>
                  <label className={lbl}>{t("Delivery Address or Packeta Point","Адрес или пункт выдачи Packeta")}</label>
                  <input className={inp} value={form.address} onChange={e => set("address", e.target.value)}
                    placeholder={t("Street address or Packeta pickup point ID","Адрес или ID пункта выдачи Packeta")} />
                  <p className="text-[8px] font-mono text-zinc-700 mt-2">
                    {t("Ships via Packeta (Zásielkovňa) from Trenčín, Slovakia.",
                       "Доставка через Packeta (Zásielkovňa) из Тренчина, Словакия.")}
                  </p>
                </div>

                {/* Fix #5: Pickup point selector (mock — structure ready for Packeta API) */}
                <PacketaPickupSelector
                  country={form.country}
                  city={form.city}
                  onSelect={pointId => set("address", pointId)}
                  t={t}
                />
              </section>

              {error && (
                <p className="text-[10px] font-mono text-red-700 border border-red-900/30 px-4 py-3">{error}</p>
              )}
            </div>

            {/* RIGHT: Order summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 border border-white/5 p-6">
                <p className="text-[8px] tracking-[0.35em] uppercase font-mono text-zinc-600 mb-6">
                  {t("Order Summary","Итог заказа")}
                </p>

                {/* Items */}
                <div className="divide-y divide-white/5 mb-6">
                  {items.map(item => (
                    <div key={item.productId} className="flex items-center gap-3 py-4">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover shrink-0 border border-white/5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono text-white truncate">{item.name}</p>
                        <p className="text-[8px] font-mono text-zinc-600">×{item.quantity}</p>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-300 tabular-nums shrink-0">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-white/5 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-mono text-zinc-600">{t("Subtotal","Сумма")}</span>
                    <span className="text-[10px] font-mono text-white tabular-nums">€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-mono text-zinc-600">{t("Shipping","Доставка")}</span>
                    <span className="text-[10px] font-mono text-white tabular-nums">€{(shipping?.price ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-3 mt-3">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">{t("Total","Итого")}</span>
                    <span className="text-base font-mono text-white tabular-nums">€{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className={`w-full text-[10px] tracking-[0.35em] uppercase font-mono py-4 transition-all
                    ${loading ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"}`}>
                  {loading
                    ? t("Redirecting…","Переходим…")
                    : t("Pay with Stripe →","Оплатить через Stripe →")}
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
