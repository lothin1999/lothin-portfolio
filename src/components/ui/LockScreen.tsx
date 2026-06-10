"use client";

import { useState, useEffect, useRef } from "react";
import { Lock, Unlock, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";
import { useCVData } from "@/hooks/useCVData";

export function LockScreen() {
  const { unlock } = useCVData();
  const [passcode, setPasscode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode.trim() || loading) return;

    setLoading(true);
    setError(false);

    // Give a brief delay for a premium transition feel
    await new Promise((r) => setTimeout(r, 600));

    const success = await unlock(passcode);
    if (!success) {
      setError(true);
      setLoading(false);
      setPasscode("");
      inputRef.current?.focus();
      // Reset error state after shake completes
      setTimeout(() => setError(false), 500);
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-bg/85 backdrop-blur-xl transition-all duration-500">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md p-8 mx-4 border border-rule bg-surface/50 rounded-2xl shadow-2xl backdrop-blur-md">
        
        {/* Decorative Sparkle */}
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full border border-rule bg-surface flex items-center justify-center text-accent shadow">
          <Sparkles size={14} className="animate-pulse" />
        </div>

        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-tag-bg border border-rule text-accent mb-2">
            {loading ? (
              <Unlock size={24} className="animate-bounce text-accent" />
            ) : (
              <Lock size={24} className="text-ink" />
            )}
          </div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">
            Portfolio is Encrypted
          </h1>
          <p className="text-[13px] text-muted max-w-xs mx-auto leading-relaxed">
            This portfolio is passcode-protected. Enter the correct passcode to decrypt and view the page.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`relative rounded-lg border transition-all duration-300 ${
            error
              ? "border-red-500 bg-red-500/5 animate-[shake_0.4s_ease-in-out]"
              : "border-rule bg-bg focus-within:border-accent focus-within:ring-1 focus-within:ring-accent"
          }`}>
            <input
              ref={inputRef}
              type={showPass ? "text" : "password"}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode..."
              disabled={loading}
              className="w-full pl-3.5 pr-10 py-3 text-[14px] bg-transparent text-ink placeholder:text-muted/40 outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 hover:text-ink transition-colors disabled:opacity-50"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-red-500 font-mono text-[11px] px-1 animate-fade-in">
              <AlertCircle size={12} />
              <span>Incorrect passcode. Please try again.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!passcode.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-ink text-white font-medium rounded-lg text-[13px] hover:bg-accent hover:text-white disabled:bg-muted/20 disabled:text-muted disabled:border-transparent transition-all duration-300 shadow-sm shrink-0 border border-transparent"
          >
            {loading ? "Decrypting..." : "Decrypt Portfolio"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="font-mono text-[9px] text-muted tracking-widest uppercase">
            Zero-Knowledge AES-GCM Client Side Decryption
          </p>
        </div>
      </div>
    </div>
  );
}
