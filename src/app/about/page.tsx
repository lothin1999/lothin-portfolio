import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { AboutSection } from "@/components/sections/AboutSection";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "About",
    description: "Contact Thoeun Lothin — Full-Stack Developer in Phnom Penh. Available for freelance and full-time roles.",
    path: "/about",
  });
}

export default function AboutPage() {
  return <AboutSection />;
}
