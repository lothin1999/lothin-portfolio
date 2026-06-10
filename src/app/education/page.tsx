import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { EducationSection } from "@/components/sections/EducationSection";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { ScrambleText } from "@/components/ui/ScrambleText";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Education",
    description:
      "Bachelor of Science in Software Development from a university in Phnom Penh, Cambodia. 2019–2023. Studied algorithms, data structures, software architecture, OOP, and enterprise application development.",
    path: "/education",
  });
}

export default async function EducationPage() {
  return (
    <div className="bg-bg min-h-screen">
      <ActivePathBridge segment="education" />

      {/* Page Header */}
      <header className="border-b border-rule py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[11px] tracking-[2.5px] uppercase text-accent mb-3 flex items-center gap-2.5">
            <span className="w-5 h-px bg-accent shrink-0 inline-block" />
            Academic Background
          </p>
          <h1 className="font-serif text-[clamp(48px,8vw,78px)] font-normal text-ink leading-none tracking-tight">
            <ScrambleText text="Education" delay={100} duration={800} />
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-[2px] mt-4">
            // software development · 2019 → 2023 · phnom penh
          </p>
        </div>
      </header>

      {/* Key Facts Banner */}
      <section className="border-b border-rule bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "B.Sc.", label: "Degree Level" },
            { value: "2019", label: "Started" },
            { value: "2023", label: "Graduated" },
            { value: "S/W Dev", label: "Major" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-serif text-[clamp(24px,3.5vw,36px)] text-ink leading-none">
                {stat.value}
              </span>
              <span className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Education Cards */}
      <EducationSection />

      {/* Core Study Areas */}
      <section className="border-t border-rule py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-8 pb-3 border-b border-rule">
            // Core Study Areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                area: "Data Structures & Algorithms",
                desc: "Sorting, searching, trees, graphs, and complexity analysis — applied to real-world performance optimisation.",
                icon: "⟩",
              },
              {
                area: "Software Architecture",
                desc: "MVC, Clean Architecture, Domain-Driven Design, and layered application patterns for scalable enterprise systems.",
                icon: "◈",
              },
              {
                area: "Object-Oriented Programming",
                desc: "Encapsulation, inheritance, polymorphism, and SOLID principles practised in Java, PHP, and TypeScript.",
                icon: "⬡",
              },
              {
                area: "Database Systems",
                desc: "Relational modelling, SQL optimization, normalization, and introductory NoSQL concepts.",
                icon: "⊛",
              },
              {
                area: "Web Development",
                desc: "Full HTTP/REST protocol model, client-server interactions, HTML/CSS/JS rendering pipelines, and SPA frameworks.",
                icon: "◻",
              },
              {
                area: "Software Engineering",
                desc: "Agile/Scrum workflows, testing strategies, version control, code review, and team-based project management.",
                icon: "◈",
              },
            ].map((item) => (
              <div
                key={item.area}
                className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200"
              >
                <p className="font-mono text-[20px] text-accent mb-3">{item.icon}</p>
                <p className="font-mono text-[11px] tracking-[1.5px] uppercase text-ink font-semibold mb-2">
                  {item.area}
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
