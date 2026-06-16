"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, Sparkles, FileText, Mail, AlertCircle } from "lucide-react";
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

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleDownloadCV = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cv.profile?.cvPdfUrl) {
      e.preventDefault();
      setAlertState({
        isOpen: true,
        title: "CV Not Found",
        message: "The CV PDF document has not been uploaded to Cloudflare R2 yet. Please contact me directly or check back later.",
      });
    }
  };

  const handleDownloadCoverLetter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cv.profile?.coverLetterPdfUrl) {
      e.preventDefault();
      setAlertState({
        isOpen: true,
        title: "Letter Not Found",
        message: "The Cover Letter PDF document has not been uploaded to Cloudflare R2 yet. Please contact me directly or check back later.",
      });
    }
  };

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
            {cv.profile?.cvPdfUrl && (
              <a
                href={cv.profile.cvPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded border border-rule hover:border-ink hover:text-accent transition-all duration-200 flex items-center justify-center text-ink"
                title="Download CV"
                aria-label="Download CV"
              >
                <FileText size={15} />
              </a>
            )}
            {cv.profile?.coverLetterPdfUrl && (
              <a
                href={cv.profile.coverLetterPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded border border-rule hover:border-ink hover:text-accent transition-all duration-200 flex items-center justify-center gap-2 text-ink"
                title="Download Letter"
                aria-label="Download Letter"
              >
                <Mail size={14} />
                <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">Download Letter</span>
              </a>
            )}
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
            {cv.profile?.cvPdfUrl && (
              <a
                href={cv.profile.cvPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded border border-rule hover:border-ink hover:text-accent transition-all duration-200 flex items-center justify-center text-ink"
                title="Download CV"
                aria-label="Download CV"
              >
                <FileText size={15} />
              </a>
            )}
            {cv.profile?.coverLetterPdfUrl && (
              <a
                href={cv.profile.coverLetterPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 rounded border border-rule hover:border-ink hover:text-accent transition-all duration-200 flex items-center justify-center gap-1.5 text-ink"
                title="Download Letter"
                aria-label="Download Letter"
              >
                <Mail size={14} />
                <span className="font-mono text-[9px] font-semibold tracking-wider uppercase">Download Letter</span>
              </a>
            )}
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

      {alertState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bg/65 backdrop-blur-md animate-alert-fade-in">
          <div className="bg-surface border border-rule max-w-sm w-full rounded p-6 shadow-2xl relative overflow-hidden animate-alert-zoom-in">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-accent-orange" />
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <AlertCircle size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
                  {alertState.title}
                </h3>
                <p className="text-[12.5px] text-ink2 leading-relaxed font-sans font-light">
                  {alertState.message}
                </p>
              </div>
              <button
                onClick={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                className="mt-2 w-full py-2 px-4 bg-ink hover:bg-accent text-white hover:text-white dark:bg-ink dark:hover:bg-accent text-xs font-mono rounded tracking-wide transition-all duration-200 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
