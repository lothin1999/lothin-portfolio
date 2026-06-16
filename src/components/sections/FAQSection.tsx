"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    question: "What is your primary technology stack?",
    answer: (
      <>
        I specialize in full-stack development, using <strong className="font-semibold text-ink">NestJS, Laravel, and Spring Boot</strong> for backends, and <strong className="font-semibold text-ink">Vue/Nuxt or React/Next.js</strong> for modern, responsive frontends. I also work with database design (PostgreSQL/MySQL), caching strategies (Redis), and cloud integration (Firebase/Cloudflare).
      </>
    ),
  },
  {
    question: "Do you offer freelance consulting or contract services?",
    answer: (
      <>
        Yes, I take on select freelance consulting and development contracts. I help businesses optimize slow performance, migrate legacy codebases (like migrating older Vue or Laravel apps), and integrate specialized local systems.
      </>
    ),
  },
  {
    question: "What is your experience with payment gateways and local APIs in Cambodia?",
    answer: (
      <>
        I have hands-on experience integrating Cambodia-native systems, specifically the <strong className="font-semibold text-ink">Bakong KHQR</strong> payment gateway. I handle securing webhooks, verifying transaction signatures, and ensuring reliable checkout flows with real-time status updates using WebSockets or Pusher.
      </>
    ),
  },
  {
    question: "How do you approach performance debugging?",
    answer: (
      <>
        I track metrics based on Google&apos;s Core Web Vitals (LCP, INP, FID). I analyze database query execution plans, set up indexing, configure Redis or Cloudflare Edge caching, optimize assets, and defer/reduce client-side JavaScript payloads to guarantee sub-second load times.
      </>
    ),
  },
  {
    question: "How can we work together?",
    answer: (
      <>
        You can get in touch via the <a href="/contact" className="text-accent hover:text-accent-orange transition-colors underline decoration-dotted font-medium">Contact page</a>. We will set up a quick discovery call to define your project requirements, scope the architecture, and align on timeline milestones.
      </>
    ),
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="border-b border-rule py-16" aria-labelledby="faq-title">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center gap-2 border-b border-rule pb-5 mb-8">
          <span className="font-mono text-[10.5px] uppercase tracking-[2px] text-muted font-semibold">
            08 // section.faq
          </span>
          <span className="w-4 h-px bg-rule inline-block" />
          <h2 id="faq-title" className="font-mono text-[11px] uppercase text-ink tracking-wider font-semibold">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Intro Subtext */}
          <div className="lg:col-span-4 lg:sticky lg:top-[74px]">
            <p className="text-[14.5px] text-ink2 leading-relaxed font-sans font-light">
              Common questions about my technical stack, development practices, payment integrations, and how we can collaborate on projects.
            </p>
          </div>

          {/* Right Column - Accordion Items */}
          <div className="lg:col-span-8 space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border border-rule bg-surface rounded hover:border-ink transition-colors duration-250 overflow-hidden"
                >
                  <button
                    onClick={() => toggleIndex(index)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-sans text-ink hover:text-accent transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-muted shrink-0 select-none">
                        {String(index + 1).padStart(2, "0")}.
                      </span>
                      <span className="text-[14.5px] font-medium leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    {/* Toggle Icon: Smooth plus-minus transition */}
                    <div className="relative w-4 h-4 shrink-0 flex items-center justify-center text-muted group-hover:text-accent">
                      <span className="absolute h-[1.5px] w-3.5 bg-current" />
                      <span
                        className={`absolute h-3.5 w-[1.5px] bg-current transition-all duration-300 origin-center ${
                          isOpen ? "scale-y-0 rotate-90" : "scale-y-100"
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-1 pl-[38px] border-t border-rule/50 text-[13.5px] text-ink2 leading-relaxed font-sans font-light">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
