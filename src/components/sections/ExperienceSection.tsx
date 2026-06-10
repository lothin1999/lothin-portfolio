"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCVData } from "@/hooks/useCVData";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { Glyph } from "@/components/ui/Glyph";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Experience } from "@/types/cv";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// Custom patterns for each job card to represent retro-tech nodes
const JOB_GLYPHS = [
  "101111101", // IDG 2025
  "111010111", // IDG 2024
  "010111010", // IDG 2023
];

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const glyphPattern = JOB_GLYPHS[index % JOB_GLYPHS.length];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [index]);

  return (
    <article
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 border-b border-rule bg-surface hover:bg-[var(--color-surface-subtle)] transition-colors duration-200"
    >
      {/* Date period column */}
      <div className="md:col-span-3 flex md:flex-col items-start gap-3 justify-between md:justify-start">
        <span className="font-mono text-[11px] text-muted tracking-wider leading-none uppercase">
          {exp.period}
        </span>
        <div className="hidden md:block mt-3">
          <Glyph
            pattern={glyphPattern}
            hoverPattern="111111111"
            size={18}
            gap={1.5}
            color="var(--accent)"
          />
        </div>
      </div>

      {/* Main info column */}
      <div className="md:col-span-9 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="text-[16px] font-sans font-medium text-ink leading-tight">
              {exp.title}
            </h3>
            <p className="font-mono text-[12px] text-accent tracking-[0.3px] mt-0.5">
              {exp.company}
              {exp.location ? <span className="text-muted font-sans font-light"> · {exp.location}</span> : ""}
            </p>
          </div>
        </div>

        {/* Bullets list */}
        <ul className="space-y-2 mb-5 list-none">
          {exp.bullets.map((bullet, i) => (
            <li
              key={i}
              className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-accent-orange"
            >
              {bullet}
            </li>
          ))}
        </ul>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {exp.tags.map((tag) => (
            <Chip key={tag} className="chip-glow text-[10px] py-0.5 px-2">
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ExperienceSection({ compact }: { compact?: boolean }) {
  const { cv } = useCVData();
  const headRef = useScrollReveal<HTMLDivElement>({ variant: "fadeUp" });
  const list = compact ? cv.experiences.slice(0, 2) : cv.experiences;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div ref={headRef}>
        <SectionLabel label="Work" heading="Experience" />
      </div>
      <div className="border border-rule rounded divide-y divide-rule bg-surface overflow-hidden">
        {list.map((exp, i) => (
          <ExperienceCard key={exp.id} exp={exp} index={i} />
        ))}
      </div>
    </section>
  );
}
