"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCVData } from "@/hooks/useCVData";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Education } from "@/types/cv";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

function EducationCard({ edu, index }: { edu: Education; index: number }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: 25 },
        {
          opacity: 1, y: 0,
          duration: 0.55,
          delay: index * 0.05,
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
      {/* Period column */}
      <div className="md:col-span-3">
        <span className="font-mono text-[11px] text-muted tracking-wider leading-none uppercase">
          {edu.period}
        </span>
      </div>

      {/* Main info column */}
      <div className="md:col-span-9 flex flex-col gap-2">
        <div>
          <h3 className="text-[16px] font-sans font-medium text-ink leading-tight">
            {edu.degree}
          </h3>
          <p className="font-mono text-[12px] text-accent tracking-[0.3px] mt-0.5">
            {edu.school}
            {edu.location ? <span className="text-muted font-sans font-light"> · {edu.location}</span> : ""}
          </p>
        </div>

        <p className="text-[13.5px] text-ink2 font-sans font-light leading-relaxed">
          {edu.description}
        </p>

        {/* Courses */}
        {edu.courses && edu.courses.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {edu.courses.map((course) => (
              <Chip key={course} className="chip-glow text-[10px] py-0.5 px-2">
                {course}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function EducationSection() {
  const { cv } = useCVData();
  const headRef = useScrollReveal<HTMLDivElement>({ variant: "fadeUp" });

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div ref={headRef}>
        <SectionLabel label="Background" heading="Education" />
      </div>
      <div className="border border-rule rounded divide-y divide-rule bg-surface overflow-hidden">
        {cv.educations.map((edu, i) => (
          <EducationCard key={edu.id} edu={edu} index={i} />
        ))}
      </div>
    </section>
  );
}
