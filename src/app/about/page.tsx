import type { Metadata } from "next";
import Link from "next/link";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
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
    title: "About",
    description:
      "Thoeun Lothin — Full-Stack Web Developer based in Phnom Penh, Cambodia. 3+ years building production platforms, payment gateways, and enterprise systems.",
    path: "/about",
  });
}

export default async function AboutPage() {
  const cv = await getCVData();
  const { profile, experiences, skillGroups, references } = cv;

  return (
    <div className="bg-bg min-h-screen">
      <ActivePathBridge segment="about" />

      {/* Page Header */}
      <header className="border-b border-rule py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[10.5px] tracking-[2.5px] uppercase text-accent mb-3 flex items-center gap-2.5 font-semibold">
            <span className="w-5 h-px bg-accent shrink-0 inline-block" />
            01 // page.about
          </p>
          <h1 className="font-serif text-[clamp(48px,8vw,78px)] font-normal text-ink leading-none tracking-tight">
            About
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-[2px] mt-4">
            // phnom penh, cambodia · full-stack web developer
          </p>
        </div>
      </header>

      {/* Quick intro and Stats strip */}
      <section className="border-b border-rule bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <p className="text-[16px] text-ink2 font-sans font-light leading-relaxed max-w-3xl">
              From building billiard table session tracking tools in Phnom Penh to leading full-stack upgrades through three major framework versions. 3+ years building production systems with a focus on code structure and edge optimization.
            </p>
          </div>
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            {[
              { val: "3+ Years", label: "Experience" },
              { val: "10+", label: "Live Projects" },
              { val: "3", label: "Nuxt Migrations" },
              { val: "25+", label: "Provinces filtered" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5 border-l border-rule pl-4">
                <span className="font-serif text-[24px] text-ink font-semibold leading-none">{stat.val}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 // section.story */}
      <section className="border-b border-rule py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              02 // section.story
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              My Story
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Biography text */}
            <div className="lg:col-span-8 space-y-5 text-[14.5px] text-ink2 font-sans font-light leading-relaxed">
              <p>
                I&apos;m a <strong className="font-semibold text-ink">Full-Stack Web Developer</strong> and Technical Lead. I help teams untangle system complexity so their applications can load fast, support rich features, and remain clean enough to evolve.
              </p>
              <p>
                I studied Software Development in Phnom Penh, learning algorithms, data structures, OOP, and software engineering. I learned to think in systems: every directory, schema, and API boundary is a gear in a larger machine. That mindset followed me directly into my professional career.
              </p>
              <p>
                My first major project involved CRM, hotel, and session-billing billiard table tracking systems. Building under real-world timing and synchronization constraints taught me to design fail-safe WebSockets channels and optimize transactional SQL queries. When I saw clients actually using the table booking systems to manage their operations, I knew I wanted to focus on building critical production tools.
              </p>
              <p>
                Later, I worked on Cambodia&apos;s nationwide AALL rental marketplace, introducing Nuxt 4 SSR, and leading the full upgrade path of an enterprise POS system through three major Nuxt versions. I focus on BEM CSS architecture, edge database performance, and Cambodia-native Bakong KHQR checkout flows to deliver smooth digital experiences.
              </p>
            </div>

            {/* Right side contact information card */}
            <div className="lg:col-span-4 border border-rule bg-surface rounded overflow-hidden sticky top-[20px] hover:border-ink transition-colors duration-200">
              <div className="px-5 py-3.5 bg-tag-bg border-b border-rule">
                <p className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-ink font-semibold">// contact.info</p>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: "Location", value: profile.location, href: null },
                  { label: "Website", value: profile.website.replace("https://", ""), href: profile.website },
                  { label: "Telegram", value: profile.telegramHandle, href: profile.telegram },
                  { label: "Phone", value: profile.phones.join(" / "), href: null },
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
        </div>
      </section>

      {/* // system.stack */}
      <section className="border-b border-rule py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-6 font-semibold">
            // system.stack
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {skillGroups.map((group) => (
              <div key={group.label} className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200">
                <h3 className="font-mono text-[11px] uppercase tracking-wider text-accent font-semibold mb-3">
                  {group.label}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <Chip key={skill} className="text-[10px] py-0.5 px-2">
                      {skill}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 // section.principles */}
      <section className="border-b border-rule py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              03 // section.principles
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              How I Think About Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Systems over features",
                desc: "Good architecture ensures your developers add features without fighting the codebase. I write strict types, clean contracts, and keep directory modules simple. That way, code stays testable and time-to-ship drops.",
              },
              {
                title: "Clarity over cleverness",
                desc: "Clever code causes maintenance issues. Nested ternary operations, pre-rendered components with complex hydrates, and multi-layered configurations break easily. I choose boring, predictable code that team members can understand in minutes.",
              },
              {
                title: "Business context matters",
                desc: "Technical decisions are business decisions. Choosing a stack or setting up edge infrastructure must solve real visitor drag or operational latency. I always ask what a technical decision means for the company first.",
              },
            ].map((principle) => (
              <div key={principle.title} className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200">
                <h3 className="font-serif text-lg text-ink font-semibold mb-2">{principle.title}</h3>
                <p className="text-[13px] text-ink2 leading-relaxed font-sans font-light">{principle.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* // section.boundaries */}
      <section className="border-b border-rule py-16 bg-[var(--color-surface-subtle)]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-6 font-semibold">
            // section.boundaries
          </p>
          <div className="max-w-3xl space-y-4">
            <h3 className="font-serif text-2xl text-ink font-normal mb-4">What I Don&apos;t Do</h3>
            <ul className="list-none space-y-3 pl-4">
              {[
                "Tutorial-level hand-holding: I point team members to clean code paths, but expect developers to build problem-solving skills.",
                "Quick feature patches: Writing code without understanding the system it lives in builds technical debt that we&apos;ll have to pay back later.",
                "Projects without clear objectives: I need a defined metric of success — loading speed, user conversions, or operational metrics — to optimize correctly.",
                "Teams not ready for change: If 'we&apos;ve always done it this way' is the final answer, we won&apos;t be a good fit.",
              ].map((boundary) => (
                <li
                  key={boundary.split(":")[0]}
                  className="text-[14px] text-ink2 leading-relaxed pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-accent-orange font-sans font-light"
                >
                  <strong className="font-medium text-ink">{boundary.split(":")[0]}:</strong>{boundary.split(":")[1]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 04 // section.career */}
      <section className="border-b border-rule py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              04 // section.career
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              Career Commits
            </h2>
          </div>

          <div className="relative border-l border-rule pl-6 md:pl-8 ml-3 space-y-12">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-3 h-3 rounded-full border-2 border-accent bg-bg group-hover:bg-accent transition-colors" />

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <h3 className="text-[16px] font-sans font-medium text-ink leading-tight">
                      {exp.title}
                    </h3>
                    <span className="font-mono text-[11px] text-muted uppercase shrink-0">
                      {exp.period}
                    </span>
                  </div>

                  <p className="font-mono text-[12px] text-accent font-semibold">
                    {exp.company} · <span className="font-sans font-light text-muted">{exp.location}</span>
                  </p>

                  <ul className="space-y-2 mt-2 list-none">
                    {exp.bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-accent-orange"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {exp.tags.map((tag) => (
                      <Chip key={tag} className="text-[10px] py-0.5 px-2 bg-tag-bg border border-rule text-tag-text">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Academic background commit */}
            {cv.educations.map((edu) => (
              <div key={edu.id} className="relative group">
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-3 h-3 rounded-full border-2 border-muted bg-bg group-hover:bg-muted transition-colors" />

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <h3 className="text-[16px] font-sans font-medium text-ink leading-tight">
                      {edu.degree}
                    </h3>
                    <span className="font-mono text-[11px] text-muted uppercase shrink-0">
                      {edu.period}
                    </span>
                  </div>

                  <p className="font-mono text-[12px] text-muted font-semibold">
                    {edu.school} · <span className="font-sans font-light text-muted">{edu.location}</span>
                  </p>

                  <p className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light mt-1 pl-4 relative before:content-['◈'] before:absolute before:left-0 before:text-accent-orange">
                    {edu.description}
                  </p>

                  {edu.courses.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {edu.courses.map((course) => (
                        <Chip key={course} className="text-[10px] py-0.5 px-2 bg-tag-bg border border-rule text-tag-text">
                          {course}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* References section */}
      {references.length > 0 && (
        <section className="border-b border-rule py-16 bg-[var(--color-surface-subtle)]">
          <div className="max-w-6xl mx-auto px-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-6 font-semibold">
              // references
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {references.map((ref) => (
                <div key={ref.name} className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200">
                  <h4 className="text-[14px] font-sans font-semibold text-ink mb-1">{ref.name}</h4>
                  <p className="font-mono text-[11px] text-accent mt-0.5 mb-3">{ref.role} · {ref.company}</p>
                  <p className="font-mono text-[11.5px] text-muted">{ref.contact}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 text-center">
        <div className="max-w-md mx-auto px-6 flex flex-col items-center gap-4">
          <Glyph pattern="010111010" hoverPattern="111111111" size={42} gap={3} color="var(--accent)" />
          <h2 className="font-serif text-[28px] text-ink leading-tight mt-2">
            Want to see how we can build together?
          </h2>
          <p className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light max-w-sm">
            I take on select clients at a time. If your team has core system debt or framework integration issues, reach out.
          </p>
          <Link
            href="/contact"
            className="mt-4 px-6 py-2.5 font-mono text-[11.5px] uppercase tracking-wider text-ink border border-rule hover:border-ink rounded bg-surface hover:bg-[var(--color-surface-subtle)] transition-all inline-block"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
