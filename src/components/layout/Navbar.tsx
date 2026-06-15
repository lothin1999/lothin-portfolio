"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, Sparkles } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { useCVData } from "@/hooks/useCVData";
import { useSettings } from "@/components/layout/SettingsContext";

const DEFAULT_NAV_LINKS = [
  { href: "/", label: "Home", sectionId: "home", pathMatch: "/" },
  { href: "/about", label: "About", sectionId: "about", pathMatch: "/about" },
  { href: "/portfolio", label: "Work", sectionId: "work", pathMatch: "/portfolio" },
  { href: "/services", label: "Services", sectionId: "services", pathMatch: "/services" },
  { href: "/articles", label: "Writing", sectionId: "writing", pathMatch: "/articles" },
  { href: "/contact", label: "Reach Out", sectionId: "contact", pathMatch: "/contact" },
];

export function Navbar() {
  const { cv } = useCVData();
  const { aiOpen, setAiOpen } = useSettings();
  const navLinks = cv.adminSettings?.navLinks || DEFAULT_NAV_LINKS;
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // No anchor-based intersection observers needed — all sections are now separate pages.
  // (previously: IntersectionObserver to highlight active section on homepage)

  const handleNavClick = () => setMobileOpen(false);

  const isActive = (link: (typeof navLinks)[0]) => {
    if (!pathname) return false;
    if (link.pathMatch === "/") return pathname === "/";
    if (link.pathMatch === "/articles") return pathname.startsWith("/articles");
    return pathname.startsWith(link.pathMatch);
  };

  return (
    <>
      <ScrollProgressBar />
      <nav className={cn(
        "sticky top-0 z-40 h-[58px] bg-bg border-b border-rule transition-shadow duration-200",
        scrolled && "shadow-sm"
      )} aria-label="Main navigation">
        <div className={cn(
          "h-full flex items-center justify-between gap-6",
          pathname === "/edit" ? "w-full px-6 md:px-12" : "max-w-6xl mx-auto px-6"
        )}>
          <Link href="/" className="font-mono text-[14px] text-ink font-semibold tracking-tight hover:text-accent transition-colors shrink-0">
            lothin.dev
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <ul className="flex items-center gap-6 list-none" role="list">
              {navLinks.map((link) => (
                <li key={link.sectionId}>
                  <Link
                    href={link.href}
                    onClick={handleNavClick}
                    className={cn("nav-link font-sans text-xs uppercase tracking-wider", isActive(link) && "active")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setAiOpen(!aiOpen)}
              className={cn(
                "p-1.5 rounded border border-rule hover:border-ink hover:text-accent transition-all duration-200 cursor-pointer flex items-center justify-center relative text-ink",
                aiOpen && "border-accent text-accent bg-accent/5"
              )}
              aria-label="Ask Lothin's AI Assistant"
              title="Ask Lothin's AI Assistant"
            >
              <Sparkles size={15} className={cn("transition-transform duration-300", aiOpen && "scale-110 rotate-12")} />
            </button>
            <DarkModeToggle />
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setAiOpen(!aiOpen)}
              className={cn(
                "p-1.5 rounded border border-rule hover:border-ink hover:text-accent transition-all duration-200 cursor-pointer flex items-center justify-center text-ink",
                aiOpen && "border-accent text-accent bg-accent/5"
              )}
              aria-label="Ask Lothin's AI Assistant"
            >
              <Sparkles size={15} />
            </button>
            <DarkModeToggle />
            <button className="p-1.5 rounded text-ink hover:text-accent transition-colors"
              aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-bg flex flex-col p-6"
          role="dialog" aria-modal="true">
          <div className="flex items-center justify-between mb-10">
            <span className="font-mono text-[14px] text-ink font-semibold">
              lothin.dev
            </span>
            <button className="p-1.5 text-ink hover:text-accent transition-colors"
              aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <X size={22} />
            </button>
          </div>
          <ul className="list-none flex flex-col gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.sectionId}>
                <Link
                  href={link.href}
                  onClick={handleNavClick}
                  className={cn(
                    "block py-3 text-[16px] text-ink hover:text-accent transition-colors border-b border-rule font-sans font-light",
                    isActive(link) && "text-accent"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
