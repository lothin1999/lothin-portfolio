import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata, servicesJsonLd, breadcrumbsJsonLd } from "@/lib/seo";
import { ServicesView } from "@/components/views/ServicesView";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Services",
    description: "High-end full-stack consulting, custom web development, tech advisory, and payment integration services for founders and teams.",
    path: "/services",
  });
}

export default async function ServicesPage() {
  const cv = await getCVData();
  const jsonLdData = [
    servicesJsonLd(cv),
    breadcrumbsJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <ServicesView cv={cv} />
    </>
  );
}
