import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { SkillsSection } from "@/components/sections/SkillsSection";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Skills",
    description: "Technical skills including Vue/Nuxt, React/Next.js, NestJS, Laravel, Spring Boot, Cloudflare, Docker, and Bakong KHQR.",
    path: "/skills",
  });
}

export default function SkillsPage() {
  return <SkillsSection />;
}
