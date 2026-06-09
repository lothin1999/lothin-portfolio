"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

interface SectionLabelProps {
  label: string;
  heading: string;
  className?: string;
}

export function SectionLabel({ label, heading, className }: SectionLabelProps) {
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the line growing first
      gsap.fromTo(lineRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1, opacity: 1, duration: 0.5, ease: "power2.out",
          transformOrigin: "left center",
          scrollTrigger: { trigger: labelRef.current, start: "top 90%", toggleActions: "play none none none" },
        }
      );
      // Then label text
      gsap.fromTo(labelRef.current,
        { opacity: 0, x: -10 },
        {
          opacity: 1, x: 0, duration: 0.5, delay: 0.2, ease: "power2.out",
          scrollTrigger: { trigger: labelRef.current, start: "top 90%", toggleActions: "play none none none" },
        }
      );
      // Heading fans in
      gsap.fromTo(headRef.current,
        { opacity: 0, y: 20, skewX: -2 },
        {
          opacity: 1, y: 0, skewX: 0, duration: 0.65, delay: 0.25,
          ease: "power3.out",
          scrollTrigger: { trigger: headRef.current, start: "top 90%", toggleActions: "play none none none" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className={cn("mb-10", className)}>
      <p ref={labelRef} className="flex items-center gap-2.5 font-mono text-[11px] tracking-[2.5px] uppercase text-accent mb-2">
        <span ref={lineRef} className="w-5 h-px bg-accent shrink-0 inline-block" />
        {label}
      </p>
      <h2 ref={headRef} className="font-serif text-[34px] font-normal text-ink">{heading}</h2>
    </div>
  );
}
