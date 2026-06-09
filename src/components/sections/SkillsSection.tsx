"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCVData } from "@/hooks/useCVData";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { useScrollReveal } from "@/hooks/useScrollReveal";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function SkillsSection() {
  const { cv } = useCVData();
  const headRef = useScrollReveal<HTMLDivElement>({ variant: "fadeLeft" });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const groups = el.querySelectorAll(".skill-group");
      gsap.fromTo(groups,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          stagger: { amount: 0.5, grid: "auto", from: "start" },
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        }
      );

      // Animate each skill chip inside groups with more stagger
      groups.forEach((group) => {
        gsap.fromTo(group.querySelectorAll(".chip"),
          { opacity: 0, scale: 0.8, y: 6 },
          {
            opacity: 1, scale: 1, y: 0,
            duration: 0.3,
            stagger: 0.04,
            ease: "back.out(1.5)",
            scrollTrigger: { trigger: group, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });
    }, el);
    return () => ctx.revert();
  }, [cv.skillGroups]);

  return (
    <section className="max-w-content mx-auto px-6 py-16 border-b border-rule">
      <div ref={headRef}><SectionLabel label="Stack" heading="Skills" /></div>
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cv.skillGroups.map((group) => (
          <div key={group.label} className="skill-group grad-card border border-rule bg-surface p-4">
            <p className="font-mono text-[10.5px] tracking-[2px] uppercase text-muted mb-3 pb-2 border-b border-rule">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <Chip key={skill} className="chip-glow">{skill}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
