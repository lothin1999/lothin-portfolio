"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "./SettingsContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { smoothScroll } = useSettings();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // Smoothly reset scroll to top on page / route transition
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    if (typeof window !== "undefined") {
      ScrollTrigger.refresh();
    }
  }, [pathname]);

  useEffect(() => {
    if (!smoothScroll) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        if (typeof window !== "undefined") {
          (window as any).lenis = undefined;
        }
      }
      return;
    }

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    if (typeof window !== "undefined") {
      (window as any).lenis = lenis;
    }

    // Connect Lenis to ScrollTrigger update events
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Synchronize GSAP ticker frame updates with Lenis requestAnimationFrame
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    
    // Disable lag smoothing to align ScrollTrigger calculations with Lenis
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateTicker);
      lenisRef.current = null;
      if (typeof window !== "undefined") {
        (window as any).lenis = undefined;
      }
    };
  }, [smoothScroll]);

  return <>{children}</>;
}
