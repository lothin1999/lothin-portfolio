"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/experience", label: "Experience" },
  { href: "/skills", label: "Skills" },
  { href: "/education", label: "Education" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
                <li key={link.href}>
                  <Link href={link.href}
                    className={cn("nav-link font-sans", pathname === link.href && "active")}>
                    {link.label}
                  </Link>
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
              <li key={link.href}>
                <Link href={link.href}
                  className="block py-3 text-[16px] text-ink hover:text-accent transition-colors border-b border-rule font-sans font-light"
                  onClick={() => setMobileOpen(false)}>
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
