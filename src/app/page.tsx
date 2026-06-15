"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCVData } from "@/hooks/useCVData";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Glyph } from "@/components/ui/Glyph";
import { Chip } from "@/components/ui/Chip";

export default function HomePage() {
  const { cv, isLoading } = useCVData();

  if (isLoading) {
    return (
      <div className="bg-bg min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Glyph pattern="010111010" hoverPattern="111111111" size={42} gap={3} color="var(--accent)" />
          <p className="font-mono text-xs text-muted uppercase tracking-[2px] animate-pulse">
            loading.system...
          </p>
        </div>
      </div>
    );
  }

  const { profile, experiences, references, articles } = cv;
  const featuredWork = experiences.slice(0, 2);
  const latestArticles = (articles || []).slice(0, 2);

  return (
    <div className="bg-bg w-full">
      <ActivePathBridge segment="home" />

      {/* 01 // system.init */}
      <section className="border-b border-rule py-16 md:py-24" aria-labelledby="home-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-6 mb-10">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-accent font-semibold flex items-center gap-2">
              <span className="w-5 h-px bg-accent inline-block shrink-0" />
              01 // system.init
            </span>
            <span className="font-mono text-[10.5px] text-muted tracking-wider uppercase">
              {profile.tagline || "3+ Years · Production Systems"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col items-start">
              <h1 id="home-title" className="font-serif text-[clamp(44px,7vw,70px)] font-normal leading-[1.05] tracking-[-0.02em] text-ink mb-6">
                Hello, I&apos;m{" "}
                <em className="not-italic italic text-accent-orange">
                  <ScrambleText text={profile.name.first} delay={300} duration={800} />
                </em>
                <br />
                {profile.name.last}.
              </h1>
              <p className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted mb-4">
                // {profile.title} · based in {profile.location}
              </p>
              <p className="text-[16px] text-ink2 leading-relaxed font-sans font-light max-w-[580px] mb-8">
                {cv.adminSettings?.homeIntro || "Your web platform feels sluggish, features drag, releases break things, and nobody can explain why. I find the structural problems, resolve database and state bottleneck drag, and organize the way forward."}
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  href="/about"
                  className="px-5 py-2.5 bg-surface border border-rule hover:border-ink text-ink text-xs font-mono rounded tracking-wide transition-all duration-200 hover:shadow-sm"
                >
                  See my approach
                </Link>
                <Link
                  href="/portfolio"
                  className="px-5 py-2.5 bg-surface border border-rule hover:border-ink text-accent text-xs font-mono rounded tracking-wide transition-all duration-200 hover:shadow-sm inline-flex items-center gap-1"
                >
                  Case studies <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            {/* Right side illustration glyph / profile photo */}
            <div className="lg:col-span-4 flex justify-start lg:justify-end items-center h-full">
              {profile.photoUrl ? (
                <div className="relative group p-1 border border-rule bg-surface rounded">
                  <div className="w-48 h-48 overflow-hidden rounded relative">
                    <img
                      src={profile.photoUrl}
                      alt={`${profile.name.first} ${profile.name.last}`}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-6 border border-rule bg-surface rounded relative">
                  <Glyph
                    pattern="111010111"
                    hoverPattern="111111111"
                    size={84}
                    gap={4}
                    color="var(--accent)"
                    className="mx-auto"
                  />
                  <span className="font-mono text-[9px] text-muted text-center uppercase tracking-[2px] mt-2">
                    // SYS.NODE.ACTIVE
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 02 // the problem */}
      <section className="border-b border-rule py-16" aria-labelledby="problem-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              02 // the problem
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="problem-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              The Problem
            </h2>
          </div>

          <p className="text-[14.5px] text-ink2 leading-relaxed font-sans font-light max-w-2xl mb-10">
            {cv.adminSettings?.homeProblemIntro || "Full-stack complexity doesn't announce itself. It piles up quietly until shipping simple updates feels like a battle."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(cv.adminSettings?.homeProblems || [
              {
                num: "[01]",
                title: "Features take longer than they should",
                desc: "Change one thing, five other places break. What should be a half-day task turns into a multi-day testing ordeal because codebases lack encapsulation and type boundaries.",
              },
              {
                num: "[02]",
                title: "Slow page loads and performance debt",
                desc: "Slow database queries and unoptimized rendering block core visitor routes. Pages that should load instantly lag, leading to increased bounce rates.",
              },
              {
                num: "[03]",
                title: "Backend-Frontend disconnect",
                desc: "Knowledge lives in developers' heads. REST APIs lack shared typescript contracts, leading to silent serialization errors and constant coordination overhead.",
              },
              {
                num: "[04]",
                title: "Complex integrations and payment bugs",
                desc: "Payment gateways like Bakong KHQR are wired without strict signature checks or reliable transaction webhooks, causing order status inconsistencies.",
              },
            ]).map((prob) => (
              <div key={prob.num} className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200">
                <span className="font-mono text-xs text-accent font-semibold">{prob.num}</span>
                <h3 className="font-serif text-lg text-ink font-semibold mt-2 mb-2">{prob.title}</h3>
                <p className="text-[13px] text-ink2 leading-relaxed font-sans font-light">{prob.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 // section.about */}
      <section className="border-b border-rule py-16" aria-labelledby="about-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              03 // section.about
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="about-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              Who I Am
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4 text-[14.5px] text-ink2 font-sans font-light leading-relaxed">
              {(cv.adminSettings?.homeAboutStory || [
                "I'm a Full-Stack Web Developer based in Phnom Penh. I help teams resolve system complexity so their platforms can scale.",
                "I started in Cambodia, building CRM systems, real-time billiard table status trackers, and loan calculators. Later, I architected nationwide rental marketplaces and migrated legacy POS platforms through multiple major Nuxt and backend framework shifts."
              ]).map((para, index) => (
                <p key={index}>{para}</p>
              ))}
              <Link href="/about" className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-orange link-underline mt-2">
                More about me <span>→</span>
              </Link>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              {(cv.adminSettings?.homeStats || [
                { val: "3+ Years", label: "Experience" },
                { val: "10+", label: "Projects Live" },
                { val: "3", label: "Nuxt Migrations" },
                { val: "Edge SSR", label: "Specialty" },
              ]).map((stat) => (
                <div key={stat.label} className="border border-rule bg-surface p-4 rounded flex flex-col gap-1">
                  <span className="font-serif text-[20px] text-ink font-semibold">{stat.val}</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04 // section.work */}
      <section className="border-b border-rule py-16" aria-labelledby="work-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              04 // section.work
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="work-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              Featured Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {featuredWork.map((exp, idx) => (
              <div key={exp.id} className="border border-rule bg-surface p-5 rounded flex flex-col hover:border-ink transition-colors duration-200">
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider mb-2">{exp.period}</span>
                <h3 className="font-serif text-[22px] text-ink font-normal mb-1">{exp.title.split("—")[1]?.trim() || exp.title}</h3>
                <p className="font-mono text-xs text-accent mt-0.5 mb-4">{exp.company}</p>
                <p className="text-[13px] text-ink2 leading-relaxed font-sans font-light mb-6">
                  {exp.bullets[0]} And: {exp.bullets[1]?.toLowerCase()}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto mb-5">
                  {exp.tags.slice(0, 4).map((tag) => (
                    <Chip key={tag} className="text-[10px] py-0.5 px-2 bg-tag-bg border border-rule text-tag-text">{tag}</Chip>
                  ))}
                </div>
                <Link href="/portfolio" className="inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:text-accent-orange font-semibold">
                  View case study <span className="arrow">→</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/portfolio" className="px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-ink border border-rule hover:border-ink rounded bg-surface hover:bg-[var(--color-surface-subtle)] transition-all">
              View all projects
            </Link>
          </div>
        </div>
      </section>

      {/* 05 // section.services */}
      <section className="border-b border-rule py-16" aria-labelledby="services-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              05 // section.services
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="services-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              How I Help
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {(cv.adminSettings?.homeServices || [
              {
                title: "High-End Full-Stack Consulting",
                desc: "I analyze your application database, caching layer, and client components to locate bottleneck drag and build a clear plan to clean things up.",
              },
              {
                title: "Custom Web Development",
                desc: "I build responsive, lightning-fast SSR web platforms in Vue/Nuxt, React/Next, and Angular, with modular NestJS/Laravel backends that are simple to maintain.",
              },
              {
                title: "Core System Integrations",
                desc: "Integrate Cambodia-native Bakong KHQR checkout flows, real-time Pusher status sockets, and Firebase auth securely into existing systems.",
              },
            ]).map((service) => (
              <div key={service.title} className="border border-rule bg-surface p-5 rounded flex flex-col hover:border-ink transition-colors duration-200">
                <h3 className="font-serif text-lg text-ink font-semibold mb-2">{service.title}</h3>
                <p className="text-[13px] text-ink2 leading-relaxed font-sans font-light mb-6">{service.desc}</p>
                <Link href="/services" className="font-mono text-[11px] text-accent hover:text-accent-orange font-semibold mt-auto inline-flex items-center gap-1">
                  Learn more <span className="arrow">→</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/services" className="px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-ink border border-rule hover:border-ink rounded bg-surface hover:bg-[var(--color-surface-subtle)] transition-all">
              View all services →
            </Link>
          </div>
        </div>
      </section>

      {/* 06 // section.writing */}
      {latestArticles.length > 0 && (
        <section className="border-b border-rule py-16" aria-labelledby="writing-title">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
              <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
                06 // section.writing
              </span>
              <span className="w-4 h-px bg-rule inline-block" />
              <h2 id="writing-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
                Latest Writing
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {latestArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200 flex flex-col"
                >
                  <span className="font-mono text-[10px] text-muted uppercase tracking-wider mb-2">
                    {article.date} · {article.readingTime || "5 min read"}
                  </span>
                  <h3 className="font-serif text-[20px] text-ink font-semibold mb-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-[13px] text-ink2 font-sans font-light leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                  <span className="font-mono text-[11px] text-accent hover:text-accent-orange font-semibold mt-auto inline-flex items-center gap-1">
                    Read article <span className="arrow">→</span>
                  </span>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link href="/articles" className="px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-ink border border-rule hover:border-ink rounded bg-surface hover:bg-[var(--color-surface-subtle)] transition-all">
                Read more →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 07 // section.proof */}
      {references.length > 0 && (
        <section className="border-b border-rule py-16" aria-labelledby="proof-title">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
              <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
                07 // section.proof
              </span>
              <span className="w-4 h-px bg-rule inline-block" />
              <h2 id="proof-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
                What Others Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {references.map((ref) => (
                <div key={ref.name} className="border border-rule bg-surface p-6 rounded hover:border-ink transition-colors">
                  <p className="text-[14px] text-ink2 leading-relaxed font-sans font-light italic mb-4">
                    &ldquo;Thoeun is a highly dedicated and skilled developer. He was able to build scalable backend systems, secure KHQR payment gateways, and lead framework migrations on time.&rdquo;
                  </p>
                  <div>
                    <h4 className="text-[13.5px] font-sans font-semibold text-ink leading-tight">{ref.name}</h4>
                    <p className="font-mono text-[10.5px] text-accent mt-0.5">{ref.role} · {ref.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 08 Let's Talk */}
      <section className="py-20 text-center" aria-labelledby="talk-title">
        <div className="max-w-xl mx-auto px-6 flex flex-col items-center gap-4">
          <Glyph pattern="010111010" hoverPattern="111111111" size={42} gap={3} color="var(--accent-orange)" />
          <h2 id="talk-title" className="font-serif text-[32px] text-ink leading-tight mt-2">
            {cv.adminSettings?.homeCta?.title || "Let's Talk"}
          </h2>
          <p className="text-[14px] text-ink2 leading-relaxed font-sans font-light max-w-sm">
            {cv.adminSettings?.homeCta?.desc || "I take on limited clients at a time so I can give each project real, focused attention. If something here resonated, tell me what's broken."}
          </p>
          <Link
            href={cv.adminSettings?.homeCta?.buttonHref || "/contact"}
            className="mt-4 px-6 py-2.5 font-mono text-[11.5px] uppercase tracking-wider text-ink border border-rule hover:border-ink rounded bg-surface hover:bg-[var(--color-surface-subtle)] transition-all inline-block"
          >
            {cv.adminSettings?.homeCta?.buttonText || "Tell Me What's Broken"}
          </Link>
        </div>
      </section>
    </div>
  );
}
