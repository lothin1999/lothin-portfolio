import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Chip } from "@/components/ui/Chip";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Skills",
    description:
      "Full-stack technical skills spanning Vue/Nuxt, React/Next.js, Angular, NestJS, Laravel, Spring Boot, PostgreSQL, MySQL, MongoDB, Docker, Cloudflare, Firebase, and Bakong KHQR payment integration.",
    path: "/skills",
  });
}

export default async function SkillsPage() {
  return (
    <div className="bg-bg min-h-screen">
      <ActivePathBridge segment="skills" />

      {/* Page Header */}
      <header className="border-b border-rule py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[11px] tracking-[2.5px] uppercase text-accent mb-3 flex items-center gap-2.5">
            <span className="w-5 h-px bg-accent shrink-0 inline-block" />
            Technical Stack
          </p>
          <h1 className="font-serif text-[clamp(48px,8vw,78px)] font-normal text-ink leading-none tracking-tight">
            <ScrambleText text="Skills" delay={100} duration={800} />
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-[2px] mt-4">
            // front-end · back-end · databases · devops · integrations
          </p>
        </div>
      </header>

      {/* Core highlights */}
      <section className="border-b border-rule py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-5">
            // Core Technologies
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Vue.js 3",
              "Nuxt 4",
              "React.js",
              "Next.js",
              "Angular",
              "TypeScript",
              "NestJS",
              "Laravel",
              "Spring Boot",
              "PostgreSQL",
              "MySQL",
              "Docker",
              "Cloudflare",
              "Firebase",
              "Bakong KHQR",
              "Prisma ORM",
              "Tailwind CSS",
              "Node.js",
            ].map((skill) => (
              <Chip key={skill} className="chip-glow text-[12px] py-1 px-3">
                {skill}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Grid */}
      <SkillsSection />

      {/* Proficiency Guide */}
      <section className="border-t border-rule py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-8 pb-3 border-b border-rule">
            // Proficiency Levels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                level: "Production-Ready",
                color: "var(--accent)",
                desc:
                  "Vue/Nuxt, React/Next, NestJS, Prisma, PostgreSQL, MySQL, Docker — used daily in enterprise projects.",
              },
              {
                level: "Proficient",
                color: "var(--accent-pink)",
                desc:
                  "Angular, Spring Boot, Laravel, MongoDB, Firebase — used in multiple completed projects.",
              },
              {
                level: "Familiar",
                color: "var(--accent-orange)",
                desc:
                  "Oracle DB, Oracle Apex, RxJS Signals, WebUSB — studied or used in smaller scoped work.",
              },
            ].map((item) => (
              <div
                key={item.level}
                className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200"
              >
                <p
                  className="font-mono text-[11px] tracking-[1.5px] uppercase font-semibold mb-2"
                  style={{ color: item.color }}
                >
                  {item.level}
                </p>
                <p className="text-[13px] text-ink2 font-sans font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
