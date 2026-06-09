"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import type { CVData } from "@/types/cv";
import { defaultCV } from "@/lib/data";

interface CVContextValue {
  cv: CVData;
  isAdmin: boolean;
  isLoading: boolean;
  setAdmin: (v: boolean) => void;
  updateCV: (data: CVData) => Promise<void>;
  refreshCV: () => Promise<void>;
}

const CVContext = createContext<CVContextValue | null>(null);

export function CVProvider({ children }: { children: React.ReactNode }) {
  const [cv, setCV] = useState<CVData>(defaultCV);
  const [isAdmin, setAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCV = useCallback(async () => {
    try {
      const res = await fetch("/api/cv");
      if (res.ok) {
        const data = (await res.json()) as CVData;
        setCV(data);
      }
    } catch {
      // use default
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCV();
  }, [refreshCV]);

  const updateCV = useCallback(async (data: CVData) => {
    const res = await fetch("/api/cv", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Save failed");
    setCV(data);
  }, []);

  return (
    <CVContext.Provider value={{ cv, isAdmin, isLoading, setAdmin, updateCV, refreshCV }}>
      {children}
    </CVContext.Provider>
  );
}

export function useCVData() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error("useCVData must be used inside CVProvider");
  return ctx;
}
