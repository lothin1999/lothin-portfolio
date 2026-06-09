"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCVData } from "@/hooks/useCVData";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowUpRight } from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const { cv } = useCVData();
  const { profile, references } = cv;
  const headRef = useScrollReveal<HTMLDivElement>({ variant: "fadeUp" });
  const refsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Stagger reference cards
  useEffect(() => {
    const el = refsRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(".ref-card"),
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5, stagger: 0.12,
          ease: "back.out(1.2)",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [references]);

  // Contact card slide in from right
  useEffect(() => {
    const el = contactRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, x: 40 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        }
      );
      gsap.fromTo(el.querySelectorAll(".contact-item"),
        { opacity: 0, x: 16 },
        {
          opacity: 1, x: 0, duration: 0.35, stagger: 0.07, delay: 0.3,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  // Language rows reveal
  useEffect(() => {
    const el = langRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(".lang-row"),
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0, duration: 0.4, stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [profile.languages]);

  return (
    <section className="max-w-content mx-auto px-6 py-16">
      <div ref={headRef}><SectionLabel label="Get in touch" heading="About" /></div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-12 items-start">
        {/* Left column */}
        <div>
          {/* Bio */}
          <div className="space-y-4 text-[15px] text-ink2 font-light leading-[1.8] mb-10">
            <p>I&apos;m {profile.name.first}, a {profile.title} based in {profile.location} with 3+ years of experience building production systems across the full stack.</p>
            <p>{profile.summary}</p>
            <p>Currently open to new opportunities and collaborations.</p>
          </div>

          {/* Languages */}
          <div className="mb-10" ref={langRef}>
            <p className="flex items-center gap-2 font-mono text-[11px] tracking-[2px] uppercase text-accent mb-4">
              <span className="w-4 h-px bg-accent" /> Languages
            </p>
            <div className="border-t border-rule">
              {profile.languages.map((lang) => (
                <div key={lang.name} className="lang-row flex items-center justify-between py-3 border-b border-rule">
                  <span className="text-[13.5px] text-ink">{lang.name}</span>
                  <span className="font-mono text-[11px] text-muted tracking-wide">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* References */}
          {references.length > 0 && (
            <div ref={refsRef}>
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[2px] uppercase text-accent mb-4">
                <span className="w-4 h-px bg-accent" /> References
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {references.map((ref) => (
                  <div key={ref.name} className="ref-card grad-card border border-rule bg-surface p-5">
                    <p className="text-[14px] font-semibold text-ink mb-1">{ref.name}</p>
                    <p className="font-mono text-[10.5px] tracking-[1px] uppercase text-accent leading-[1.6] mb-3">
                      {ref.role} · {ref.company}
                    </p>
                    <p className="text-[13px] text-muted">{ref.contact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact card */}
        <div ref={contactRef}
          className="grad-card border border-rule bg-surface overflow-hidden lg:sticky lg:top-[74px]">
          <div className="px-4 py-3 bg-tag-bg border-b border-rule">
            <p className="font-mono text-[10.5px] tracking-[2px] uppercase text-muted">Contact</p>
          </div>
          <div className="p-4 space-y-4">
            {[
              { label: "Location", value: profile.location, href: null },
              { label: "Website", value: profile.website.replace("https://", ""), href: profile.website },
              { label: "Telegram", value: profile.telegramHandle, href: profile.telegram },
              { label: "Phone", value: profile.phones.filter(Boolean).join(" / "), href: null },
              { label: "LinkedIn", value: "linkedin.com/in/lothin-dev", href: profile.linkedin },
            ].filter(item => item.value).map((item) => (
              <div key={item.label} className="contact-item">
                <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted mb-0.5">{item.label}</p>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer"
                    className="text-[13px] text-accent hover:underline inline-flex items-center gap-0.5">
                    {item.value}<ArrowUpRight size={11} />
                  </a>
                ) : (
                  <p className="text-[13px] text-ink break-all">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
