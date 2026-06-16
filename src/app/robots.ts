// src/app/robots.ts
import type { MetadataRoute } from "next";

const cleanEnvVar = (val: string | undefined) => (val || "").trim().replace(/^['"]|['"]$/g, "");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? cleanEnvVar(process.env.NEXT_PUBLIC_SITE_URL)
  : "https://lothin-portfolio.pages.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/edit/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
