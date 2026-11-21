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
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_NAV_LINKS = [
  { href: "/", label: "Home", sectionId: "home", pathMatch: "/" },
  { href: "/about", label: "About", sectionId: "about", pathMatch: "/about" },
  { href: "/portfolio", label: "Work", sectionId: "work", pathMatch: "/portfolio" },
  { href: "/services", label: "Services", sectionId: "services", pathMatch: "/services" },
  { href: "/articles", label: "Writing", sectionId: "writing", pathMatch: "/articles" },
  { href: "/documents", label: "Documents", sectionId: "documents", pathMatch: "/documents" },
  { href: "/contact", label: "Reach Out", sectionId: "contact", pathMatch: "/contact" },
];

export function Navbar() {
  const { cv } = useCVData();
  const {
    aiOpen,
    setAiOpen,
    customCursor,
    setCustomCursor,
    scrambleText,
    setScrambleText,
    smoothScroll,
    setSmoothScroll,
  } = useSettings();
  const navLinks = cv.adminSettings?.navLinks || DEFAULT_NAV_LINKS;
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuTime, setMenuTime] = useState("");
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleNavClick = () => setMobileOpen(false);

  // Track scroll shadow and progress
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.round(Math.min(100, Math.max(0, progress))));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Sync optimistic path with actual route when router settles
  useEffect(() => {
    setOptimisticPath(pathname);
  }, [pathname]);

  const currentPath = optimisticPath ?? pathname;

  const isActive = (link: (typeof navLinks)[0]) => {
    if (!currentPath) return false;
    if (link.pathMatch === "/") return currentPath === "/";
    if (link.pathMatch === "/articles") return currentPath.startsWith("/articles");
    return currentPath.startsWith(link.pathMatch);
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
              {navLinks.map((link) => {
                const active = isActive(link);
                return (
                  <li key={link.sectionId} className="relative py-1">
                    <Link
                      href={link.href}
                      prefetch={true}
                      onPointerDown={() => setOptimisticPath(link.href)}
                      onClick={() => {
                        setOptimisticPath(link.href);
                        handleNavClick();
                      }}
                      className={cn(
                        "relative font-sans text-xs uppercase tracking-wider transition-colors duration-150 py-1 px-1 block",
                        active ? "text-accent font-semibold" : "text-muted hover:text-ink"
                      )}
                    >
                      {link.label}
                      {active && (
                        <motion.span
                          layoutId="navbar-indicator"
                          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent rounded-full pointer-events-none"
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
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
                className="p-1.5 rounded border border-rule hover:border-ink hover:text-accent transition-all duration-200 flex items-center justify-center text-ink"
                title="Download Cover Letter"
                aria-label="Download Cover Letter"
              >
                <Mail size={15} />
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
                className="p-1.5 rounded border border-rule hover:border-ink hover:text-accent transition-all duration-200 flex items-center justify-center text-ink"
                title="Download Cover Letter"
                aria-label="Download Cover Letter"
              >
                <Mail size={15} />
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

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-bg/95 backdrop-blur-xl flex flex-col p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Visual tech grid and CRT scanlines */}
            <div className="absolute inset-0 tech-grid-bg opacity-30 pointer-events-none" />
            <div className="scanline-overlay" />
            <div className="scanline-bar" />

            <div className="relative z-10 flex flex-col h-full min-h-[580px] justify-between">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-8 border-b border-rule pb-4">
                <div className="flex items-center gap-1.5 font-mono text-[14px] text-ink font-semibold">
                  <span className="text-accent animate-pulse font-bold">&gt;</span>
                  <span>lothin.dev</span>
                  <span className="w-1.5 h-3.5 bg-accent/70 animate-ping" />
                </div>
                <button
                  className="px-2.5 py-1 border border-rule hover:border-accent text-ink hover:text-accent font-mono text-xs rounded transition-all duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>[</span>
                  <span className="text-accent px-0.5">X</span>
                  <span>]</span>
                </button>
              </div>

              {/* Main Content Sections */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                {/* Navigation Links */}
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[1.5px] text-muted font-semibold mb-3">// navigation</p>
                  <ul className="list-none flex flex-col gap-1.5" role="list">
                    {navLinks.map((link, idx) => {
                      const active = isActive(link);
                      return (
                        <motion.li
                          key={link.sectionId}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.3, ease: "easeOut" }}
                        >
                          <Link
                            href={link.href}
                            prefetch={true}
                            onPointerDown={() => setOptimisticPath(link.href)}
                            onClick={() => {
                              setOptimisticPath(link.href);
                              handleNavClick();
                            }}
                            className={cn(
                              "group flex items-baseline py-1 font-display italic text-3xl font-light text-ink/80 hover:text-accent transition-all duration-200 relative",
                              active && "text-accent font-normal"
                            )}
                          >
                            <span className="font-mono text-[10px] not-italic text-muted group-hover:text-accent/60 mr-3.5">
                              0{idx + 1}.
                            </span>
                            <span>{link.label}</span>
                            {active && (
                              <span className="font-mono text-xs not-italic text-accent ml-2 animate-pulse font-normal">
                                [ active ]
                              </span>
                            )}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>

                {/* Configuration Panel */}
                <div className="border border-rule/75 bg-surface/55 p-4 rounded backdrop-blur-sm shadow-sm">
                  <p className="font-mono text-[9px] uppercase tracking-[1.5px] text-muted font-semibold mb-3">// site.config</p>
                  <div className="flex flex-col gap-3 font-mono text-[11px]">
                    {/* Custom Cursor Toggle */}
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-ink font-medium">Custom Cursor</span>
                      <button
                        onClick={() => setCustomCursor(!customCursor)}
                        className={cn(
                          "px-2 py-0.5 border text-[10px] rounded transition-all duration-200 cursor-pointer",
                          customCursor ? "border-accent text-accent bg-accent/5 font-semibold" : "border-rule text-muted"
                        )}
                        role="switch"
                        aria-checked={customCursor}
                      >
                        {customCursor ? "ON" : "OFF"}
                      </button>
                    </div>

                    {/* Smooth Scroll Toggle */}
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-ink font-medium">Smooth Scroll</span>
                      <button
                        onClick={() => setSmoothScroll(!smoothScroll)}
                        className={cn(
                          "px-2 py-0.5 border text-[10px] rounded transition-all duration-200 cursor-pointer",
                          smoothScroll ? "border-accent text-accent bg-accent/5 font-semibold" : "border-rule text-muted"
                        )}
                        role="switch"
                        aria-checked={smoothScroll}
                      >
                        {smoothScroll ? "ON" : "OFF"}
                      </button>
                    </div>

                    {/* Text Scramble Toggle */}
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-ink font-medium">Text Scramble</span>
                      <button
                        onClick={() => setScrambleText(!scrambleText)}
                        className={cn(
                          "px-2 py-0.5 border text-[10px] rounded transition-all duration-200 cursor-pointer",
                          scrambleText ? "border-accent text-accent bg-accent/5 font-semibold" : "border-rule text-muted"
                        )}
                        role="switch"
                        aria-checked={scrambleText}
                      >
                        {scrambleText ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Telemetry Display */}
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border border-rule/50 p-4 rounded bg-surface/30">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col">
                      <span className="text-muted text-[8px] uppercase tracking-wider">STATUS</span>
                      <span className="text-accent-green font-semibold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse inline-block" />
                        OPERATIONAL
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted text-[8px] uppercase tracking-wider">CLOCK (UTC+7)</span>
                      <span className="text-ink font-medium mt-0.5">{menuTime}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col">
                      <span className="text-muted text-[8px] uppercase tracking-wider">LOCATION</span>
                      <span className="text-ink font-medium mt-0.5">PHNOM PENH, KH</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted text-[8px] uppercase tracking-wider">SCROLL POS</span>
                      <span className="text-ink font-medium mt-0.5">{scrollProgress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Downloads & Connect row */}
              <div className="mt-auto pt-4 border-t border-rule space-y-4">
                {(cv.profile?.cvPdfUrl || cv.profile?.coverLetterPdfUrl) && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[1.5px] text-muted font-semibold mb-2">// assets</p>
                    <div className="grid grid-cols-2 gap-2">
                      {cv.profile?.cvPdfUrl && (
                        <a
                          href={cv.profile.cvPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleNavClick}
                          className="py-2 px-3 bg-surface border border-rule hover:border-ink text-ink text-[11px] font-mono rounded tracking-wide transition-all duration-200 inline-flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <FileText size={12} className="text-accent" />
                          CV.PDF
                        </a>
                      )}
                      {cv.profile?.coverLetterPdfUrl && (
                        <a
                          href={cv.profile.coverLetterPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleNavClick}
                          className="py-2 px-3 bg-surface border border-rule hover:border-ink text-ink text-[11px] font-mono rounded tracking-wide transition-all duration-200 inline-flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Mail size={12} className="text-accent" />
                          LETTER.PDF
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                  <span>CONNECT:</span>
                  <div className="flex items-center gap-3">
                    {cv.profile?.linkedin && (
                      <a
                        href={cv.profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent transition-colors"
                      >
                        LINKEDIN
                      </a>
                    )}
                    {cv.profile?.telegram && (
                      <a
                        href={cv.profile.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent transition-colors"
                      >
                        TELEGRAM
                      </a>
                    )}
                    {cv.profile?.facebook && (
                      <a
                        href={cv.profile.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent transition-colors"
                      >
                        FACEBOOK
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
