import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata, breadcrumbsJsonLd } from "@/lib/seo";
import { AboutView } from "@/components/views/AboutView";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "About",
    description:
      "Thoeun Lothin — Full-Stack Web Developer based in Phnom Penh, Cambodia. 3+ years building production platforms, payment gateways, and enterprise systems.",
    path: "/about",
  });
}

export default async function AboutPage() {
  const cv = await getCVData();
  const breadcrumbJson = breadcrumbsJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <AboutView cv={cv} />
    </>
  );
}
