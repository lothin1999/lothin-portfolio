"use client";

import { useEffect } from "react";
import { useTheme } from "./useTheme";
import type { ThemeColorSet, ThemeColors } from "@/types/cv";
import type { VisitorPalette } from "@/lib/visitorPalettes";

// Default colors matching globals.css
export const DEFAULT_LIGHT_COLORS: ThemeColorSet = {
  accent: "#1b5def",
  accentOrange: "#e25327",
  bg: "#f4f4f4",
  surface: "#ffffff",
  ink: "#191818",
  ink2: "#3a3939",
  muted: "#787572",
};

export const DEFAULT_DARK_COLORS: ThemeColorSet = {
  accent: "#4a7ff7",
  accentOrange: "#e8734b",
  bg: "#141313",
  surface: "#1e1d1d",
  ink: "#f4f4f4",
  ink2: "#d8d6d3",
  muted: "#8c8985",
};

/**
 * Applies a ThemeColorSet as CSS custom properties on <html>.
 * Also derives rule/border/tag colors from the base palette.
 */
export function applyColorSet(colors: ThemeColorSet, theme: "light" | "dark") {
  const el = document.documentElement;
  el.style.setProperty("--accent", colors.accent);
  el.style.setProperty("--accent-orange", colors.accentOrange);
  el.style.setProperty("--bg", colors.bg);
  el.style.setProperty("--surface", colors.surface);
  el.style.setProperty("--ink", colors.ink);
  el.style.setProperty("--ink2", colors.ink2);
  el.style.setProperty("--muted", colors.muted);

  // Derived rule colors based on theme
  if (theme === "light") {
    el.style.setProperty("--rule", `rgba(25, 24, 24, 0.1)`);
    el.style.setProperty("--rule-solid", "#e2e0dc");
    el.style.setProperty("--tag-bg", `rgba(25, 24, 24, 0.05)`);
    el.style.setProperty("--tag-text", colors.ink);
    el.style.setProperty("--color-border", colors.ink);
    el.style.setProperty("--color-border-subtle", `rgba(25, 24, 24, 0.1)`);
    el.style.setProperty("--color-surface-subtle", `rgba(25, 24, 24, 0.04)`);
  } else {
    el.style.setProperty("--rule", `rgba(244, 244, 244, 0.12)`);
    el.style.setProperty("--rule-solid", "#2d2b2b");
    el.style.setProperty("--tag-bg", `rgba(244, 244, 244, 0.08)`);
    el.style.setProperty("--tag-text", colors.ink);
    el.style.setProperty("--color-border", colors.ink);
    el.style.setProperty("--color-border-subtle", `rgba(244, 244, 244, 0.12)`);
    el.style.setProperty("--color-surface-subtle", `rgba(244, 244, 244, 0.05)`);
  }
}

/**
 * Priority (highest → lowest):
 *   1. Visitor palette (localStorage choice)
 *   2. Admin palette  (R2 / cv.json)
 *   3. Hardcoded defaults (globals.css)
 */
export function useThemeColors(
  adminColors?: ThemeColors | null,
  visitorPalette?: VisitorPalette | null,
) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    const theme = isDark ? "dark" : "light";

    // Start from hardcoded defaults
    let base: ThemeColorSet = isDark ? { ...DEFAULT_DARK_COLORS } : { ...DEFAULT_LIGHT_COLORS };

    // Layer admin colors on top (if admin has saved custom colors)
    if (adminColors) {
      base = { ...base, ...(isDark ? adminColors.dark : adminColors.light) };
    }

    // Layer visitor palette on top (highest priority — visitor's own choice)
    if (visitorPalette && visitorPalette.id !== "default") {
      const vColors = isDark ? visitorPalette.dark : visitorPalette.light;
      base = { ...base, ...vColors };
    }

    applyColorSet(base, theme);
  }, [adminColors, visitorPalette, resolvedTheme]);
}
