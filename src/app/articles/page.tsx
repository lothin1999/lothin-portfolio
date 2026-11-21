import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata, breadcrumbsJsonLd } from "@/lib/seo";
import { ArticlesView } from "@/components/views/ArticlesView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Writing",
    description: "Thoughts on frontend development, NestJS backend, payment gateways, and building clean web systems.",
    path: "/articles",
  });
}

export default async function ArticlesPage() {
  const cv = await getCVData();
  const breadcrumbJson = breadcrumbsJsonLd([
    { name: "Home", path: "/" },
    { name: "Writing", path: "/articles" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <ArticlesView cv={cv} />
    </>
  );
}
