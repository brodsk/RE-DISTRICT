import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { LangProvider } from "@/lib/lang";
import { CartProvider } from "@/lib/cart";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import DynamicFavicon from "@/components/ui/DynamicFavicon";
import LiveTitle from "@/components/ui/LiveTitle";
import ScrollToTop from "@/components/ui/ScrollToTop";

export const metadata: Metadata = {
  title: "RE:DISTRICT | Rebuild your time",
  description: "Custom, restored and curated Japanese digital watches. Casio, Seiko, Orient, Citizen.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white antialiased overflow-x-hidden">
        <Script
          src="https://widget.packeta.com/v6/www/js/library.js"
          strategy="afterInteractive"
        />
        <LangProvider>
          <CartProvider>
            <LiveTitle />
            <DynamicFavicon />
            <ScrollToTop />
            <Navigation />
            <CartDrawer />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}
