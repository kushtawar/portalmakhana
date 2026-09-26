import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PromotionBanner from "@/components/layout/PromotionBanner";
import { CartProvider } from "@/lib/cart/CartContext";

// The site-wide promotion banner below needs to reflect admin changes
// immediately, so the whole app renders dynamically rather than being
// statically cached per-route.
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ItarIntakes — Premium Makhana from Patna",
    template: "%s | ItarIntakes",
  },
  description:
    "Shrestha by ItarIntakes — Silver, Gold, Diamond and Handpicked Makhana plus Haldi, Dhaniya and Mircha powders from Patna. Carefully selected and hygienically packed.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header />
          <PromotionBanner />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
