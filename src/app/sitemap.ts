import type { MetadataRoute } from "next";
import { getCVData } from "@/lib/cvStore";

const cleanEnvVar = (val: string | undefined) => (val || "").trim().replace(/^['"]|['"]$/g, "");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? cleanEnvVar(process.env.NEXT_PUBLIC_SITE_URL)
  : "https://lothin-portfolio.pages.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes = [
    { path: "", freq: "weekly", priority: 1.0 },
    { path: "/experience", freq: "monthly", priority: 0.9 },
    { path: "/skills", freq: "monthly", priority: 0.9 },
    { path: "/education", freq: "monthly", priority: 0.8 },
    { path: "/about", freq: "monthly", priority: 0.8 },
    { path: "/articles", freq: "weekly", priority: 0.8 },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = baseRoutes.map(({ path, freq, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: freq as any,
    priority,
  }));

  try {
    const cv = await getCVData();
    const articles = cv.articles || [];
    articles.forEach((article) => {
      sitemapEntries.push({
        url: `${SITE_URL}/articles/${article.slug}`,
        lastModified: new Date(article.date || new Date()),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error("Error generating dynamic sitemap entries:", error);
  }

  return sitemapEntries;
}
