import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap", weight: ["400", "500"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "MacroSnap — Snap your meal, get your macros", template: "%s · MacroSnap" },
  description:
    "Take a photo of your plate and get calories, protein, carbs and fat in seconds. No database search, no weighing, no typing.",
  applicationName: "MacroSnap",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "MacroSnap", statusBarStyle: "black-translucent" },
  openGraph: { type: "website", siteName: "MacroSnap" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#14120E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
