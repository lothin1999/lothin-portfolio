"use client";

import Link from "next/link";
import { ImageCube } from "@/components/ui/ImageCube";

interface AboutCTAProps {
  title?: string;
  desc?: string;
  buttonText?: string;
  buttonHref?: string;
  photoUrl?: string;
}

export function AboutCTA({
  title = "Want to see how we can build together?",
  desc = "I take on select clients at a time. If your team has core system debt or framework integration issues, reach out.",
  buttonText = "Get in touch",
  buttonHref = "/contact",
  photoUrl,
}: AboutCTAProps) {
  return (
    <section className="py-20 text-center">
      <div className="max-w-md mx-auto px-6 flex flex-col items-center gap-4">
        <ImageCube
          imageUrl={photoUrl}
          fallbackText="SYS"
          size={100}
        />
        <h2 className="font-serif text-[28px] text-ink leading-tight mt-2">
          {title}
        </h2>
        <p className="text-[13.5px] text-ink2 leading-relaxed font-sans font-light max-w-sm">
          {desc}
        </p>
        <Link
          href={buttonHref}
          className="mt-4 px-6 py-2.5 font-mono text-[11.5px] uppercase tracking-wider text-ink border border-rule hover:border-ink rounded bg-surface hover:bg-[var(--color-surface-subtle)] transition-all inline-block"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}
