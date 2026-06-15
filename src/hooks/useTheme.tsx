"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

interface RippleContextValue {
  registerToggle: (el: HTMLElement | null) => void;
  triggerRipple: (toDark: boolean, onMidpoint: () => void) => void;
}

const RippleContext = createContext<RippleContextValue | null>(null);

export function useRipple() {
  const ctx = useContext(RippleContext);
  if (!ctx) throw new Error("useRipple must be used inside ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const toggleRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(false);

  const registerToggle = useCallback((el: HTMLElement | null) => {
    toggleRef.current = el;
  }, []);

  const triggerRipple = useCallback(
    (toDark: boolean, onMidpoint: () => void) => {
      const doc = document as any;
      if (
        typeof window === "undefined" ||
        typeof document === "undefined" ||
        !doc.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        onMidpoint();
        return;
      }

      if (busyRef.current) return;
      busyRef.current = true;

      const W = window.innerWidth;
      const H = window.innerHeight;
      let ox = W * 0.9;
      let oy = 28;
      if (toggleRef.current) {
        const r = toggleRef.current.getBoundingClientRect();
        ox = r.left + r.width / 2;
        oy = r.top + r.height / 2;
      }
      const maxR = Math.max(
        Math.hypot(ox, oy),
        Math.hypot(W - ox, oy),
        Math.hypot(ox, H - oy),
        Math.hypot(W - ox, H - oy),
      );

      document.documentElement.classList.add("theme-transitioning");

      const transition = doc.startViewTransition(() => {
        flushSync(() => {
          onMidpoint();
        });
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${ox}px ${oy}px)`,
              `circle(${maxR}px at ${ox}px ${oy}px)`,
            ],
          },
          {
            duration: 500,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove("theme-transitioning");
        busyRef.current = false;
      });
    },
    [],
  );

  return (
    <RippleContext.Provider value={{ registerToggle, triggerRipple }}>
      <NextThemesProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        storageKey="theme"
      >
        {children}
      </NextThemesProvider>
    </RippleContext.Provider>
  );
}

export { useNextTheme as useTheme };