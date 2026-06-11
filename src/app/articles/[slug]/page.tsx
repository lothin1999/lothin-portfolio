import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata } from "@/lib/seo";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { Glyph } from "@/components/ui/Glyph";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cv = await getCVData();
  const article = cv.articles?.find((a) => a.slug === params.slug);

  if (!article) return {};

  return buildMetadata(cv, {
    title: article.title,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
  });
}

// Simple custom Markdown-to-React parser to render articles beautifully without external packages
function renderMarkdown(content: string) {
  const blocks = content.split(/\n\s*\n/);
  let insideList = false;
  let listItems: string[] = [];

  const renderedBlocks = [];

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i].trim();

    if (!block) continue;

    // 1. Code Block Handler
    if (block.startsWith("```")) {
      const lines = block.split("\n");
      const lang = lines[0].replace("```", "").trim();
      const code = lines.slice(1, -1).join("\n");
      renderedBlocks.push(
        <pre key={i} className="bg-[var(--color-surface-subtle)] border border-rule p-4 rounded overflow-x-auto font-mono text-[12.5px] text-ink leading-relaxed my-5">
          {lang && <div className="text-[10px] text-muted uppercase tracking-wider mb-2 font-mono">// {lang}</div>}
          <code>{code}</code>
        </pre>
      );
      continue;
    }

    // 2. Table Handler
    if (block.includes("|") && block.split("\n")[1]?.includes("---")) {
      const lines = block.split("\n");
      const headers = lines[0]
        .split("|")
        .slice(1, -1)
        .map((h) => h.trim());
      const rows = lines.slice(2).map((line) =>
        line
          .split("|")
          .slice(1, -1)
          .map((r) => r.trim())
      );

      renderedBlocks.push(
        <div key={i} className="overflow-x-auto my-6 border border-rule rounded">
          <table className="w-full font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface-subtle)] border-b border-rule">
                {headers.map((h, idx) => (
                  <th key={idx} className="p-3 text-left font-mono uppercase font-semibold text-ink tracking-wider border-r border-rule last:border-r-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule bg-surface">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-ink2 border-r border-rule last:border-r-0" dangerouslySetInnerHTML={{ __html: parseInline(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 3. Bullet Point List Handler
    if (block.startsWith("- ") || block.startsWith("* ") || block.startsWith("  - ")) {
      const items = block.split("\n").map((line) => line.replace(/^[-\*\s]+/, "").trim());
      renderedBlocks.push(
        <ul key={i} className="list-none space-y-2.5 my-5 pl-4">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="text-[14px] text-ink2 leading-relaxed pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-accent-orange"
              dangerouslySetInnerHTML={{ __html: parseInline(item) }}
            />
          ))}
        </ul>
      );
      continue;
    }

    // 4. Headings
    if (block.startsWith("### ")) {
      renderedBlocks.push(
        <h3 key={i} className="font-serif text-[18px] text-ink font-semibold mt-6 mb-3">
          {block.replace("### ", "")}
        </h3>
      );
      continue;
    }
    if (block.startsWith("## ")) {
      renderedBlocks.push(
        <h2 key={i} className="font-serif text-[22px] text-ink mt-8 mb-4 border-b border-rule pb-2">
          {block.replace("## ", "")}
        </h2>
      );
      continue;
    }

    // 5. Normal Paragraph
    renderedBlocks.push(
      <p
        key={i}
        className="text-[14.5px] text-ink2 leading-[1.8] font-sans font-light my-4"
        dangerouslySetInnerHTML={{ __html: parseInline(block) }}
      />
    );
  }

  return renderedBlocks;
}

// Simple inline styling helper (Bold, code wrappers)
function parseInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-[var(--color-surface-subtle)] border border-rule px-1 py-0.5 rounded text-accent">$1</code>');
}

export default async function ArticleDetailsPage({ params }: PageProps) {
  const cv = await getCVData();
  const article = cv.articles?.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-bg min-h-screen">
      {/* Set status bar segment label */}
      <ActivePathBridge segment="reading" />

      {/* Back button container */}
      <nav className="max-w-[680px] mx-auto px-6 pt-10 pb-6 flex items-center">
        <Link href="/articles" className="font-mono text-xs text-muted hover:text-accent link-underline flex items-center gap-1.5">
          <span>←</span> Back to writing
        </Link>
      </nav>

      {/* Main Container */}
      <main className="max-w-[680px] mx-auto px-6 pb-20">
        {/* Article Meta */}
        <header className="flex flex-col gap-4 mb-8">
          <time className="font-mono text-[11px] text-muted tracking-wider" dateTime={article.date}>
            {article.date} · {article.readingTime || "5 min read"}
          </time>
          <h1 className="font-serif text-[32px] md:text-[40px] text-ink leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-1.5 mt-1 pb-6 border-b border-rule">
            {article.tags.map((tag) => (
              <span key={tag} className="post-tag">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Content Block */}
        <div className="article-body">
          {renderMarkdown(article.content)}
        </div>

        {/* Bottom fine border line */}
        <div className="grid-line-x my-12" />

        {/* Article footer / next steps */}
        <footer className="flex flex-col gap-5 bg-surface p-6 border border-rule rounded hover:border-ink transition-colors">
          <div className="flex items-center gap-3">
            <Glyph pattern="111010111" hoverPattern="111111111" size={20} gap={1.5} color="var(--accent)" />
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-ink font-semibold">// Author</h4>
          </div>
          <p className="text-xs text-ink2 leading-relaxed font-sans font-light">
            Published by <strong>{cv.profile.name.first} {cv.profile.name.last}</strong>. Cambodia-based Full-Stack Web Developer specialized in payments gateway systems, real-time synchronisation nodes, and edge delivery.
          </p>
          <Link href="/contact" className="font-mono text-xs text-accent hover:text-accent-orange link-underline w-fit">
            Get in touch
          </Link>
        </footer>
      </main>
    </div>
  );
}
