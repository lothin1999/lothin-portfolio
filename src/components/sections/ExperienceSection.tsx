"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCVData } from "@/hooks/useCVData";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Chip } from "@/components/ui/Chip";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Experience } from "@/types/cv";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, x: index % 2 === 0 ? -40 : 40, y: 20 },
        {
          opacity: 1, x: 0, y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );

      // Animate the period badge
      gsap.fromTo(el.querySelector(".exp-period"),
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1, scale: 1, duration: 0.5, delay: 0.2,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );

      // Stagger bullets
      gsap.fromTo(el.querySelectorAll(".exp-bullet"),
        { opacity: 0, x: -16 },
        {
          opacity: 1, x: 0, duration: 0.4, stagger: 0.08, delay: 0.3,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );

      // Stagger tags
      gsap.fromTo(el.querySelectorAll(".exp-tag"),
        { opacity: 0, y: 8, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.05, delay: 0.5,
          ease: "back.out(1.2)",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [index]);

  return (
    <article
      ref={ref}
      className="grad-card grid grid-cols-[100px_1fr] gap-x-7 py-7 px-5 mb-4 border border-rule bg-surface max-sm:grid-cols-1 max-sm:gap-y-2"
    >
      <div className="exp-period pt-0.5">
        <span className="inline-block font-mono text-[11px] text-muted leading-[1.6] bg-tag-bg px-2 py-0.5 rounded">
          {exp.period}
        </span>
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-ink mb-0.5">{exp.title}</h3>
        <p className="font-mono text-[12px] text-accent tracking-[0.3px] mb-4">
          {exp.company}{exp.location ? ` · ${exp.location}` : ""}
        </p>
        <ul className="space-y-2 mb-4 list-none">
          {exp.bullets.map((bullet, i) => (
            <li key={i} className="exp-bullet text-[14px] text-ink2 leading-[1.7] font-light pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-accent2">
              {bullet}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5">
          {exp.tags.map((tag) => (
            <span key={tag} className="exp-tag">
              <Chip className="chip-glow">{tag}</Chip>
            </span>
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
    <section className="max-w-content mx-auto px-6 py-16 border-b border-rule">
      <div ref={headRef}><SectionLabel label="Work" heading="Experience" /></div>
      <div className="space-y-1">
        {list.map((exp, i) => <ExperienceCard key={exp.id} exp={exp} index={i} />)}
      </div>
    </section>
  );
}
