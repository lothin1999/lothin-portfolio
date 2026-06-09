import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { ExperienceSection } from "@/components/sections/ExperienceSection";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Experience",
    description: "Full-stack work history — POS, banking, rental marketplaces, and enterprise systems delivered at IDG Technology Solutions.",
    path: "/experience",
  });
}

export default function ExperiencePage() {
  return <ExperienceSection />;
}
