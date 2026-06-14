import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import CustomCursor from "@/components/ui/CustomCursor";
import ScrollToTop from "@/components/ui/ScrollToTop";
import DynamicFavicon from "@/components/ui/DynamicFavicon";
import LiveTitle from "@/components/ui/LiveTitle";
import { LangProvider } from "@/lib/lang";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: "RE:DISTRICT — Rebuild Your Time",
    template: "%s | RE:DISTRICT",
  },
  description:
    "Custom watches, restored vintage pieces, and curated pre-owned watches with character. RE:DISTRICT — Rebuild your time.",
  keywords: [
    "custom watches",
    "restored vintage watches",
    "luxury watches",
    "pre-owned watches",
    "watch customization",
    "RE:DISTRICT",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "RE:DISTRICT — Rebuild Your Time",
    description:
      "Custom watches, restored vintage pieces, and curated pre-owned watches with character.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white antialiased overflow-x-hidden">
        <LangProvider>
          <CartProvider>
            <LiveTitle />
            <DynamicFavicon />
            <CustomCursor />
            <ScrollToTop />
            <CartDrawer />
            <Navigation />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}
