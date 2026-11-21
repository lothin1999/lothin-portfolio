"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Lock,
  KeyRound,
  Cpu,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { useCVData } from "@/hooks/useCVData";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AdminLoginModalProps {
  onClose: (success?: boolean) => void;
}

export function AdminLoginModal({ onClose }: AdminLoginModalProps) {
  const { setAdmin } = useCVData();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        setAdmin(true);
        onClose(true);
      } else {
        const j = (await res.json()) as { error?: string };
        setError(j.error ?? "Access denied. Unauthorized Google email address.");
        await signOut(auth);
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* ── Ambient Backdrop with Depth Glow ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={() => onClose(false)}
        className="fixed inset-0 bg-ink/50 backdrop-blur-md cursor-pointer"
        aria-hidden="true"
      />

      {/* Cybernetic ambient glow positioned behind modal */}
      <div className="fixed w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* ── Modal Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative w-full max-w-[460px] bg-surface/95 dark:bg-surface/90 backdrop-blur-2xl border border-rule/80 dark:border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Subtle decorative top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-accent via-accent-orange to-accent animate-gradient" />

        {/* Modal Header Bar */}
        <div className="px-6 pt-5 pb-4 border-b border-rule/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-[1.8px] text-muted font-medium">
              Secure Enclave · Auth Gateway
            </span>
          </div>

          <button
            onClick={() => onClose(false)}
            className="p-1 rounded-md text-muted hover:text-ink hover:bg-tag-bg/80 transition-colors cursor-pointer"
            title="Close (ESC)"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Holographic Security Emblem */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 flex items-center justify-center">
              {/* Outer decorative dashed orbit ring */}
              <div className="absolute w-20 h-20 rounded-full border border-dashed border-accent/30 animate-[spin_12s_linear_infinite]" />
              {/* Middle pulsing glow */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent/20 to-accent/5 border border-accent/30 flex items-center justify-center shadow-[0_0_25px_rgba(27,93,239,0.25)]">
                <Fingerprint size={28} className="text-accent stroke-[1.75]" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-surface border border-rule rounded-full p-1 shadow-xs">
                <Lock size={11} className="text-accent-orange" />
              </div>
            </div>

            <h2
              id="auth-modal-title"
              className="font-display italic text-2xl sm:text-3xl font-normal text-ink tracking-tight"
            >
              Admin Access Portal
            </h2>
            <p className="font-sans text-xs text-muted max-w-sm mt-1.5 leading-relaxed">
              Verify administrative credentials via Google Identity Services to unlock telemetry, Cloudflare control, and portfolio data.
            </p>
          </div>

          {/* Security Features Badges */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="border border-rule/80 bg-bg/60 rounded-lg p-2.5 text-center flex flex-col items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-accent" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-ink font-semibold">
                OAuth 2.0
              </span>
              <span className="font-mono text-[8px] text-muted">Google IAM</span>
            </div>
            <div className="border border-rule/80 bg-bg/60 rounded-lg p-2.5 text-center flex flex-col items-center justify-center gap-1">
              <KeyRound size={14} className="text-accent-orange" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-ink font-semibold">
                HS256 JWT
              </span>
              <span className="font-mono text-[8px] text-muted">Edge Cookie</span>
            </div>
            <div className="border border-rule/80 bg-bg/60 rounded-lg p-2.5 text-center flex flex-col items-center justify-center gap-1">
              <Cpu size={14} className="text-emerald-500" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-ink font-semibold">
                Zero Trust
              </span>
              <span className="font-mono text-[8px] text-muted">Role Guard</span>
            </div>
          </div>

          {/* Action Button & Feedback */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-ink text-surface dark:bg-surface dark:text-ink font-sans text-sm font-semibold tracking-wide border border-transparent hover:border-accent hover:shadow-[0_8px_24px_rgba(27,93,239,0.25)] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {/* Subtle shimmer hover wave */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Official Google 4-Color Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>

              <span>{loading ? "Verifying with Google..." : "Continue with Google"}</span>

              {!loading && (
                <ArrowRight
                  size={14}
                  className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all"
                />
              )}
            </button>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono"
                >
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <div className="leading-snug">{error}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal Footer / Identity Notice */}
        <div className="px-6 py-3.5 bg-bg/50 border-t border-rule/60 flex items-center justify-between text-muted font-mono text-[9.5px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            Whitelisted: <strong className="text-ink font-semibold">lothininfo@gmail.com</strong>
          </span>
          <span className="hidden sm:inline text-muted/70">ESC to cancel</span>
        </div>
      </motion.div>
    </div>
  );
}
