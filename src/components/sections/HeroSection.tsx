"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { useCVData } from "@/hooks/useCVData";
import Image from "next/image";

export function HeroSection() {
  const { cv, isLoading } = useCVData();
  const { profile } = cv;
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Run animation AFTER cv data is loaded (not on first render when opacity-0)
  useEffect(() => {
    if (isLoading) return;           // wait for real data
    if (hasAnimated.current) return; // only once
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Set initial state explicitly first
      gsap.set([
        ".hero-eyebrow", ".hero-name", ".hero-tagline",
        ".hero-desc", ".hero-chip", ".hero-cta"
      ], { opacity: 0, y: 20 });

      tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.6 })
        .to(".hero-name",    { opacity: 1, y: 0, duration: 0.7 }, "-=0.3")
        .to(".hero-tagline", { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
        .to(".hero-desc",    { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
        .to(".hero-chip",    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }, "-=0.2")
        .to(".hero-cta",     { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.2");
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  const heroChips = cv.skillGroups.flatMap(g => g.skills).slice(0, 7);

  // While loading show skeleton shimmer so page isn't blank
  if (isLoading) {
    return (
      <section className="max-w-content mx-auto px-6 pt-20 pb-20 border-b border-rule">
        <div className="space-y-4 animate-pulse">
          <div className="h-3 w-48 bg-rule rounded" />
          <div className="h-16 w-72 bg-rule rounded" />
          <div className="h-3 w-32 bg-rule rounded" />
          <div className="h-20 w-full max-w-lg bg-rule rounded" />
          <div className="flex gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-6 w-20 bg-rule rounded" />
            ))}
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-40 bg-rule rounded" />
            <div className="h-10 w-28 bg-rule rounded" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="max-w-content mx-auto px-6 pt-20 pb-20 border-b border-rule">
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1">
          <p className="hero-eyebrow flex items-center gap-2.5 font-mono text-[11.5px] tracking-[2px] uppercase text-accent mb-5">
            <span className="w-7 h-px bg-accent" />
            {profile.title} · {profile.location}
          </p>

          <h1 className="hero-name font-serif text-[clamp(52px,10vw,78px)] font-normal leading-[1.02] tracking-[-0.5px] text-ink mb-3">
            <em className="not-italic italic text-accent">{profile.name.first}</em>
            <br />
            {profile.name.last}.
          </h1>

          <p className="hero-tagline font-mono text-[12px] tracking-[1.5px] uppercase text-muted mb-7">
            {profile.tagline}
          </p>

          <p className="hero-desc text-[15.5px] text-ink2 leading-[1.8] max-w-[520px] font-light mb-10">
            {profile.summary}
          </p>

          <div className="flex flex-wrap gap-2 mb-10">
            {heroChips.map((chip) => (
              <span key={chip} className="hero-chip">
                <Chip>{chip}</Chip>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
              className="hero-cta inline-flex items-center gap-1.5 px-5 py-2.5 bg-ink text-white text-[13px] font-medium rounded hover:bg-accent transition-colors">
              <ArrowUpRight size={14} />
              {profile.website.replace("https://", "")}
            </a>
            {profile.telegram && (
              <a href={profile.telegram} target="_blank" rel="noopener noreferrer"
                className="hero-cta inline-flex items-center gap-1.5 px-5 py-2.5 border border-rule text-ink text-[13px] font-medium rounded hover:border-ink hover:bg-tag-bg transition-colors">
                Telegram
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                className="hero-cta inline-flex items-center gap-1.5 px-5 py-2.5 border border-rule text-ink text-[13px] font-medium rounded hover:border-ink hover:bg-tag-bg transition-colors">
                LinkedIn
              </a>
            )}
          </div>
        </div>

        {profile.photoUrl && (
          <div className="hero-cta shrink-0 hidden sm:block">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-rule">
              <Image
                src={profile.photoUrl}
                alt={`${profile.name.first} ${profile.name.last}`}
                width={128} height={128}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
