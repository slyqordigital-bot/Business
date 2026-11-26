import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return { rules: [{ userAgent: "*", allow: ["/", "/privacy", "/terms"], disallow: ["/api/", "/today", "/scan", "/history", "/settings", "/account", "/meal/", "/s/"] }], sitemap: `${base}/sitemap.xml` };
}
