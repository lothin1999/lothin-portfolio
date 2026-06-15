"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings } from "./SettingsContext";
import { Sparkles, X, Send, Bot, User, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
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
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-[13.5px] leading-relaxed text-ink2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1 my-1">
              <li>{renderInline(content)}</li>
            </ul>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-semibold text-ink mt-3 mb-1 text-[13px] font-mono">
              {renderInline(trimmed.substring(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="font-semibold text-ink mt-4 mb-1 text-[14px] font-mono border-b border-rule pb-0.5">
              {renderInline(trimmed.substring(3))}
            </h3>
          );
        }
        if (trimmed === "") {
          return <div key={idx} className="h-1.5" />;
        }
        return <p key={idx}>{renderInline(line)}</p>;
      })}
    </div>
  );
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
        role: m.role,
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

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
        },
      ]);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[240] cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[440px] z-[250] bg-surface/95 backdrop-blur-md border-l border-rule shadow-2xl flex flex-col"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-rule">
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
                  className="bg-transparent text-[11px] font-mono text-muted hover:text-ink focus:outline-none border border-rule hover:border-ink rounded px-1.5 py-0.5 max-w-[130px] sm:max-w-[160px] truncate transition-colors cursor-pointer"
                  title="Change AI Model"
                >
                  <option value="@cf/meta/llama-3.1-8b-instruct" className="bg-surface text-ink text-[11px]">Llama 3.1 8B</option>
                  <option value="@cf/meta/llama-3.2-3b-instruct" className="bg-surface text-ink text-[11px]">Llama 3.2 3B</option>
                  <option value="@cf/qwen/qwen3-30b-a3b-fp8" className="bg-surface text-ink text-[11px]">Qwen3 30B</option>
                  <option value="@cf/qwen/qwen2.5-coder-32b-instruct" className="bg-surface text-ink text-[11px]">Qwen 2.5 Coder</option>
                </select>

                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    title="Clear Chat History"
                    className="p-1 rounded text-muted hover:text-ink hover:bg-rule/10 transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
                <button
                  onClick={() => setAiOpen(false)}
                  className="p-1 rounded text-muted hover:text-ink hover:bg-rule/10 transition-colors cursor-pointer"
                  aria-label="Close Assistant"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center py-6 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full border border-rule flex items-center justify-center bg-tag-bg text-accent">
                      <Bot size={24} />
                    </div>
                  </div>
                  <div className="space-y-2 px-4">
                    <h3 className="font-mono text-[14px] text-ink font-medium">
                      Ask Lothin's AI Assistant
                    </h3>
                    <p className="text-[13px] text-muted leading-relaxed font-sans max-w-[280px] mx-auto">
                      Hello! I can answer questions about Thoeun Lothin's skills, professional work history, education, and articles.
                    </p>
                  </div>

                  <div className="space-y-2 max-w-[320px] mx-auto w-full text-left">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-wider block px-1">
                      Suggestions
                    </span>
                    <div className="flex flex-col gap-2">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(s)}
                          className="w-full text-left px-3 py-2 border border-rule hover:border-ink hover:bg-tag-bg rounded text-[12.5px] font-sans text-ink2 transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {messages.map((m) => (
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
                          "w-7 h-7 rounded-full border border-rule flex items-center justify-center shrink-0 text-xs font-mono select-none",
                          m.role === "user" ? "bg-accent text-white border-accent" : "bg-tag-bg text-ink"
                        )}
                      >
                        {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
                      </div>

                      {/* Content Bubble */}
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl",
                          m.role === "user"
                            ? "bg-accent text-white rounded-tr-none"
                            : cn(
                                "bg-surface border border-rule rounded-tl-none shadow-sm",
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
                            <div className="bg-bg/50 border border-rule-solid p-2 rounded text-[11px] font-mono text-muted leading-normal mt-2 select-all">
                              To resolve this, create or update your <code className="bg-tag-bg px-1 rounded">.env</code> with:<br />
                              <span className="text-ink font-semibold">CLOUDFLARE_API_TOKEN=your_token_here</span>
                            </div>
                          </div>
                        ) : (
                          <MarkdownText text={m.content} />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing State */}
                  {loading && (
                    <div className="flex gap-3 mr-auto max-w-[90%]">
                      <div className="w-7 h-7 rounded-full border border-rule flex items-center justify-center bg-tag-bg text-ink shrink-0">
                        <Bot size={12} />
                      </div>
                      <div className="bg-surface border border-rule rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" />
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
              className="p-4 border-t border-rule bg-surface/50 backdrop-blur-sm"
            >
              <div className="relative flex items-center border border-rule focus-within:border-ink rounded-lg bg-surface transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about my projects, stack, experience..."
                  disabled={loading}
                  className="w-full pl-4 pr-12 py-3 bg-transparent text-[13px] text-ink placeholder:text-muted focus:outline-none disabled:opacity-50 font-sans"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-1.5 rounded-md hover:bg-rule/10 text-muted hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted transition-all cursor-pointer"
                  aria-label="Send Message"
                >
                  <Send size={15} />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
