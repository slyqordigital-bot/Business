import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return { rules: [{ userAgent: "*", allow: ["/", "/privacy", "/terms", "/q/"], disallow: ["/api/", "/dashboard", "/quests", "/rewards", "/profile", "/account", "/pricing", "/start"] }], sitemap: `${base}/sitemap.xml` };
}
