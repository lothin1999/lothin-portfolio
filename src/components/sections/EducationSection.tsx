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
        { opacity: 0, y: 50, rotateX: 8 },
        {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.7,
          delay: index * 0.1,
          ease: "power3.out",
          transformOrigin: "top center",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );

      gsap.fromTo(el.querySelectorAll(".edu-course"),
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1, scale: 1, duration: 0.25, stagger: 0.03, delay: index * 0.1 + 0.4,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [index]);

  return (
    <article
      ref={ref}
      className="grad-card grid grid-cols-[90px_1fr] gap-x-7 p-5 mb-4 border border-rule bg-surface max-sm:grid-cols-1 max-sm:gap-y-2"
    >
      <div>
        <span className="inline-block font-mono text-[11px] text-muted bg-tag-bg px-2 py-0.5 rounded">
          {edu.period}
        </span>
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-ink mb-0.5">{edu.degree}</h3>
        <p className="font-mono text-[12px] text-accent tracking-[0.3px] mb-3">
          {edu.school}{edu.location ? ` · ${edu.location}` : ""}
        </p>
        <p className="text-[14px] text-ink2 font-light leading-[1.7] mb-3">{edu.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {edu.courses.map((course) => (
            <span key={course} className="edu-course">
              <Chip className="chip-glow">{course}</Chip>
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function EducationSection() {
  const { cv } = useCVData();
  const headRef = useScrollReveal<HTMLDivElement>({ variant: "fadeRight" });
  return (
    <section className="max-w-content mx-auto px-6 py-16 border-b border-rule">
      <div ref={headRef}><SectionLabel label="Background" heading="Education" /></div>
      <div>{cv.educations.map((edu, i) => <EducationCard key={edu.id} edu={edu} index={i} />)}</div>
    </section>
  );
}
