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
  useEffect,
  type ReactNode,
} from "react";

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const busyRef = useRef(false);

  // Clean up canvas from body on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, []);

  const registerToggle = useCallback((el: HTMLElement | null) => {
    toggleRef.current = el;
  }, []);

  const triggerRipple = useCallback(
    (toDark: boolean, onMidpoint: () => void) => {
      if (busyRef.current) return;
      busyRef.current = true;
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.style.cssText = [
          "position:fixed",
          "inset:0",
          "pointer-events:none",
          "z-index:9999",
          "width:100vw",
          "height:100vh",
        ].join(";");
        document.body.appendChild(canvas);
        canvasRef.current = canvas;
      }

      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      canvas.style.display = "block";

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        busyRef.current = false;
        canvas.style.display = "none";
        onMidpoint();
        return;
      }

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

      const fillColor = toDark ? "hsl(20 14% 7%)" : "hsl(0 0% 100%)";
      const DURATION = 640;
      const MIDPOINT = 0.42;

      let midpointFired = false;
      const start = performance.now();

      function easeInOut(t: number) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      }

      function tick(now: number) {
        try {
          const raw = Math.min((now - start) / DURATION, 1);
          const t = easeInOut(raw);
          const r = t * maxR;

          ctx!.clearRect(0, 0, W, H);
          ctx!.beginPath();
          ctx!.arc(ox, oy, r, 0, Math.PI * 2);
          ctx!.fillStyle = fillColor;
          ctx!.fill();

          if (raw >= MIDPOINT && !midpointFired) {
            midpointFired = true;
            try {
              onMidpoint();
            } catch (err) {
              console.error("Theme transition midpoint error:", err);
            }
          }

          if (raw < 1) {
            requestAnimationFrame(tick);
          } else {
            canvas!.style.display = "none";
            ctx!.clearRect(0, 0, W, H);
            busyRef.current = false;
          }
        } catch (err) {
          console.error("Theme transition tick error:", err);
          if (canvas) {
            canvas.style.display = "none";
          }
          busyRef.current = false;
        }
      }

      requestAnimationFrame(tick);
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