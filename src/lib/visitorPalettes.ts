// src/lib/visitorPalettes.ts
// Curated color palettes visitors can choose from to override the admin's theme.
// Accent = brand color, bg/surface/ink values tuned per palette per theme.

export interface VisitorPaletteColors {
  accent: string;
  accentOrange: string;
  bg: string;
  surface: string;
  ink: string;
  ink2: string;
  muted: string;
}

export interface VisitorPalette {
  id: string;
  name: string;
  emoji: string;
  light: VisitorPaletteColors;
  dark: VisitorPaletteColors;
}

export const VISITOR_PALETTES: VisitorPalette[] = [
  {
    id: "default",
    name: "Default",
    emoji: "⚡",
    light: {
      accent: "#1b5def",
      accentOrange: "#e25327",
      bg: "#f4f4f4",
      surface: "#ffffff",
      ink: "#191818",
      ink2: "#3a3939",
      muted: "#787572",
    },
    dark: {
      accent: "#4a7ff7",
      accentOrange: "#e8734b",
      bg: "#141313",
      surface: "#1e1d1d",
      ink: "#f4f4f4",
      ink2: "#d8d6d3",
      muted: "#8c8985",
    },
  },
  {
    id: "desert-orange",
    name: "Desert Orange",
    emoji: "🏜️",
    light: {
      accent: "#f08d22",
      accentOrange: "#5a3a1a",
      bg: "#feeee5",
      surface: "#fff8f3",
      ink: "#2a1a0a",
      ink2: "#5c3e28",
      muted: "#9a7660",
    },
    dark: {
      accent: "#f08d22",
      accentOrange: "#ba5c0e",
      bg: "#1a1008",
      surface: "#261808",
      ink: "#f5e8d8",
      ink2: "#c8a882",
      muted: "#8c6a46",
    },
  },
  {
    id: "gummy-pink",
    name: "Gummy Pink",
    emoji: "🍬",
    light: {
      accent: "#c957bd",
      accentOrange: "#7c3d87",
      bg: "#fef0ff",
      surface: "#ffffff",
      ink: "#1e0a20",
      ink2: "#5c3060",
      muted: "#9c70a0",
    },
    dark: {
      accent: "#d87be0",
      accentOrange: "#a04ab0",
      bg: "#120a14",
      surface: "#1e1020",
      ink: "#f5e0f8",
      ink2: "#cca0d0",
      muted: "#8a608e",
    },
  },
  {
    id: "aqua-blue",
    name: "Aqua Blue",
    emoji: "🌊",
    light: {
      accent: "#2183a6",
      accentOrange: "#1d4250",
      bg: "#e5f8ff",
      surface: "#f0fcff",
      ink: "#0a1e26",
      ink2: "#1d4258",
      muted: "#558090",
    },
    dark: {
      accent: "#22d3ee",
      accentOrange: "#0e7490",
      bg: "#040d12",
      surface: "#071520",
      ink: "#e0f8ff",
      ink2: "#94cfe0",
      muted: "#507888",
    },
  },
  {
    id: "moss-green",
    name: "Moss Green",
    emoji: "🌿",
    light: {
      accent: "#4a7c2e",
      accentOrange: "#8f6c20",
      bg: "#f1f8ec",
      surface: "#f8fdf5",
      ink: "#0e1a08",
      ink2: "#3a5428",
      muted: "#6a8858",
    },
    dark: {
      accent: "#6db84e",
      accentOrange: "#c49e30",
      bg: "#080e04",
      surface: "#0e1808",
      ink: "#e4f4d8",
      ink2: "#9cc080",
      muted: "#5a7848",
    },
  },
  {
    id: "mocha-brown",
    name: "Mocha Brown",
    emoji: "☕",
    light: {
      accent: "#7b4a2e",
      accentOrange: "#b87340",
      bg: "#f4edeb",
      surface: "#fdf9f7",
      ink: "#1e0e08",
      ink2: "#5c3820",
      muted: "#9a7460",
    },
    dark: {
      accent: "#c87a4e",
      accentOrange: "#e8a060",
      bg: "#120800",
      surface: "#200e04",
      ink: "#f5e8e0",
      ink2: "#d0a888",
      muted: "#8a6050",
    },
  },
  {
    id: "midnight-purple",
    name: "Midnight Purple",
    emoji: "🌌",
    light: {
      accent: "#6b3fc8",
      accentOrange: "#d4518e",
      bg: "#f3f0ff",
      surface: "#faf8ff",
      ink: "#120a28",
      ink2: "#3e2875",
      muted: "#7860a8",
    },
    dark: {
      accent: "#9d6ef5",
      accentOrange: "#e85faa",
      bg: "#0a060f",
      surface: "#130a20",
      ink: "#f0e8ff",
      ink2: "#c0a0f0",
      muted: "#7058a0",
    },
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    emoji: "🌹",
    light: {
      accent: "#c0687a",
      accentOrange: "#d4964a",
      bg: "#fdf0f2",
      surface: "#fff8f9",
      ink: "#280a10",
      ink2: "#7a3040",
      muted: "#a07080",
    },
    dark: {
      accent: "#e8849a",
      accentOrange: "#f0b050",
      bg: "#140408",
      surface: "#220810",
      ink: "#fce8ec",
      ink2: "#e0a0b0",
      muted: "#906070",
    },
  },
];

export const VISITOR_PALETTE_STORAGE_KEY = "visitor_palette_id";

export function getPaletteById(id: string): VisitorPalette {
  return VISITOR_PALETTES.find((p) => p.id === id) ?? VISITOR_PALETTES[0];
}
