import type { Metadata } from "next";
import Link from "next/link";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata, portfolioJsonLd, breadcrumbsJsonLd } from "@/lib/seo";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Glyph } from "@/components/ui/Glyph";
import { Chip } from "@/components/ui/Chip";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Work",
    description:
      "3+ years of full-stack development experience building nationwide rental platforms, enterprise POS, banking, and loan systems in Cambodia with Vue/Nuxt, React/Next.js, Angular, NestJS, Laravel, and Spring Boot.",
    path: "/portfolio",
  });
}

export default async function PortfolioPage() {
  const cv = await getCVData();
  const { experiences } = cv;

  // Icons patterns for the nodes
  const JOB_GLYPHS = [
    "101111101",
    "111010111",
    "010111010",
  ];

  const jsonLdData = [
    portfolioJsonLd(cv),
    breadcrumbsJsonLd([
      { name: "Home", path: "/" },
      { name: "Work", path: "/portfolio" }
    ])
  ];

  return (
    <div className="bg-bg min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <ActivePathBridge segment="work" />

      {/* Page Header */}
      <header className="border-b border-rule py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[10.5px] tracking-[2.5px] uppercase text-accent mb-3 flex items-center gap-2.5 font-semibold">
            <span className="w-5 h-px bg-accent shrink-0 inline-block" />
            01 // page.portfolio
          </p>
          <h1 className="font-serif text-[clamp(48px,8vw,78px)] font-normal text-ink leading-none tracking-tight">
            Work
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-[2px] mt-4">
            {cv.adminSettings?.portfolioSubtext || "// production.systems · performance.caching · edge.infrastructure"}
          </p>
        </div>
      </header>

      {/* Banner */}
      <section className="border-b border-rule bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {(cv.adminSettings?.portfolioStats || [
            { val: "3+", label: "Years Experience" },
            { val: "10+", label: "Projects Live" },
            { val: "3", label: "Nuxt Migrations" },
            { val: "Edge SSR", label: "Runtime Target" },
          ]).map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-serif text-[clamp(28px,4vw,40px)] text-ink leading-none">
                {stat.val}
              </span>
              <span className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 02 // section.featured */}
      <section className="border-b border-rule py-16" aria-labelledby="featured-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-10">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              02 // section.featured
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="featured-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              Featured Projects
            </h2>
          </div>

          <div className="space-y-12">
            {experiences.map((exp, index) => {
              const glyphPattern = JOB_GLYPHS[index % JOB_GLYPHS.length];
              return (
                <article
                  key={exp.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8 border border-rule bg-surface rounded hover:border-ink transition-colors duration-200"
                >
                  {/* Left Column: Metadata */}
                  <div className="lg:col-span-3 flex lg:flex-col items-start gap-4 justify-between lg:justify-start">
                    <div>
                      <span className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">
                        {exp.period}
                      </span>
                      <span className="font-mono text-[12px] text-accent font-semibold block">
                        {exp.company}
                      </span>
                      <span className="font-sans text-[11px] text-muted block mt-0.5">
                        {exp.location}
                      </span>
                    </div>
                    <div className="hidden lg:block mt-6">
                      <Glyph
                        pattern={glyphPattern}
                        hoverPattern="111111111"
                        size={36}
                        gap={2.5}
                        color="var(--accent)"
                      />
                    </div>
                  </div>

                  {/* Right Column: Detailed Context and Bullets */}
                  <div className="lg:col-span-9 flex flex-col">
                    <h3 className="text-xl md:text-2xl font-serif text-ink font-normal mb-4">
                      {exp.title}
                    </h3>

                    <ul className="space-y-3 mb-6 list-none">
                      {exp.bullets.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-accent-orange"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {exp.tags.map((tag) => (
                        <Chip key={tag} className="text-[10px] py-0.5 px-2 bg-tag-bg border border-rule text-tag-text">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* study-areas or frameworks */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-8 font-semibold">
            // technical.ecosystems
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(cv.adminSettings?.portfolioEcosystems || [
              {
                title: "Vue & Nuxt Architecture",
                desc: "Migrating enterprise-scale applications through Nuxt versions 2, 3, and 4. Specialized in composable structure, server-side caching policies, and performance validation.",
              },
              {
                title: "Next.js & React Applications",
                desc: "Wired for Next.js App Router, React Server Components (RSC), and edge runtimes. Integrating state-management layers and strict API type validation.",
              },
              {
                title: "Backend Frameworks & databases",
                desc: "Setting up NestJS, Laravel, and Spring Boot REST APIs with PostgreSQL, MySQL, and database abstractions (Prisma). Handling authentication payloads securely.",
              },
            ]).map((item) => (
              <div key={item.title} className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200">
                <h3 className="font-serif text-lg text-ink font-semibold mb-2">{item.title}</h3>
                <p className="text-[13px] text-ink2 leading-relaxed font-sans font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Let's Talk CTA */}
      <section className="border-t border-rule py-20 bg-[var(--color-surface-subtle)] text-center">
        <div className="max-w-xl mx-auto px-6 flex flex-col items-center gap-4">
          <Glyph pattern="010111010" hoverPattern="111111111" size={42} gap={3} color="var(--accent-orange)" />
          <h2 className="font-serif text-[28px] text-ink leading-tight mt-2">
            {cv.adminSettings?.portfolioCta?.title || "Interested in building together?"}
          </h2>
          <p className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light max-w-sm">
            {cv.adminSettings?.portfolioCta?.desc || "I take on select project scopes at a time. If you have code architecture complexity or framework migration needs, let's talk."}
          </p>
          <Link
            href={cv.adminSettings?.portfolioCta?.buttonHref || "/contact"}
            className="mt-4 px-6 py-2.5 font-mono text-[11.5px] uppercase tracking-wider text-ink border border-rule hover:border-ink rounded bg-surface hover:bg-[var(--color-surface-subtle)] transition-all inline-block"
          >
            {cv.adminSettings?.portfolioCta?.buttonText || "Schedule a conversation"}
          </Link>
        </div>
      </section>
    </div>
  );
}
