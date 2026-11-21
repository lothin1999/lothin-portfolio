import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata, portfolioJsonLd, breadcrumbsJsonLd } from "@/lib/seo";
import { PortfolioView } from "@/components/views/PortfolioView";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Work",
    description:
      "3+ years of full-stack development experience building nationwide rental platforms, enterprise POS, banking, and loan systems in Cambodia with Vue/Nuxt, React/Next.js, Angular, NestJS, Laravel, and Spring Boot.",
    path: "/portfolio",
  });
}

export default async function PortfolioPage() {
  const cv = await getCVData();
  const jsonLdData = [
    portfolioJsonLd(cv),
    breadcrumbsJsonLd([
      { name: "Home", path: "/" },
      { name: "Work", path: "/portfolio" },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <PortfolioView cv={cv} />
    </>
  );
}
