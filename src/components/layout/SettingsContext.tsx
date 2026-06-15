"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextType {
  customCursor: boolean;
  setCustomCursor: (val: boolean) => void;
  scrambleText: boolean;
  setScrambleText: (val: boolean) => void;
  smoothScroll: boolean;
  setSmoothScroll: (val: boolean) => void;
  helpOpen: boolean;
  setHelpOpen: (val: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (val: boolean) => void;
  aiOpen: boolean;
  setAiOpen: (val: boolean) => void;
  activePathSegment: string;
  setActivePathSegment: (val: string) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [customCursor, setCustomCursor] = useState(true);
  const [scrambleText, setScrambleText] = useState(true);
  const [smoothScroll, setSmoothScroll] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [activePathSegment, setActivePathSegment] = useState("home");

  // Load from localStorage
  useEffect(() => {
    try {
      const storedCursor = localStorage.getItem("setting_custom_cursor");
      if (storedCursor !== null) setCustomCursor(storedCursor === "true");

      const storedScramble = localStorage.getItem("setting_scramble_text");
      if (storedScramble !== null) setScrambleText(storedScramble === "true");

      const storedSmooth = localStorage.getItem("setting_smooth_scroll");
      if (storedSmooth !== null) setSmoothScroll(storedSmooth === "true");
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  // Sync custom cursor class on html tag
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    if (customCursor) {
      html.classList.add("has-custom-cursor");
    } else {
      html.classList.remove("has-custom-cursor");
    }
  }, [customCursor]);

  const updateCustomCursor = (val: boolean) => {
    setCustomCursor(val);
    localStorage.setItem("setting_custom_cursor", String(val));
  };

  const updateScrambleText = (val: boolean) => {
    setScrambleText(val);
    localStorage.setItem("setting_scramble_text", String(val));
  };

  const updateSmoothScroll = (val: boolean) => {
    setSmoothScroll(val);
    localStorage.setItem("setting_smooth_scroll", String(val));
  };

  return (
    <SettingsContext.Provider
      value={{
        customCursor,
        setCustomCursor: updateCustomCursor,
        scrambleText,
        setScrambleText: updateScrambleText,
        smoothScroll,
        setSmoothScroll: updateSmoothScroll,
        helpOpen,
        setHelpOpen,
        settingsOpen,
        setSettingsOpen,
        aiOpen,
        setAiOpen,
        activePathSegment,
        setActivePathSegment,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
