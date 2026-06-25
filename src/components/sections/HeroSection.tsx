"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Glyph } from "@/components/ui/Glyph";
import { useCVData } from "@/hooks/useCVData";
import { ThreeCube } from "@/components/ui/ThreeCube";

export function HeroSection() {
  const { cv, isLoading } = useCVData();
  const { profile } = cv;
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      gsap.set([
        ".hero-eyebrow", ".hero-name", ".hero-tagline",
        ".hero-desc", ".hero-chip", ".hero-cta", ".hero-glyph"
      ], { opacity: 0, y: 15 });

      tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.5 })
        .to(".hero-name", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
        .to(".hero-tagline", { opacity: 1, y: 0, duration: 0.4 }, "-=0.4")
        .to(".hero-desc", { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
        .to(".hero-glyph", { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
        .to(".hero-chip", { opacity: 1, y: 0, duration: 0.3, stagger: 0.04 }, "-=0.2")
        .to(".hero-cta", { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.2");
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);

  const heroChips = cv.skillGroups.flatMap(g => g.skills).slice(0, 8);

  if (isLoading) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="space-y-4 animate-pulse">
          <div className="h-3 w-48 bg-rule rounded" />
          <div className="h-16 w-72 bg-rule rounded" />
          <div className="h-3 w-32 bg-rule rounded" />
          <div className="h-20 w-full max-w-lg bg-rule rounded" />
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-6 w-20 bg-rule rounded" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 flex flex-col items-start">
          <p className="hero-eyebrow flex items-center gap-2 font-mono text-[11px] tracking-[2px] uppercase text-accent mb-4">
            <span className="w-5 h-px bg-accent inline-block" />
            {profile.title} · {profile.location}
          </p>

          <h1 className="hero-name font-serif text-[clamp(44px,7vw,68px)] font-normal leading-[1.05] tracking-[-0.02em] text-ink mb-4">
            Hello, I'm{" "}
            <em className="not-italic italic text-accent-orange">
              <ScrambleText text={profile.name.first} delay={300} duration={800} />
            </em>
            <br />
            {profile.name.last}.
          </h1>

          <p className="hero-tagline font-mono text-[11.5px] tracking-[1px] uppercase text-muted mb-6">
            {profile.tagline}
          </p>

          <p className="hero-desc text-[15px] text-ink2 leading-relaxed max-w-[580px] font-sans font-light mb-8">
            {profile.summary}
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {heroChips.map((chip) => (
              <span key={chip} className="hero-chip">
                <Chip className="chip-glow">{chip}</Chip>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta link-underline inline-flex items-center gap-1.5 px-4 py-2 border border-rule text-ink text-xs font-mono rounded bg-surface transition-all hover:border-ink hover:shadow-sm"
            >
              <ArrowUpRight size={13} />
              {profile.website.replace("https://", "")}
            </a>
            {profile.telegram && (
              <a
                href={profile.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-cta link-underline inline-flex items-center gap-1.5 px-4 py-2 border border-rule text-ink text-xs font-mono rounded bg-surface transition-all hover:border-ink hover:shadow-sm"
              >
                Telegram
              </a>
            )}
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-cta link-underline inline-flex items-center gap-1.5 px-4 py-2 border border-rule text-ink text-xs font-mono rounded bg-surface transition-all hover:border-ink hover:shadow-sm"
              >
                LinkedIn
              </a>
            )}
            {profile.facebook && (
              <a
                href={profile.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-cta link-underline inline-flex items-center gap-1.5 px-4 py-2 border border-rule text-ink text-xs font-mono rounded bg-surface transition-all hover:border-ink hover:shadow-sm"
              >
                Facebook
              </a>
            )}
          </div>
        </div>

        {/* Right side graphical representation */}
        <div className="lg:col-span-4 flex justify-start lg:justify-end items-center h-full hero-glyph w-full">
          <div className="relative w-full max-w-[420px] h-[320px] sm:h-[400px] group">
            {profile.photoUrl ? (
              <>
                {/* Tech Dot-Grid Accent Background */}
                <div 
                  className="absolute inset-0 border border-rule rounded bg-[radial-gradient(var(--rule-solid)_1.5px,transparent_1.5px)] [background-size:12px_12px] translate-x-3 translate-y-3 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:translate-y-1"
                  aria-hidden="true"
                />
                
                {/* Main Image Container */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded border border-rule bg-surface transition-transform duration-300 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1 shadow-sm">
                  <img
                    src={profile.photoUrl}
                    alt={`${profile.name.first} ${profile.name.last}`}
                    className="object-cover w-full h-full transition-all duration-300 scale-100 group-hover:scale-[1.02]"
                  />
                  
                  {/* Technological Bracket Corners */}
                  <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-accent/60 opacity-60 transition-all duration-300 group-hover:top-2 group-hover:left-2" />
                  <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-accent/60 opacity-60 transition-all duration-300 group-hover:top-2 group-hover:right-2" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-accent/60 opacity-60 transition-all duration-300 group-hover:bottom-2 group-hover:left-2" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-accent/60 opacity-60 transition-all duration-300 group-hover:bottom-2 group-hover:right-2" />
                  
                  {/* Monospace Metadata Tag */}
                  <span className="absolute bottom-3 right-4 font-mono text-[9px] text-muted/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none uppercase tracking-wider">
                    // sys.photo_loaded
                  </span>
                </div>
              </>
            ) : (
              <ThreeCube images={profile.cubeImages || []} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
