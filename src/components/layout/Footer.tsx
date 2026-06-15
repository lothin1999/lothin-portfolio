"use client";

import Link from "next/link";
import { useCVData } from "@/hooks/useCVData";

export function Footer() {
  const { cv } = useCVData();
  const { profile } = cv;

  return (
    <footer className="border-t border-rule mt-12 bg-bg pb-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Logo and Tagline */}
          <div className="flex flex-col gap-3 border-b border-rule pb-8 md:border-b-0 md:pb-0">
            <span className="font-mono text-[14px] text-ink font-semibold tracking-tight">
              lothin.dev
            </span>
            <p className="text-xs text-muted leading-relaxed font-sans max-w-[240px]">
              Full-Stack Web Developer building high-performance systems with Next.js, Nuxt, NestJS, and Cloudflare edge architecture.
            </p>
            <p className="font-mono text-[10px] text-muted tracking-wide mt-2">
              © {new Date().getFullYear()} {profile.name.first} {profile.name.last} · {profile.location}
            </p>
          </div>

          {/* Links grid container - side-by-side on mobile */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            {/* Navigation Links */}
            <div className="flex flex-col gap-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted">// Index</h4>
              <ul className="flex flex-col gap-2 list-none" role="list">
                <li>
                  <Link href="/" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                    Work
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                    Writing
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                    Reach Out
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact and Social Connections */}
            <div className="flex flex-col gap-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted">// Connect</h4>
              <ul className="flex flex-col gap-2 list-none" role="list">
                {profile.website && (
                  <li>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                      Website
                    </a>
                  </li>
                )}
                {profile.telegram && (
                  <li>
                    <a href={profile.telegram} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                      Telegram ({profile.telegramHandle || "@lothindev"})
                    </a>
                  </li>
                )}
                {profile.facebook && (
                  <li>
                    <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                      Facebook ({profile.facebookHandle || "@lothinny"})
                    </a>
                  </li>
                )}
                {profile.linkedin && (
                  <li>
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-ink hover:text-accent transition-colors">
                      LinkedIn
                    </a>
                  </li>
                )}
                {profile.phones && profile.phones.map((phone) => (
                  <li key={phone}>
                    <span className="font-mono text-[11px] text-muted">{phone}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
