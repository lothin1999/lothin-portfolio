import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/sections/HeroSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { AboutSection } from "@/components/sections/AboutSection";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, { path: "/" });
}

export default function HomePage() {
  return (
    <>
      <section id="home"><HeroSection /></section>
      <section id="experience"><ExperienceSection /></section>
      <section id="skills"><SkillsSection /></section>
      <section id="education"><EducationSection /></section>
      <section id="about"><AboutSection /></section>
    </>
  );
}

