"use client";

import Link from "next/link";
import { useCVData } from "@/hooks/useCVData";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Glyph } from "@/components/ui/Glyph";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import type { Article, CVData } from "@/types/cv";

export function ArticlesView({ cv: propCV }: { cv?: CVData }) {
  const { cv: hookCV } = useCVData();
  const cv = propCV || hookCV;
  const articles = cv.articles || [];

  const featuredArticles = articles.filter((a: Article) => a.featured);
  const archivedArticles = articles.filter((a: Article) => !a.featured);

  const GLYPHS = [
    { pattern: "111010111", hover: "111111111" },
    { pattern: "101111101", hover: "111111111" },
    { pattern: "010111010", hover: "111111111" },
    { pattern: "111101111", hover: "111111111" },
  ];

  return (
    <div className="bg-bg min-h-screen">
      <ActivePathBridge segment="writing" />

      {/* Header Container */}
      <header className="border-b border-rule py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-serif text-[clamp(48px,8vw,78px)] font-normal text-ink leading-tight leading-none tracking-tight">
            <ScrambleText text="Writing" delay={100} duration={800} />
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-[2px] mt-4">
            // thoughts.on.frontend.and.architecture
          </p>
        </div>
      </header>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="border-b border-rule py-16" aria-labelledby="featured-title">
          <div className="max-w-6xl mx-auto px-6">
            <h2 id="featured-title" className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-8 pb-3 border-b border-rule flex items-center justify-between">
              <span>// Featured Posts</span>
              <span>{featuredArticles.length} items</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredArticles.map((article, idx) => {
                const glyph = GLYPHS[idx % GLYPHS.length];
                return (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="post-card group rounded"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <time className="post-card__date" dateTime={article.date}>
                        {article.date} · {article.readingTime || "5 min read"}
                      </time>
                      <Glyph
                        pattern={glyph.pattern}
                        hoverPattern={glyph.hover}
                        size={36}
                        gap={2}
                        color="var(--accent)"
                      />
                    </div>
                    
                    <h3 className="post-card__title group-hover:text-accent transition-colors duration-200">
                      {article.title}
                    </h3>
                    
                    <p className="post-card__excerpt">
                      {article.excerpt}
                    </p>

                    <div className="post-card__tags">
                      {article.tags.map((tag) => (
                        <span key={tag} className="post-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="post-card__cta">
                      Read article <span className="arrow">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Archive / More Posts */}
      {archivedArticles.length > 0 && (
        <section className="border-b border-rule py-16" aria-labelledby="archive-title">
          <div className="max-w-6xl mx-auto px-6">
            <h2 id="archive-title" className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted mb-8 pb-3 border-b border-rule">
              // More Posts
            </h2>

            <div className="flex flex-col border border-rule rounded bg-surface divide-y divide-rule overflow-hidden">
              {archivedArticles.map((article, idx) => {
                const glyph = GLYPHS[(idx + 2) % GLYPHS.length];
                return (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="post-item px-6 py-5 group"
                  >
                    <div className="post-item__left">
                      <Glyph
                        pattern={glyph.pattern}
                        hoverPattern={glyph.hover}
                        size={16}
                        gap={1.5}
                        color="var(--ink)"
                      />
                      <h3 className="post-item__title text-[16px] leading-snug font-sans font-medium">
                        {article.title}
                      </h3>
                      <div className="post-item__tags hidden sm:flex">
                        {article.tags.map((tag) => (
                          <span key={tag} className="post-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <time className="post-item__date" dateTime={article.date}>
                      {article.date}
                    </time>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="py-20 bg-[var(--color-surface-subtle)] text-center border-b border-rule">
        <div className="max-w-xl mx-auto px-6 flex flex-col items-center gap-4">
          <Glyph
            pattern="010111010"
            hoverPattern="111111111"
            size={42}
            gap={3}
            color="var(--accent-orange)"
          />
          <h2 className="font-serif text-[28px] text-ink leading-tight mt-2">
            What problem are you facing in your frontend?
          </h2>
          <p className="text-[13.5px] text-muted leading-relaxed font-sans font-light max-w-sm">
            I write about issues I resolve in real enterprise code bases. If you want to consult on your system architecture, let&apos;s talk.
          </p>
          <a
            href="/#about"
            className="mt-4 px-6 py-2.5 font-mono text-[11.5px] uppercase tracking-wider text-ink border border-rule hover:border-ink rounded bg-surface hover:bg-[var(--color-surface-subtle)] transition-all"
          >
            let&apos;s discuss
          </a>
        </div>
      </section>
    </div>
  );
}
