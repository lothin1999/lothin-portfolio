import type { Metadata } from "next";
import Link from "next/link";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { Glyph } from "@/components/ui/Glyph";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Services",
    description: "High-end full-stack consulting, custom web development, tech advisory, and payment integration services for founders and teams.",
    path: "/services",
  });
}

export default async function ServicesPage() {
  const cv = await getCVData();

  return (
    <div className="bg-bg min-h-screen">
      <ActivePathBridge segment="services" />

      {/* Page Header */}
      <header className="border-b border-rule py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[10.5px] tracking-[2.5px] uppercase text-accent mb-3 flex items-center gap-2.5 font-semibold">
            <span className="w-5 h-px bg-accent shrink-0 inline-block" />
            01 // page.services
          </p>
          <h1 className="font-serif text-[clamp(48px,8vw,78px)] font-normal text-ink leading-none tracking-tight">
            Services
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-[2px] mt-4">
            {cv.adminSettings?.servicesSubtext || "// full-stack.consulting · tech.advisory · system.integrations"}
          </p>
        </div>
      </header>

      {/* Intro section */}
      <section className="border-b border-rule bg-surface py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[16px] text-ink2 font-sans font-light leading-relaxed max-w-2xl">
            {cv.adminSettings?.servicesIntro || "Most teams I talk to know their full-stack platform feels sluggish or complicated. They just haven't figured out where the performance bottleneck actually starts."}
          </p>
        </div>
      </section>

      {/* 02 // section.offerings */}
      <section className="border-b border-rule py-16" aria-labelledby="offerings-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-10">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              02 // section.offerings
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="offerings-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              How I Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(cv.adminSettings?.servicesOfferings || [
              {
                title: "High-End Full-Stack Consulting",
                label: "Finding what your system is hiding",
                desc: "I audit your application rendering logic, state stores, and database schemas. I locate query bottlenecks, bloated payloads, and provide a clear, step-by-step optimization plan.",
              },
              {
                title: "Custom Web Development",
                label: "Platforms your team can maintain",
                desc: "I build responsive frontend clients in Vue/Nuxt, React/Next, and Angular, wired into NestJS, Laravel, or Spring Boot REST APIs with strict TypeScript contracts.",
              },
              {
                title: "Long-Term Technical Advisory",
                label: "A full-stack lead on call",
                desc: "Get ongoing access to someone who thinks about software architecture, package upgrades, security hardening, and database structures for a living, without hiring full-time.",
              },
              {
                title: "Core System & Payment Integrations",
                label: "Wiring secure transaction pipelines",
                desc: "Implement Cambodia-native Bakong KHQR checkouts (signature checks, deep links, webhooks), real-time booking status Pusher logs, and Firebase user management workflows.",
              },
            ]).map((offering) => (
              <div key={offering.title} className="border border-rule bg-surface p-6 rounded flex flex-col hover:border-ink transition-colors duration-200">
                <span className="font-mono text-[10px] text-accent uppercase tracking-wider block mb-1">
                  {offering.label}
                </span>
                <h3 className="font-serif text-xl md:text-2xl text-ink font-normal mb-3">
                  {offering.title}
                </h3>
                <p className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light">
                  {offering.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 // section.why */}
      <section className="border-b border-rule py-16 bg-[var(--color-surface-subtle)]" aria-labelledby="why-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-10">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              03 // section.why
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="why-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              Why Work With Me
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(cv.adminSettings?.servicesWhy || [
              {
                title: "Migration & Upgrade Experience",
                desc: "I have led large upgrade operations resolving breaking changes, from Nuxt 2 Options API to Nuxt 4 Composition patterns, and Laravel to NestJS backends. I don't just code; I guide teams through transitions.",
              },
              {
                title: "Systems Thinking",
                desc: "I analyze query paths, API contracts, and edge infrastructure, not just frontend styling. When database queries and components are unified, teams ship faster and build with confidence.",
              },
              {
                title: "Business Alignment",
                desc: "Technical decisions are business decisions. I evaluate choices based on whether they reduce server costs, improve checkout conversion rates, or cut maintenance debt.",
              },
              {
                title: "Real-World Results",
                desc: "From province-based rental filters covering 25+ Cambodian provinces to secure KHQR payment APIs processed successfully daily, I deliver production systems that scale.",
              },
            ]).map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <h3 className="font-serif text-lg text-ink font-semibold">{item.title}</h3>
                <p className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 // section.engagement */}
      <section className="border-b border-rule py-16" aria-labelledby="engagement-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-10">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              04 // section.engagement
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="engagement-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              Engagement Structure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(cv.adminSettings?.servicesEngagement || [
              {
                phase: "01",
                title: "Discovery & Diagnosis",
                desc: "I spend time reviewing your codebase, API layers, and database queries. I audit layout shifts, loading delays, and structure a clear plan outlining what requires remediation.",
                duration: "Typical duration: 2-3 weeks",
              },
              {
                phase: "02",
                title: "Implementation Partnership",
                desc: "I embed with your developers to write core code, rewrite state stores, establish strict typescript contracts, and deploy updated modules to production.",
                duration: "Typical duration: 1-3 months",
              },
              {
                phase: "03",
                title: "Ongoing Advisory",
                desc: "Regular check-ins, architectural advice, and someone to review release schedules. You get a technical lead on call whenever updates feel risky.",
                duration: "Typical duration: 3+ months",
              },
            ]).map((eng) => (
              <div key={eng.phase} className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200 flex flex-col">
                <span className="font-mono text-[24px] text-accent font-semibold mb-2">{eng.phase}</span>
                <h3 className="font-serif text-lg text-ink font-semibold mb-2">{eng.title}</h3>
                <p className="text-[13px] text-ink2 leading-relaxed font-sans font-light mb-6 flex-grow">{eng.desc}</p>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider block mt-auto border-t border-rule pt-3">
                  {eng.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-xl mx-auto px-6 flex flex-col items-center gap-4">
          <Glyph pattern="010111010" hoverPattern="111111111" size={42} gap={3} color="var(--accent-orange)" />
          <h2 className="font-serif text-[28px] text-ink leading-tight mt-2">
            {cv.adminSettings?.servicesCta?.title || "Start with a conversation"}
          </h2>
          <p className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light max-w-sm">
            {cv.adminSettings?.servicesCta?.desc || "Not sure which engagement fit your project? That is totally fine. We can discuss your current technical hurdles and figure it out together."}
          </p>
          <Link
            href={cv.adminSettings?.servicesCta?.buttonHref || "/contact"}
            className="mt-4 px-6 py-2.5 font-mono text-[11.5px] uppercase tracking-wider text-ink border border-rule hover:border-ink rounded bg-surface hover:bg-[var(--color-surface-subtle)] transition-all inline-block"
          >
            {cv.adminSettings?.servicesCta?.buttonText || "Schedule a conversation"}
          </Link>
        </div>
      </section>
    </div>
  );
}
