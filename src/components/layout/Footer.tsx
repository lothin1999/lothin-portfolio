"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCVData } from "@/hooks/useCVData";

export function Footer() {
  const pathname = usePathname();
  const { cv } = useCVData();
  const { profile } = cv;
  const navLinks = cv.adminSettings?.navLinks || [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/portfolio", label: "Work" },
    { href: "/services", label: "Services" },
    { href: "/articles", label: "Writing" },
    { href: "/contact", label: "Reach Out" },
  ];

  if (pathname === "/edit") return null;

  return (
    <footer className="border-t border-rule mt-12 bg-bg pb-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Logo and Tagline */}
          <div className="flex flex-col gap-3 border-b border-rule pb-8 md:border-b-0 md:pb-0">
            <span className="font-mono text-[14px] text-ink font-semibold tracking-tight">
              lothin.dev
            </span>
            <p className="text-xs text-muted leading-relaxed font-sans max-w-[280px]">
              {cv.adminSettings?.footerTagline || "Senior Officer, Printing Tools Developments and Support at Amret Bank. Full-Stack Web Developer building high-performance systems."}
            </p>
            <p className="font-mono text-[10px] text-muted tracking-wide mt-2">
              {cv.adminSettings?.footerCopyright || `© ${new Date().getFullYear()} ${profile.name.first} ${profile.name.last} · ${profile.location}`}
            </p>
            {cv.adminSettings?.footerNote && (
              <p className="font-mono text-[9px] text-accent/80 tracking-wide mt-1">
                // {cv.adminSettings.footerNote}
              </p>
            )}
          </div>

          {/* Links grid container - side-by-side on mobile */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            {/* Navigation Links */}
            <div className="flex flex-col gap-3">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted">// Index</h4>
              <ul className="flex flex-col gap-2 list-none" role="list">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-sans text-xs text-ink hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
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
                {profile.cvPdfUrl && (
                  <li>
                    <a href={profile.cvPdfUrl} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-accent hover:text-accent-orange transition-colors">
                      CV (PDF)
                    </a>
                  </li>
                )}
                {profile.coverLetterPdfUrl && (
                  <li>
                    <a href={profile.coverLetterPdfUrl} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-accent hover:text-accent-orange transition-colors">
                      Cover Letter (PDF)
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
