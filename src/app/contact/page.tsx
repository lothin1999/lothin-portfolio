"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCVData } from "@/hooks/useCVData";
import { ActivePathBridge } from "@/components/ui/ActivePathBridge";
import { Glyph } from "@/components/ui/Glyph";
import { ArrowUpRight } from "lucide-react";

export default function ContactPage() {
  const { cv, isLoading } = useCVData();
  const [step, setStep] = useState(0);

  // Typewriter sequence for handshake connection simulation
  useEffect(() => {
    if (isLoading) return;
    const timers = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

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

  const { profile } = cv;

  return (
    <div className="bg-bg min-h-screen">
      <ActivePathBridge segment="contact" />

      {/* Page Header */}
      <header className="border-b border-rule py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[10.5px] tracking-[2.5px] uppercase text-accent mb-3 flex items-center gap-2.5 font-semibold">
            <span className="w-5 h-px bg-accent shrink-0 inline-block" />
            01 // page.contact
          </p>
          <h1 className="font-serif text-[clamp(48px,8vw,78px)] font-normal text-ink leading-none tracking-tight">
            Contact
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-[2px] mt-4">
            // establish.connection · socket.handshake · channel.open
          </p>
        </div>
      </header>

      {/* Connection terminal log */}
      <section className="border-b border-rule bg-surface py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="font-mono text-[12px] bg-bg border border-rule rounded p-5 max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
              <span className="text-muted">// terminal.log</span>
            </div>
            <div className="pt-2 space-y-1">
              <p className={`transition-opacity duration-300 ${step >= 0 ? "opacity-100" : "opacity-0"}`}>
                <span className="text-muted">&gt;</span> establishing connection...
              </p>
              <p className={`transition-opacity duration-300 ${step >= 1 ? "opacity-100" : "opacity-0"}`}>
                <span className="text-muted">&gt;</span> handshake complete
              </p>
              <p className={`transition-opacity duration-300 ${step >= 2 ? "opacity-100" : "opacity-0"} text-accent-green font-semibold`}>
                <span className="text-muted">&gt;</span> channel open_
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 02 // section.reach */}
      <section className="border-b border-rule py-16" aria-labelledby="reach-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-10">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              02 // section.reach
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="reach-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              How to Reach Me
            </h2>
          </div>

          <p className="text-[14.5px] text-ink2 leading-relaxed font-sans font-light max-w-xl mb-10">
            Let&apos;s build something stable together. You can reach out through any of these communication channels, and I&apos;ll get back to you within 2 business days.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Telegram Channel */}
            {profile.telegram && (
              <div className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1">
                    Direct Messenger (Preferred)
                  </span>
                  <h3 className="font-serif text-xl text-ink font-semibold mb-2">Telegram</h3>
                  <p className="font-mono text-xs text-accent mb-4">{profile.telegramHandle || "@lothin01"}</p>
                </div>
                <a
                  href={profile.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-accent hover:text-accent-orange font-semibold inline-flex items-center gap-1 link-underline w-fit mt-4"
                >
                  Send message <ArrowUpRight size={13} />
                </a>
              </div>
            )}

            {/* LinkedIn Channel */}
            {profile.linkedin && (
              <div className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1">
                    Professional Network
                  </span>
                  <h3 className="font-serif text-xl text-ink font-semibold mb-2">LinkedIn</h3>
                  <p className="font-mono text-xs text-accent mb-4">linkedin.com/in/lothin-dev</p>
                </div>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-accent hover:text-accent-orange font-semibold inline-flex items-center gap-1 link-underline w-fit mt-4"
                >
                  View profile <ArrowUpRight size={13} />
                </a>
              </div>
            )}

            {/* Phone Channel */}
            {profile.phones.length > 0 && (
              <div className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors duration-200 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1">
                    Direct Voice Lines
                  </span>
                  <h3 className="font-serif text-xl text-ink font-semibold mb-2">Phone</h3>
                  <div className="space-y-1">
                    {profile.phones.map((phone) => (
                      <p key={phone} className="font-mono text-xs text-ink">{phone}</p>
                    ))}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider mt-4">
                  Phnom Penh, Cambodia
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 03 // section.process */}
      <section className="py-16 bg-[var(--color-surface-subtle)]" aria-labelledby="process-title">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 border-b border-rule pb-5 mb-10">
            <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
              03 // section.process
            </span>
            <span className="w-4 h-px bg-rule inline-block" />
            <h2 id="process-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
              What Happens Next
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Review & Response",
                desc: "I will evaluate your project details, technical stack constraints, and framework issues, and respond with some clarifying questions within 2 business days.",
              },
              {
                step: "02",
                title: "Discovery Call",
                desc: "If it looks like a fit, we hop on a 30-minute call to discuss your current frontend performance hurdles, DB schemas, or payment integration logic.",
              },
              {
                step: "03",
                title: "Proposal or Reference",
                desc: "I&apos;ll send an execution proposal details document mapping out dependencies and scopes. If we are not a fit, I&apos;ll refer you to other specialists.",
              },
            ].map((p) => (
              <div key={p.step} className="border border-rule bg-surface p-5 rounded hover:border-ink transition-colors flex flex-col">
                <span className="font-mono text-[24px] text-accent font-semibold mb-2">{p.step}</span>
                <h3 className="font-serif text-lg text-ink font-semibold mb-2">{p.title}</h3>
                <p className="text-[13px] text-ink2 leading-relaxed font-sans font-light">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
