import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { ScrambleText } from "@/components/ui/ScrambleText";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "Work",
    description:
      "3+ years of full-stack development experience building nationwide rental platforms, enterprise POS, banking, and loan systems in Cambodia with Vue/Nuxt, React/Next.js, Angular, NestJS, Laravel, and Spring Boot.",
    path: "/experience",
  });
}

export default async function ExperiencePage() {
  return (
    <div className="bg-bg min-h-screen">
      <ActivePathBridge segment="work" />

      {/* Page Header */}
      <header className="border-b border-rule py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[11px] tracking-[2.5px] uppercase text-accent mb-3 flex items-center gap-2.5">
            <span className="w-5 h-px bg-accent shrink-0 inline-block" />
            Professional Experience
          </p>
          <h1 className="font-serif text-[clamp(48px,8vw,78px)] font-normal text-ink leading-none tracking-tight">
            <ScrambleText text="Work" delay={100} duration={800} />
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-[2px] mt-4">
            // 3+ years · production systems · 2023 → present
          </p>
        </div>
      </header>

      {/* Stats Banner */}
      <section className="border-b border-rule bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "3+", label: "Years Experience" },
            { value: "10+", label: "Projects Live" },
            { value: "3", label: "Migrations Led" },
            { value: "3", label: "Ecosystems Mastered" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-serif text-[clamp(28px,4vw,40px)] text-ink leading-none">
                {stat.value}
              </span>
              <span className="font-mono text-[10.5px] tracking-[1.5px] uppercase text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Cards */}
      <ExperienceSection />

      {/* Tech Overview */}
      <section className="border-t border-rule py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-8 pb-3 border-b border-rule">
            // Ecosystems Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                eco: "⚡ Vue / Nuxt",
                stack: "Vue.js 3 · Nuxt 2 / 3 / 4 · SSR / CSR / ISR · Pinia · Vuex",
                color: "var(--accent)",
              },
              {
                eco: "⚛️ React / Next",
                stack: "React.js · Next.js App Router · SSR · API Routes · Server Components",
                color: "var(--accent-pink)",
              },
              {
                eco: "🅰️ Angular",
                stack: "Angular · Standalone Components · RxJS · Signals · Angular Router",
                color: "var(--accent-orange)",
              },
            ].map((item) => (
              <div
                key={item.eco}
                className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200"
              >
                <p
                  className="font-mono text-[11px] tracking-[1.5px] uppercase font-semibold mb-2"
                  style={{ color: item.color }}
                >
                  {item.eco}
                </p>
                <p className="text-[13px] text-ink2 font-sans font-light leading-relaxed">
                  {item.stack}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
