import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK"],
});

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Polaris — Find the Neighborhood That Fits Your Life",
  description:
    "AI-powered neighborhood discovery. Describe your lifestyle and budget — get personalized recommendations across Mumbai, Toronto, and New York City.",
  keywords: [
    "neighborhood finder",
    "AI relocation",
    "Mumbai neighborhoods",
    "Toronto neighborhoods",
    "NYC neighborhoods",
    "where to live",
  ],
  authors: [{ name: "Polaris" }],
  openGraph: {
    title: "Polaris — AI Neighborhood Discovery",
    description:
      "Find the perfect neighborhood based on your lifestyle, budget, safety needs, and community preferences.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Polaris — Find Your Perfect Neighborhood",
    description: "AI-powered neighborhood matching across global cities.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1FA958",
  width: "device-width",
  initialScale: 1,
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
