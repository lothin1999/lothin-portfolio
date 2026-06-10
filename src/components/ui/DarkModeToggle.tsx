"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme, useRipple } from "@/hooks/useTheme";
import { useCallback, useEffect, useRef, useState } from "react";

const CENTER = 12;
const SUN_R = 4.5;
const MOON_R = 5.5;
const SUN_RAYS = 8;
const RAY_INNER = 7.5;
const RAY_OUTER = 10.5;
const MOON_MASK_DARK = { cx: 15.5, cy: 8, r: 5.5 };
const MOON_MASK_LIGHT = { cx: CENTER + 12, cy: CENTER - 8, r: 0 };
const bodySpring = { type: "spring", stiffness: 280, damping: 22 } as const;
const raySpring = { type: "spring", stiffness: 200, damping: 18 } as const;
const starSpring = { type: "spring", stiffness: 260, damping: 20 } as const;
const rays = Array.from({ length: SUN_RAYS }, (_, i) => {
  const angle = ((i * 360) / SUN_RAYS) * (Math.PI / 180);
  return {
    x1: CENTER + Math.cos(angle) * RAY_INNER,
    y1: CENTER + Math.sin(angle) * RAY_INNER,
    x2: CENTER + Math.cos(angle) * RAY_OUTER,
    y2: CENTER + Math.sin(angle) * RAY_OUTER,
  };
});
const STARS = [
  { cx: 19.5, cy: 4.5, r: 0.75, delay: 0.10 },
  { cx: 21, cy: 11.5, r: 0.65, delay: 0.20 },
  { cx: 17.5, cy: 18.5, r: 0.7, delay: 0.32 },
];
export function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { registerToggle, triggerRipple } = useRipple();
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    registerToggle(btnRef.current);
    return () => registerToggle(null);
  }, [registerToggle]);

  const isDark = resolvedTheme === "dark";

  const toggle = useCallback(() => {
    const toDark = !isDark;
    triggerRipple(toDark, () => {
      setTheme(toDark ? "dark" : "light");
    });
  }, [isDark, setTheme, triggerRipple]);
  if (!mounted) {
    return (
      <div
        className="w-9 h-9 rounded-full border border-rule bg-tag-bg animate-pulse"
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.button
      ref={btnRef}
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={[
        "relative w-9 h-9 rounded-full",
        "flex items-center justify-center",
        "border border-rule",
        "text-muted hover:text-ink hover:border-ink hover:bg-tag-bg",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        "overflow-visible",
      ].join(" ")}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={bodySpring}
    >
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: "visible" }}
        animate={{ rotate: isDark ? 36 : 0 }}
        transition={bodySpring}
        aria-hidden="true"
      >
        <defs>
          <mask id="dm-moon-mask">
            <rect x="0" y="0" width="24" height="24" fill="white" />
            <motion.circle
              cx={isDark ? MOON_MASK_DARK.cx : MOON_MASK_LIGHT.cx}
              cy={isDark ? MOON_MASK_DARK.cy : MOON_MASK_LIGHT.cy}
              r={isDark ? MOON_MASK_DARK.r : MOON_MASK_LIGHT.r}
              animate={
                isDark
                  ? { ...MOON_MASK_DARK, fillOpacity: 1 }
                  : { ...MOON_MASK_LIGHT, fillOpacity: 1 }
              }
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              fill="black"
            />
          </mask>
        </defs>

        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={isDark ? MOON_R : SUN_R}
          fill="currentColor"
          stroke="none"
          mask="url(#dm-moon-mask)"
          animate={{ r: isDark ? MOON_R : SUN_R }}
          transition={bodySpring}
        />

        <motion.g
          animate={{
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0 : 1,
          }}
          transition={raySpring}
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        >
          {rays.map((ray, i) => (
            <motion.line
              key={i}
              x1={ray.x1} y1={ray.y1}
              x2={ray.x2} y2={ray.y2}
              strokeWidth="2"
              strokeLinecap="round"
              initial={false}
              animate={{ opacity: isDark ? 0 : 1 }}
              transition={{
                ...raySpring,
                delay: isDark ? 0 : i * 0.03,
              }}
            />
          ))}
        </motion.g>

        <AnimatePresence>
          {isDark &&
            STARS.map((star, i) => (
              <motion.circle
                key={`star-${i}`}
                cx={star.cx}
                cy={star.cy}
                r={star.r}
                fill="currentColor"
                stroke="none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.55, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ ...starSpring, delay: star.delay }}
              />
            ))}
        </AnimatePresence>
      </motion.svg>
    </motion.button>
  );
}