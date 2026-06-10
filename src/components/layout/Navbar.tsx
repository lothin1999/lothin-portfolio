"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";

const navLinks = [
  { href: "/", label: "Home", sectionId: "home" },
  { href: "/#experience", label: "Experience", sectionId: "experience" },
  { href: "/#skills", label: "Skills", sectionId: "skills" },
  { href: "/#education", label: "Education", sectionId: "education" },
  { href: "/#about", label: "About", sectionId: "about" },
];

const SECTION_IDS = ["home", "experience", "skills", "education", "about"];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

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

  // IntersectionObserver to highlight active section while on homepage
  useEffect(() => {
    if (pathname !== "/") return;

    const observers: IntersectionObserver[] = [];
    const sectionMap = new Map<string, number>(); // sectionId -> intersectionRatio

    const updateActive = () => {
      // Pick the section with highest ratio that's in view
      let best = "home";
      let bestRatio = -1;
      sectionMap.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = id;
        }
      });
      setActiveSection(best);
    };

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            sectionMap.set(id, entry.intersectionRatio);
          });
          updateActive();
        },
        { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0], rootMargin: "-58px 0px 0px 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [pathname]);

  // Smooth scroll to section on anchor click
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      if (pathname === "/") {
        e.preventDefault();
        const el = document.getElementById(sectionId);
        if (el) {
          const navHeight = 58;
          const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: "smooth" });
          setActiveSection(sectionId);
        }
      }
      // If not on homepage, let Next.js navigate normally (the hash will scroll after load)
      setMobileOpen(false);
    },
    [pathname]
  );

  const isActive = (link: (typeof navLinks)[0]) => {
    if (pathname === "/") {
      return activeSection === link.sectionId;
    }
    // On other pages, match by pathname prefix
    return pathname.startsWith(`/${link.sectionId}`) || (link.href === "/" && pathname === "/");
  };

  return (
    <>
      <ScrollProgressBar />
      <nav className={cn(
        "sticky top-0 z-50 h-[58px] bg-bg border-b border-rule transition-shadow duration-200",
        scrolled && "shadow-sm"
      )} aria-label="Main navigation">
        <div className="max-w-content mx-auto px-6 h-full flex items-center justify-between gap-6">
          <Link href="/" className="font-serif text-[17px] text-ink hover:text-accent transition-colors shrink-0">
            <span className="italic text-accent">Thoeun</span> Lothin
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <ul className="flex items-center gap-6 list-none" role="list">
              {navLinks.map((link) => (
                <li key={link.sectionId}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.sectionId)}
                    className={cn("nav-link font-sans", isActive(link) && "active")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <DarkModeToggle />
          </div>

          <div className="md:hidden flex items-center gap-2">
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
            <span className="font-serif text-[17px] text-ink">
              <span className="italic text-accent">Thoeun</span> Lothin
            </span>
            <button className="p-1.5 text-ink hover:text-accent transition-colors"
              aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <X size={22} />
            </button>
          </div>
          <ul className="list-none flex flex-col gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.sectionId}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.sectionId)}
                  className={cn(
                    "block py-3 text-[16px] text-ink hover:text-accent transition-colors border-b border-rule font-sans font-light",
                    isActive(link) && "text-accent"
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
