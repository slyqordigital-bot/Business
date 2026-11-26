import type { Metadata, Viewport } from "next";
import { Rajdhani, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({ variable: "--font-rajdhani", subsets: ["latin"], display: "swap", weight: ["600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap", weight: ["400", "500"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "SnackQuest: snack, play, unlock real gear", template: "%s · SnackQuest" },
  description:
    "Turn your snack breaks into quests and your playtime into points. Redeem them for gift cards and gaming gear. Made for gamers who love snacks.",
  applicationName: "SnackQuest",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "SnackQuest", statusBarStyle: "black-translucent" },
  openGraph: { type: "website", siteName: "SnackQuest" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#07060D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
