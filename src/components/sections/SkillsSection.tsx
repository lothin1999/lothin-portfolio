"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCVData } from "@/hooks/useCVData";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { Glyph } from "@/components/ui/Glyph";
import { useScrollReveal } from "@/hooks/useScrollReveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// Custom patterns for skill categories
const SKILL_GLYPHS: Record<string, string> = {
  "Front-End": "111010111",
  "Back-End": "101111101",
  "Databases": "010111010",
  "DevOps & Cloud": "111101111",
  "Integrations": "000111000",
};

export function SkillsSection() {
  const { cv } = useCVData();
  const headRef = useScrollReveal<HTMLDivElement>({ variant: "fadeUp" });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const groups = el.querySelectorAll(".skill-group");
      gsap.fromTo(groups,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [cv.skillGroups]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div ref={headRef}>
        <SectionLabel label="Stack" heading="Skills" />
      </div>
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cv.skillGroups.map((group) => {
          const pattern = SKILL_GLYPHS[group.label] || "111111111";
          return (
            <div
              key={group.label}
              className="skill-group border border-rule bg-surface p-5 hover:border-ink transition-colors duration-250 flex flex-col gap-4 rounded"
            >
              {/* Category Header with glyph */}
              <div className="flex items-center justify-between pb-2.5 border-b border-rule">
                <span className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-ink font-semibold">
                  {group.label}
                </span>
                <Glyph
                  pattern={pattern}
                  hoverPattern="111111111"
                  size={14}
                  gap={1}
                  color="var(--accent)"
                />
              </div>

              {/* Skill chips */}
              <div className="flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <Chip key={skill} className="chip-glow text-[11px] py-0.5 px-2.5">
                    {skill}
                  </Chip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
