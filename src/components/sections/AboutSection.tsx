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
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [references]);

  // Contact card slide in
  useEffect(() => {
    const el = contactRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
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
        { opacity: 0, y: 10 },
        {
          opacity: 1, y: 0, duration: 0.45, stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [profile.languages]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div ref={headRef}>
        <SectionLabel label="Get in touch" heading="About" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Bio & details */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Bio paragraph */}
          <div className="space-y-4 text-[14.5px] text-ink2 font-sans font-light leading-relaxed">
            <p>
              I&apos;m {profile.name.first}, a {profile.title} based in {profile.location} with 3+ years of experience building production platforms and payment gateways across the full stack.
            </p>
            <p>{profile.summary}</p>
            <p>
              I specialize in writing maintainable backend infrastructure (NestJS, Spring Boot), constructing modular interfaces (Vue, Nuxt, React), and automating deployment processes in edge environments.
            </p>
          </div>

          {/* Languages panel */}
          <div ref={langRef} className="border border-rule bg-surface p-5 rounded">
            <h4 className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-ink font-semibold pb-2 border-b border-rule mb-2">// Languages</h4>
            <div className="divide-y divide-rule">
              {profile.languages.map((lang) => (
                <div key={lang.name} className="lang-row flex items-center justify-between py-2.5">
                  <span className="text-[13.5px] text-ink font-sans">{lang.name}</span>
                  <span className="font-mono text-[11px] text-muted">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* References panel */}
          {references.length > 0 && (
            <div ref={refsRef} className="flex flex-col gap-3">
              <h4 className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-ink font-semibold">// References</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {references.map((ref) => (
                  <div
                    key={ref.name}
                    className="ref-card border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200"
                  >
                    <p className="text-[14px] font-sans font-medium text-ink mb-1">
                      {ref.name}
                    </p>
                    <p className="font-mono text-[11px] text-accent mt-0.5 mb-2">
                      {ref.role} · {ref.company}
                    </p>
                    <p className="font-mono text-[11.5px] text-muted">
                      {ref.contact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Contact details card */}
        <div
          ref={contactRef}
          className="lg:col-span-4 border border-rule bg-surface rounded overflow-hidden lg:sticky lg:top-[74px] hover:border-ink transition-colors duration-200"
        >
          <div className="px-5 py-3.5 bg-tag-bg border-b border-rule">
            <p className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-ink font-semibold">// contact.info</p>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: "Location", value: profile.location, href: null },
              { label: "Website", value: profile.website.replace("https://", ""), href: profile.website },
              { label: "Telegram", value: profile.telegramHandle, href: profile.telegram },
              { label: "Phone", value: profile.phones.filter(Boolean).join(" / "), href: null },
              { label: "LinkedIn", value: "linkedin.com/in/lothin-dev", href: profile.linkedin },
            ].filter(item => item.value).map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className="font-mono text-[9px] tracking-[1.5px] uppercase text-muted">
                  {item.label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-accent hover:text-accent-orange inline-flex items-center gap-1 link-underline w-fit"
                  >
                    {item.value}
                    <ArrowUpRight size={11} className="shrink-0" />
                  </a>
                ) : (
                  <span className="text-[13px] text-ink2 font-sans font-light">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
