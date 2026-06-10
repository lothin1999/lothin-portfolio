"use client";

import { useEffect } from "react";
import { useSettings } from "@/components/layout/SettingsContext";
import { HeroSection } from "@/components/sections/HeroSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { AboutSection } from "@/components/sections/AboutSection";

const HOMEPAGE_SECTION_IDS = ["home", "experience", "skills", "education", "about"];

export default function HomePage() {
  const { setActivePathSegment } = useSettings();

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sectionMap = new Map<string, number>();

    const updateActive = () => {
      let best = "home";
      let bestRatio = -1;
      sectionMap.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = id;
        }
      });
      // Translate display names
      const displayMap: Record<string, string> = {
        home: "home",
        experience: "work",
        skills: "skills",
        education: "education",
        about: "about"
      };
      setActivePathSegment(displayMap[best] || best);
    };

    HOMEPAGE_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            sectionMap.set(id, entry.intersectionRatio);
          });
          updateActive();
        },
        { threshold: [0, 0.15, 0.3, 0.5, 0.7], rootMargin: "-100px 0px -20% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [setActivePathSegment]);

  return (
    <div className="bg-bg w-full">
      {/* Home Hero Section */}
      <section id="home" className="relative border-b border-rule">
        <HeroSection />
      </section>

      {/* Experience Section */}
      <section id="experience" className="relative border-b border-rule">
        <ExperienceSection />
      </section>

      {/* Skills Section */}
      <section id="skills" className="relative border-b border-rule">
        <SkillsSection />
      </section>

      {/* Education Section */}
      <section id="education" className="relative border-b border-rule">
        <EducationSection />
      </section>

      {/* About Section */}
      <section id="about" className="relative">
        <AboutSection />
      </section>
    </div>
  );
}
