// src/app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lothin-portfolio.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", freq: "weekly", priority: 1.0 },
    { path: "/experience", freq: "monthly", priority: 0.9 },
    { path: "/skills", freq: "monthly", priority: 0.9 },
    { path: "/education", freq: "monthly", priority: 0.8 },
    { path: "/about", freq: "monthly", priority: 0.8 },
    { path: "/articles", freq: "weekly", priority: 0.8 },
  ];
  return routes.map(({ path, freq, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: freq as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority,
  }));
}
