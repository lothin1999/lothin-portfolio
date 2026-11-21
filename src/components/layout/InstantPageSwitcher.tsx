"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCVData } from "@/hooks/useCVData";
import { HomeView } from "@/components/views/HomeView";
import { AboutView } from "@/components/views/AboutView";
import { PortfolioView } from "@/components/views/PortfolioView";
import { ServicesView } from "@/components/views/ServicesView";
import { ArticlesView } from "@/components/views/ArticlesView";
import { DocumentsView } from "@/components/views/DocumentsView";
import { ContactView } from "@/components/views/ContactView";

export interface InstantNavContextType {
  activePath: string;
  navigate: (href: string) => void;
  isInstantRoute: (href: string) => boolean;
}

export const SPA_ROUTES = [
  "/",
  "/about",
  "/portfolio",
  "/services",
  "/articles",
  "/documents",
  "/contact",
];

export const InstantNavContext = createContext<InstantNavContextType>({
  activePath: "/",
  navigate: () => {},
  isInstantRoute: () => false,
});

export const useInstantNav = () => useContext(InstantNavContext);

export function InstantNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activePath, setActivePath] = useState(pathname || "/");

  // Keep in sync with pathname changes from Next.js router
  useEffect(() => {
    if (pathname) {
      setActivePath(pathname);
    }
  }, [pathname]);

  // Handle browser Back / Forward buttons without full page reloads
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (SPA_ROUTES.includes(currentPath)) {
        setActivePath(currentPath);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const isInstantRoute = useCallback((href: string) => {
    return SPA_ROUTES.includes(href);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (SPA_ROUTES.includes(href)) {
        if (href !== activePath) {
          setActivePath(href);
          window.history.pushState(null, "", href);
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      } else {
        router.push(href);
      }
    },
    [activePath, router]
  );

  return (
    <InstantNavContext.Provider value={{ activePath, navigate, isInstantRoute }}>
      {children}
    </InstantNavContext.Provider>
  );
}

export function InstantPageView({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { activePath } = useInstantNav();
  const { cv } = useCVData();

  // If currently on an admin or dynamic subpage route (/dashboard, /edit, /articles/[slug]), render server children directly
  const isSpaPage = SPA_ROUTES.includes(activePath) && SPA_ROUTES.includes(pathname);

  if (!isSpaPage) {
    return <>{children}</>;
  }

  const renderView = () => {
    switch (activePath) {
      case "/about":
        return <AboutView cv={cv} />;
      case "/portfolio":
        return <PortfolioView cv={cv} />;
      case "/services":
        return <ServicesView cv={cv} />;
      case "/articles":
        return <ArticlesView cv={cv} />;
      case "/documents":
        return <DocumentsView />;
      case "/contact":
        return <ContactView />;
      case "/":
      default:
        return <HomeView />;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activePath}
        initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
        transition={{
          duration: 0.16,
          ease: [0.16, 1, 0.3, 1], // Cloudflare / Apple snappy deceleration curve
        }}
        style={{ willChange: "transform, opacity, filter" }}
        className="w-full"
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}
