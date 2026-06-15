"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings } from "./SettingsContext";
import { Sparkles, X, Send, Bot, User, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  isError?: boolean;
}

const SUGGESTIONS = [
  "What is Lothin's tech stack?",
  "Tell me about the AALL Rental project.",
  "What POS systems has Lothin worked on?",
  "How can I contact Lothin?",
];

// Helper to format text with simple markdown parsing (bold, lists, inline code)
function renderInline(str: string) {
  const parts = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    const textBefore = str.substring(lastIndex, match.index);
    if (textBefore) parts.push(textBefore);

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="font-mono text-[11px] px-1.5 py-0.5 bg-rule rounded border border-rule">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  const textAfter = str.substring(lastIndex);
  if (textAfter) parts.push(textAfter);

  return parts.length > 0 ? parts : str;
}

function MarkdownText({ text }: { text: string }) {
  // Parse the text into distinct semantic blocks to avoid formatting fragmentation
  const blocks: { type: "paragraph" | "list" | "header" | "code-block"; content: string; lang?: string; level?: number; items?: string[] }[] = [];
  
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLang = "";
  
  let currentListItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Handle code block toggle
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        blocks.push({
          type: "code-block",
          content: codeContent.join("\n"),
          lang: codeLang
        });
        codeContent = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        // Start of code block
        // Flush active list first
        if (currentListItems.length > 0) {
          blocks.push({ type: "list", content: "", items: currentListItems });
          currentListItems = [];
        }
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }
    
    // Handle bullet lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      currentListItems.push(trimmed.slice(2));
      continue;
    } else {
      if (currentListItems.length > 0) {
        blocks.push({ type: "list", content: "", items: currentListItems });
        currentListItems = [];
      }
    }
    
    // Handle headers
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "header", level: 3, content: trimmed.slice(4) });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "header", level: 2, content: trimmed.slice(3) });
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "header", level: 1, content: trimmed.slice(2) });
      continue;
    }
    
    // Handle empty line
    if (trimmed === "") {
      continue;
    }
    
    // Regular text paragraph
    blocks.push({ type: "paragraph", content: line });
  }
  
  // Clean up remaining open states
  if (currentListItems.length > 0) {
    blocks.push({ type: "list", content: "", items: currentListItems });
  }
  if (inCodeBlock && codeContent.length > 0) {
    blocks.push({ type: "code-block", content: codeContent.join("\n"), lang: codeLang });
  }
  
  return (
    <div className="space-y-3 text-[13.5px] leading-relaxed text-ink2">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "code-block":
            return (
              <div key={idx} className="my-3 overflow-hidden rounded-xl border border-rule bg-bg/40 max-w-full">
                {block.lang && (
                  <div className="flex items-center justify-between border-b border-rule bg-surface/60 px-4 py-2 font-mono text-[10px] text-muted uppercase tracking-wider select-none">
                    <span>{block.lang}</span>
                  </div>
                )}
                <pre className="overflow-x-auto p-4 font-mono text-[11.5px] leading-normal text-ink bg-bg/20">
                  <code>{block.content}</code>
                </pre>
              </div>
            );
          case "list":
            return (
              <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2.5 text-ink2">
                {block.items?.map((item, itemIdx) => (
                  <li key={itemIdx}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "header":
            if (block.level === 3) {
              return (
                <h4 key={idx} className="font-semibold text-ink mt-4 mb-2 text-[13px] font-mono">
                  {renderInline(block.content)}
                </h4>
              );
            }
            return (
              <h3 key={idx} className="font-semibold text-ink mt-5 mb-2.5 text-[14px] font-mono border-b border-rule pb-1">
                {renderInline(block.content)}
              </h3>
            );
          case "paragraph":
          default:
            return <p key={idx} className="my-1.5">{renderInline(block.content)}</p>;
        }
      })}
    </div>
  );
}

function getModelDisplayName(modelId: string) {
  switch (modelId) {
    case "@cf/meta/llama-3.1-8b-instruct":
      return "Llama 3.1 8B (Rec)";
    case "@cf/meta/llama-3.2-3b-instruct":
      return "Llama 3.2 3B (Fast)";
    case "@cf/meta/llama-3.3-70b-instruct":
      return "Llama 3.3 70B (Smart)";
    case "@cf/qwen/qwen2.5-coder-32b-instruct":
      return "Qwen 2.5 Coder 32B";
    case "@cf/qwen/qwen2.5-7b-instruct":
      return "Qwen 2.5 7B";
    case "@cf/mistral/mistral-7b-instruct-v0.3":
      return "Mistral 7B v0.3";
    case "@cf/tinyllama/tinyllama-1.1b-chat-v1.0":
      return "TinyLlama 1.1B";
    default:
      return "Alternative Model";
  }
}

export function AIChatDrawer() {
  const { aiOpen, setAiOpen } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("@cf/meta/llama-3.1-8b-instruct");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load selected model from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chat_model");
      if (saved) setModel(saved);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (aiOpen) {
      scrollToBottom();
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, aiOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAiOpen(false);
    };
    if (aiOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [aiOpen, setAiOpen]);

  // Lock body scroll when AI Chat Drawer is open to prevent background page scroll chaining
  useEffect(() => {
    if (aiOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [aiOpen]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role === "system" ? "assistant" : m.role, // System messages are internal fallback records, map to assistant for API context
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, model }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to call AI assistant.");
      }

      const actualModel = data.modelUsed;
      const fallbackHappened = actualModel && actualModel !== model;

      setMessages((prev) => {
        const list = [...prev];
        if (fallbackHappened) {
          list.push({
            id: `sys-fallback-${Date.now()}`,
            role: "system",
            content: `Switched to ${getModelDisplayName(actualModel)} due to fallback`,
          });
          setModel(actualModel);
          localStorage.setItem("chat_model", actualModel);
        }
        list.push({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
        });
        return list;
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: err.message || "An unexpected error occurred. Please verify your connection or api configurations.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <AnimatePresence>
      {aiOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAiOpen(false)}
            className="fixed inset-0 bg-[#141313]/30 backdrop-blur-[4px] z-[240] cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[440px] z-[250] bg-surface/85 backdrop-blur-xl border-l border-rule/50 shadow-[-10px_0_50px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden overscroll-contain"
          >
            {/* Ambient glows inside the drawer */}
            <div className="absolute top-1/4 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-40 h-40 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <header className="relative flex items-center justify-between px-6 py-4 border-b border-rule bg-surface/40 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent animate-pulse" />
                <h2 className="font-mono text-[14px] text-ink font-semibold tracking-tight">
                  // personal.assistant
                </h2>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block animate-ping" />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    localStorage.setItem("chat_model", e.target.value);
                  }}
                  className="bg-tag-bg hover:bg-rule/10 text-[11.5px] font-mono text-ink border border-rule hover:border-ink/50 focus:outline-none rounded-lg px-2.5 py-1.5 max-w-[140px] sm:max-w-[180px] truncate transition-all cursor-pointer"
                  title="Change AI Model"
                >
                  <option value="@cf/meta/llama-3.1-8b-instruct" className="bg-surface text-ink text-[11px]">Llama 3.1 8B (Rec)</option>
                  <option value="@cf/meta/llama-3.2-3b-instruct" className="bg-surface text-ink text-[11px]">Llama 3.2 3B (Fast)</option>
                  <option value="@cf/meta/llama-3.3-70b-instruct" className="bg-surface text-ink text-[11px]">Llama 3.3 70B (Smart)</option>
                  <option value="@cf/qwen/qwen2.5-coder-32b-instruct" className="bg-surface text-ink text-[11px]">Qwen 2.5 Coder 32B</option>
                  <option value="@cf/qwen/qwen2.5-7b-instruct" className="bg-surface text-ink text-[11px]">Qwen 2.5 7B</option>
                  <option value="@cf/mistral/mistral-7b-instruct-v0.3" className="bg-surface text-ink text-[11px]">Mistral 7B v0.3</option>
                  <option value="@cf/tinyllama/tinyllama-1.1b-chat-v1.0" className="bg-surface text-ink text-[11px]">TinyLlama 1.1B</option>
                </select>

                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    title="Clear Chat History"
                    className="p-2 rounded-lg text-muted hover:text-ink hover:bg-rule/10 transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
                <button
                  onClick={() => setAiOpen(false)}
                  className="p-2 rounded-lg text-muted hover:text-ink hover:bg-rule/10 transition-colors cursor-pointer"
                  aria-label="Close Assistant"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            {/* Chat Area */}
            <div className="relative flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-4 z-10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center py-8 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      {/* Pulsing glow ring */}
                      <span className="absolute inset-0 rounded-full bg-accent/20 blur-md animate-pulse" />
                      <div className="relative w-14 h-14 rounded-full border border-accent/20 flex items-center justify-center bg-surface text-accent shadow-md">
                        <Sparkles size={24} className="animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 px-6">
                    <h3 className="font-mono text-[14px] text-ink font-semibold tracking-tight">
                      // Lothin's Copilot
                    </h3>
                    <p className="text-[13px] text-ink2 leading-relaxed font-sans max-w-[300px] mx-auto">
                      Hello! I'm here to guide you through Lothin's background, professional projects, technical stack, and learning articles.
                    </p>
                  </div>

                  <div className="space-y-2.5 max-w-[340px] mx-auto w-full text-left pt-2">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-wider block px-1">
                      Suggestions
                    </span>
                    <div className="flex flex-col gap-2">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(s)}
                          className="w-full text-left px-3.5 py-2.5 border border-rule/50 hover:border-accent/50 bg-surface/50 hover:bg-accent/[0.02] rounded-xl text-[12.5px] font-sans text-ink2 hover:text-ink transition-all duration-200 hover:translate-x-1 flex items-center justify-between group cursor-pointer"
                        >
                          <span>{s}</span>
                          <span className="text-[10px] font-mono text-muted group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                            →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {messages.map((m) => {
                    if (m.role === "system") {
                      return (
                        <div key={m.id} className="flex justify-center my-1.5 w-full">
                          <div className="px-3.5 py-2 rounded-xl bg-tag-bg border border-rule/40 text-[11px] font-mono text-ink2 flex items-center gap-2 max-w-[95%] shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <RefreshCw size={11} className="text-accent animate-spin" style={{ animationDuration: '3s' }} />
                            <span>{m.content}</span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex gap-3 max-w-[90%]",
                          m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        {/* Avatar */}
                        <div
                          className={cn(
                            "w-7.5 h-7.5 rounded-full border border-rule flex items-center justify-center shrink-0 text-xs select-none shadow-sm transition-all",
                            m.role === "user" 
                              ? "bg-gradient-to-br from-accent to-accent/90 text-white border-accent" 
                              : "bg-surface text-ink"
                          )}
                        >
                          {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
                        </div>

                        {/* Content Bubble */}
                        <div
                          className={cn(
                            "px-4 py-3 rounded-2xl text-[13px] leading-relaxed transition-all",
                            m.role === "user"
                              ? "bg-gradient-to-br from-accent to-accent/95 text-white rounded-tr-none shadow-[0_4px_12px_rgba(27,93,239,0.12)]"
                              : cn(
                                  "bg-surface border border-rule rounded-tl-none shadow-[0_4px_12px_rgba(0,0,0,0.02)]",
                                  m.isError && "bg-accent-orange/5 border-accent-orange/20 text-accent-orange"
                                )
                          )}
                        >
                          {m.isError ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-accent-orange font-mono text-[12px] font-semibold">
                                <AlertCircle size={14} />
                                API Config Alert
                              </div>
                              <p className="text-[12.5px] font-sans leading-relaxed text-ink2">
                                {m.content}
                              </p>
                              <div className="bg-surface/60 border border-rule-solid p-2.5 rounded-lg text-[11px] font-mono text-ink2 leading-normal mt-2 select-all">
                                To resolve this, create or update your <code className="bg-tag-bg px-1 rounded">.env</code> with:<br />
                                <span className="text-ink font-semibold">CLOUDFLARE_API_TOKEN=your_token_here</span>
                              </div>
                            </div>
                          ) : (
                            <MarkdownText text={m.content} />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing State */}
                  {loading && (
                    <div className="flex gap-3 mr-auto max-w-[90%] font-sans">
                      <div className="w-7.5 h-7.5 rounded-full border border-rule flex items-center justify-center bg-surface text-ink shrink-0 shadow-sm">
                        <Bot size={12} />
                      </div>
                      <div className="bg-surface border border-rule rounded-2xl rounded-tl-none px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="relative p-4 border-t border-rule/50 bg-surface/40 backdrop-blur-md z-10"
            >
              <div className="relative flex items-center border border-rule/80 focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/20 rounded-xl bg-surface/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about my projects, stack, experience..."
                  disabled={loading}
                  className="w-full pl-4 pr-12 py-3.5 bg-transparent text-[13px] text-ink placeholder:text-muted focus:outline-none disabled:opacity-50 font-sans"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className={cn(
                    "absolute right-2 p-2 rounded-lg transition-all duration-200 cursor-pointer",
                    input.trim() && !loading
                      ? "bg-accent text-white shadow-[0_2px_8px_rgba(27,93,239,0.25)] hover:bg-accent/90"
                      : "text-muted opacity-40 hover:bg-transparent"
                  )}
                  aria-label="Send Message"
                >
                  <Send size={14} className={cn("transition-transform duration-200", input.trim() && !loading && "group-hover:translate-x-0.5")} />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
