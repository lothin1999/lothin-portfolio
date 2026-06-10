"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import type { CVData } from "@/types/cv";
import { defaultCV } from "@/lib/data";
import { decryptData, encryptData } from "@/lib/encryption";

interface CVContextValue {
  cv: CVData;
  isAdmin: boolean;
  isLoading: boolean;
  isLocked: boolean;
  setAdmin: (v: boolean) => void;
  updateCV: (data: CVData, passcode?: string) => Promise<void>;
  refreshCV: () => Promise<void>;
  unlock: (passcode: string) => Promise<boolean>;
}

const CVContext = createContext<CVContextValue | null>(null);

export function CVProvider({ children }: { children: React.ReactNode }) {
  const [cv, setCV] = useState<CVData>(defaultCV);
  const [isAdmin, setAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [ciphertext, setCiphertext] = useState<string | null>(null);

  const decryptAndLoad = useCallback(async (cipher: string, code: string) => {
    try {
      const decrypted = await decryptData(cipher, code);
      if (decrypted && decrypted.profile) {
        setCV(decrypted);
        setIsLocked(false);
        sessionStorage.setItem("lothin_visitor_passcode", code);
        return true;
      }
    } catch (e) {
      console.error("Failed to decrypt CV data:", e);
    }
    return false;
  }, []);

  const refreshCV = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cv");
      if (res.ok) {
        const data = await res.json();
        if (data && data.encrypted && data.ciphertext) {
          setCiphertext(data.ciphertext);
          setIsLocked(true);

          // Check if there is already a saved passcode in sessionStorage
          const savedCode = sessionStorage.getItem("lothin_visitor_passcode");
          if (savedCode) {
            const success = await decryptAndLoad(data.ciphertext, savedCode);
            if (success) {
              setIsLoading(false);
              return;
            }
          }
        } else if (data && data.profile) {
          // Plain data fallback
          setCV(data);
          setIsLocked(false);
        }
      }
    } catch (err) {
      console.error("Error loading CV data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [decryptAndLoad]);

  useEffect(() => {
    refreshCV();
  }, [refreshCV]);

  const unlock = useCallback(async (passcode: string) => {
    if (!ciphertext) return false;
    return decryptAndLoad(ciphertext, passcode);
  }, [ciphertext, decryptAndLoad]);

  const updateCV = useCallback(async (data: CVData, passcode?: string) => {
    let payload: any = data;
    if (passcode) {
      const encryptedStr = await encryptData(data, passcode);
      payload = {
        encrypted: true,
        ciphertext: encryptedStr
      };
      setCV(data);
      setCiphertext(encryptedStr);
      setIsLocked(false);
      sessionStorage.setItem("lothin_visitor_passcode", passcode);
    } else {
      setCV(data);
      setCiphertext(null);
      setIsLocked(false);
      sessionStorage.removeItem("lothin_visitor_passcode");
    }

    const res = await fetch("/api/cv", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Save failed");
  }, []);

  return (
    <CVContext.Provider value={{ cv, isAdmin, isLoading, isLocked, setAdmin, updateCV, refreshCV, unlock }}>
      {children}
    </CVContext.Provider>
  );
}

export function useCVData() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error("useCVData must be used inside CVProvider");
  return ctx;
}

