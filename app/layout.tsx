import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, Kalam, Newsreader } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { isDemo } from "@/lib/db";
import { site } from "@/lib/site";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const body = Newsreader({ subsets: ["latin", "latin-ext"], weight: ["400"], style: ["normal", "italic"], variable: "--font-body", display: "swap" });
const hand = Kalam({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-hand", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · Testimonies of what God did`, template: `%s · ${site.name}` },
  description: site.tagline + " Read one, then write yours.",
  openGraph: { siteName: site.name, type: "website", locale: "en_NG" },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#f6f7f9", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${body.variable} ${hand.variable}`}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        {isDemo() && <div className="demo-banner">Preview mode: sample stories are shown and nothing you submit is saved yet.</div>}
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
