"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

type RevealVariant =
  | "fadeUp"       // default fade up
  | "fadeLeft"     // slide from left
  | "fadeRight"    // slide from right
  | "scaleIn"      // scale + fade
  | "stagger"      // stagger children
  | "splitText";   // character split reveal (headings)

interface ScrollRevealOptions {
  variant?: RevealVariant;
  y?: number;
  x?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  childSelector?: string;
  start?: string;
  scrub?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: ScrollRevealOptions
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      variant = "fadeUp",
      y = 40,
      x = 0,
      duration = 0.75,
      stagger = 0.1,
      delay = 0,
      childSelector,
      start = "top 87%",
    } = options ?? {};

    const ctx = gsap.context(() => {
      if (variant === "splitText") {
        // Split heading text into chars and animate each
        try {
          const split = new SplitText(el, { type: "chars,words" });
          gsap.fromTo(
            split.chars,
            { opacity: 0, y: 20, rotateX: -90 },
            {
              opacity: 1, y: 0, rotateX: 0,
              duration: 0.6,
              stagger: 0.02,
              ease: "back.out(1.4)",
              delay,
              scrollTrigger: { trigger: el, start, toggleActions: "play none none none" },
              onComplete: () => split.revert(),
            }
          );
        } catch {
          gsap.fromTo(el,
            { opacity: 0, y },
            {
              opacity: 1, y: 0, duration, delay, ease: "power3.out",
              scrollTrigger: { trigger: el, start, toggleActions: "play none none none" }
            }
          );
        }
        return;
      }

      const targets = childSelector ? Array.from(el.querySelectorAll(childSelector)) : [el];

      const fromVars: gsap.TweenVars = { opacity: 0 };
      const toVars: gsap.TweenVars = {
        opacity: 1,
        duration,
        delay,
        stagger: childSelector ? stagger : 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play none none none",
        },
      };

      switch (variant) {
        case "fadeUp":
          fromVars.y = y; toVars.y = 0;
          break;
        case "fadeLeft":
          fromVars.x = -Math.abs(x || 50); toVars.x = 0;
          break;
        case "fadeRight":
          fromVars.x = Math.abs(x || 50); toVars.x = 0;
          break;
        case "scaleIn":
          fromVars.scale = 0.92; fromVars.y = y * 0.5;
          toVars.scale = 1; toVars.y = 0;
          toVars.ease = "back.out(1.2)";
          break;
        case "stagger":
          fromVars.y = y * 0.6; fromVars.x = -8;
          toVars.y = 0; toVars.x = 0;
          toVars.ease = "power2.out";
          break;
      }

      gsap.fromTo(targets, fromVars, toVars);
    }, el);

    return () => ctx.revert();
  }, []);

  return ref;
}

export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.3
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}
