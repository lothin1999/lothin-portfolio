"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useCVData } from "@/hooks/useCVData";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { ScrambleText } from "@/components/ui/ScrambleText";
import { Glyph } from "@/components/ui/Glyph";

// Enhanced custom Markdown parser to render document files beautifully
function renderMarkdown(content: string) {
  if (!content) return [];
  const blocks = content.split(/\n\s*\n/);
  const renderedBlocks = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    // 1. Code Block Handler
    if (block.startsWith("```")) {
      const lines = block.split("\n");
      const lang = lines[0].replace("```", "").trim();
      const code = lines.slice(1, -1).join("\n");
      renderedBlocks.push(
        <pre key={i} className="bg-[var(--color-surface-subtle)] border border-rule p-4 rounded-lg overflow-x-auto font-mono text-[12.5px] text-ink leading-relaxed my-5">
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
        <div key={i} className="overflow-x-auto my-6 border border-rule rounded-lg">
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

    // 4. Blockquote Handler
    if (block.startsWith("> ")) {
      const lines = block.split("\n").map(l => l.replace(/^>\s*/, "").trim());
      renderedBlocks.push(
        <blockquote key={i} className="border-l-4 border-accent pl-4 italic text-ink2/85 my-5 font-sans leading-relaxed">
          {lines.map((l, idx) => (
            <p key={idx} className="my-1.5" dangerouslySetInnerHTML={{ __html: parseInline(l) }} />
          ))}
        </blockquote>
      );
      continue;
    }

    // 5. Headings
    if (block.startsWith("# ")) {
      renderedBlocks.push(
        <h1 key={i} className="font-serif text-[28px] md:text-[34px] text-ink font-medium mt-8 mb-5 border-b border-rule pb-3">
          {block.replace("# ", "")}
        </h1>
      );
      continue;
    }
    if (block.startsWith("## ")) {
      renderedBlocks.push(
        <h2 key={i} className="font-serif text-[22px] md:text-[26px] text-ink font-semibold mt-7 mb-4 border-b border-rule pb-2">
          {block.replace("## ", "")}
        </h2>
      );
      continue;
    }
    if (block.startsWith("### ")) {
      renderedBlocks.push(
        <h3 key={i} className="font-serif text-[17px] md:text-[20px] text-ink font-semibold mt-6 mb-3">
          {block.replace("### ", "")}
        </h3>
      );
      continue;
    }

    // 6. Raw HTML Tags Handler
    if (block.startsWith("<details") || block.startsWith("<div") || block.startsWith("<p")) {
      renderedBlocks.push(
        <div
          key={i}
          className="my-4"
          dangerouslySetInnerHTML={{ __html: parseInline(block) }}
        />
      );
      continue;
    }

    // 7. Standard Paragraph
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

// Inline Markdown formatter (bold, italic, code tags, hyperlinks)
function parseInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/__([^_]+)__/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-ink2">$1</em>')
    .replace(/_([^_]+)_/g, '<em class="italic text-ink2">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-[var(--color-surface-subtle)] border border-rule px-1 py-0.5 rounded text-accent">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline inline-flex items-center gap-0.5">$1</a>');
}

export default function DocumentsPage() {
  const { cv } = useCVData();
  const list = cv.documents || [];

  const [selectedFilename, setSelectedFilename] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [contentLoading, setContentLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize selected document from URL query params or fallback to first document
  useEffect(() => {
    if (list.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const fileParam = params.get("file");
      if (fileParam && list.some(doc => doc.filename === fileParam)) {
        setSelectedFilename(fileParam);
      } else {
        // Fallback to README if available, else first document
        const readme = list.find(doc => doc.filename.toLowerCase() === "readme.md");
        setSelectedFilename(readme ? readme.filename : list[0].filename);
      }
    }
  }, [list]);

  // Load document content dynamically when selected file changes
  useEffect(() => {
    if (!selectedFilename) return;

    const doc = list.find((d) => d.filename === selectedFilename);
    if (doc) {
      const ext = doc.filename.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "html" || ext === "htm") {
        setContent("");
        setContentLoading(false);
        return;
      }
    }

    let active = true;
    setContentLoading(true);

    fetch(`/api/documents/${selectedFilename}`)
      .then((res) => {
        if (!res.ok) throw new Error("Document not found");
        return res.text();
      })
      .then((text) => {
        if (active) {
          setContent(text);
          setContentLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setContent("### Error\nFailed to load the document content. Make sure it exists in Cloudflare R2 or project root.");
          setContentLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedFilename, list]);

  // Copy deep-link sharing option
  const handleCopyLink = () => {
    if (!selectedFilename) return;
    const url = `${window.location.origin}/documents?file=${selectedFilename}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredDocs = list.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoc = list.find((doc) => doc.filename === selectedFilename);

  return (
    <div className="bg-bg min-h-screen">
      <ActivePathBridge segment="documents" />

      {/* Header Panel */}
      <header className="border-b border-rule py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="font-mono text-[10px] text-accent uppercase tracking-[2px]">// documentation.hub</span>
          <h1 className="font-serif text-[clamp(44px,7vw,70px)] font-normal text-ink leading-tight tracking-tight mt-2">
            <ScrambleText text="Documents" delay={100} duration={800} />
          </h1>
          <p className="text-[13px] text-muted font-sans font-light mt-4 max-w-xl">
            Browse and read official manuals, technical guides, system reports, and other project materials.
          </p>
        </div>
      </header>

      {/* Explorer Area */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-rule rounded-lg text-xs bg-surface text-ink placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="border border-rule rounded-lg bg-surface p-2 space-y-1 shadow-sm">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted px-2.5 py-1 block">
                AVAILABLE FILES
              </span>
              {filteredDocs.length === 0 ? (
                <p className="text-[11px] text-muted font-mono p-3">No matching files found.</p>
              ) : (
                filteredDocs.map((doc) => {
                  const isActive = selectedFilename === doc.filename;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedFilename(doc.filename);
                        const newUrl = `${window.location.pathname}?file=${doc.filename}`;
                        window.history.pushState(null, "", newUrl);
                      }}
                      className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded-md transition-all flex items-center gap-2.5 border-none bg-transparent cursor-pointer ${
                        isActive
                          ? "bg-accent/10 text-accent font-semibold border-l-2 border-accent"
                          : "text-ink2 hover:text-ink hover:bg-tag-bg/30"
                      }`}
                    >
                      <FileText size={14} className={isActive ? "text-accent" : "text-muted"} />
                      <span className="truncate flex-1">{doc.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Reading Workspace Pane */}
          <main className="flex-1 min-w-0 bg-surface border border-rule rounded-lg p-6 md:p-8 shadow-sm w-full">
            {selectedDoc ? (
              <div>
                {/* Meta Header block */}
                <div className="flex items-center justify-between pb-4 border-b border-rule mb-6 gap-4 flex-wrap">
                  <div>
                    <h2 className="font-serif text-[24px] text-ink font-semibold leading-tight">
                      {selectedDoc.name}
                    </h2>
                    <span className="font-mono text-[9px] text-muted tracking-wider mt-1 block uppercase">
                      filename: {selectedDoc.filename} · uploaded: {new Date(selectedDoc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="font-mono text-[10px] tracking-wide text-ink border border-rule hover:border-ink rounded-md px-3 py-1.5 transition-all bg-transparent cursor-pointer flex items-center gap-1.5"
                    >
                      <LinkIcon size={12} />
                      {copied ? "COPIED!" : "COPY LINK"}
                    </button>
                    <a
                      href={selectedDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] tracking-wide text-accent border border-rule hover:border-accent rounded-md px-3 py-1.5 transition-all no-underline inline-flex items-center gap-1.5"
                    >
                      <ExternalLink size={12} />
                      RAW TEXT
                    </a>
                  </div>
                </div>

                {/* Content Render Area */}
                {contentLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <RefreshCw size={22} className="text-accent animate-spin" />
                    <span className="font-mono text-[10px] text-ink uppercase tracking-wider animate-pulse">
                      fetching.document...
                    </span>
                  </div>
                ) : (() => {
                  const ext = selectedDoc.filename.split(".").pop()?.toLowerCase();
                  if (ext === "pdf") {
                    return (
                      <div className="w-full h-[650px] rounded-lg overflow-hidden border border-rule bg-surface">
                        <iframe
                          src={selectedDoc.url}
                          className="w-full h-full border-none"
                          title={selectedDoc.name}
                        />
                      </div>
                    );
                  }
                  if (ext === "html" || ext === "htm") {
                    return (
                      <div className="w-full h-[650px] rounded-lg overflow-hidden border border-rule bg-white">
                        <iframe
                          src={selectedDoc.url}
                          className="w-full h-full border-none"
                          title={selectedDoc.name}
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    );
                  }
                  return (
                    <article className="article-body select-text">
                      {renderMarkdown(content)}
                    </article>
                  );
                })()}

              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                <Glyph pattern="010111010" hoverPattern="111111111" size={32} gap={2} color="var(--muted)" />
                <p className="font-mono text-[11px] text-muted">
                  Select a document from the explorer pane to view its content.
                </p>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
