"use client";

import { useCVData } from "@/hooks/useCVData";

export function Footer() {
  const { cv } = useCVData();
  const { profile } = cv;
  return (
    <footer className="border-t border-rule mt-8">
      <div className="max-w-content mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="font-mono text-[11px] text-muted tracking-wide">
          © {new Date().getFullYear()} {profile.name.first} {profile.name.last} — {profile.location}
        </p>
        <ul className="flex gap-5 list-none" role="list">
          {[
            { label: "Website", href: profile.website },
            { label: "Telegram", href: profile.telegram },
            { label: "LinkedIn", href: profile.linkedin },
          ].filter(l => l.href).map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noopener noreferrer"
                className="font-mono text-[11px] text-muted hover:text-accent transition-colors tracking-wide">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
