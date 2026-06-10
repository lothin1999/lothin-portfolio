import type { Metadata } from "next";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { AboutSection } from "@/components/sections/AboutSection";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { ScrambleText } from "@/components/ui/ScrambleText";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv, {
    title: "About",
    description:
      "Thoeun Lothin — Full-Stack Developer based in Phnom Penh, Cambodia. 3+ years building production platforms, payment gateways, and enterprise systems. Contact details and references included.",
    path: "/about",
  });
}

export default async function AboutPage() {
  return (
    <div className="bg-bg min-h-screen">
      <ActivePathBridge segment="about" />

      {/* Page Header */}
      <header className="border-b border-rule py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[11px] tracking-[2.5px] uppercase text-accent mb-3 flex items-center gap-2.5">
            <span className="w-5 h-px bg-accent shrink-0 inline-block" />
            Get In Touch
          </p>
          <h1 className="font-serif text-[clamp(48px,8vw,78px)] font-normal text-ink leading-none tracking-tight">
            <ScrambleText text="About" delay={100} duration={800} />
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-[2px] mt-4">
            // phnom penh, cambodia · full-stack developer
          </p>
        </div>
      </header>

      {/* Quick intro strip */}
      <section className="border-b border-rule bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-[15px] text-ink2 font-sans font-light leading-relaxed max-w-3xl">
            I&apos;m <span className="text-ink font-medium">Thoeun Lothin</span>, a
            full-stack developer passionate about building clean, scalable production
            systems — from payment gateways and booking engines to real-time platforms
            and enterprise dashboards. Based in Phnom Penh, Cambodia. Open to remote
            and on-site roles.
          </p>
        </div>
      </section>

      {/* About Section (Bio, Languages, References, Contact) */}
      <AboutSection />

      {/* Cover Letter Preview */}
      <section className="border-t border-rule py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-8 pb-3 border-b border-rule">
            // Cover Letter
          </h2>
          <div className="border border-rule bg-surface rounded p-6 md:p-10 max-w-3xl space-y-5 text-[14px] font-sans font-light text-ink2 leading-relaxed">
            <p className="font-mono text-[11px] text-muted">Phnom Penh, Cambodia — June 2026</p>
            <p>Dear Hiring Manager,</p>
            <p>
              I am writing to express my sincere interest in a Full-Stack Developer
              position. My name is{" "}
              <span className="text-ink font-medium">Thoeun Lothin</span>, and I am a
              passionate software engineer based in Phnom Penh, Cambodia, with over{" "}
              <span className="text-ink font-medium">3 years</span> of professional
              experience building scalable web applications across the full stack.
            </p>
            <p>
              I have led development for nationwide rental marketplaces, enterprise POS
              systems, CRM platforms, hotel management, billiard and pool hall
              management, loan management, and Cambodia-native Bakong KHQR payment
              integrations. I have delivered production systems that serve thousands of
              real users daily.
            </p>
            <p>
              My technical stack spans <span className="text-ink font-medium">Vue.js / Nuxt 4</span>,{" "}
              <span className="text-ink font-medium">React.js / Next.js</span>,{" "}
              <span className="text-ink font-medium">Angular</span> on the front end, and{" "}
              <span className="text-ink font-medium">NestJS</span>,{" "}
              <span className="text-ink font-medium">Laravel</span>,{" "}
              <span className="text-ink font-medium">Spring Boot</span> on the back end — with
              strong DevOps expertise in Docker, Cloudflare Workers/Pages/R2, and Firebase.
            </p>
            <p>
              I am highly motivated, a fast learner, and committed to writing clean,
              maintainable code. I am ready to bring my skills and dedication to your team.
            </p>
            <p>
              Thank you for your time and consideration. I look forward to the opportunity
              to discuss how I can contribute to your organization.
            </p>
            <p className="mt-4">
              Sincerely,<br />
              <span className="text-ink font-medium font-sans">Thoeun Lothin</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
