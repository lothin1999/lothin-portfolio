"use client";

import { useState } from "react";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { useCVData } from "@/hooks/useCVData";

export function AdminLoginModal({ onClose }: { onClose: () => void }) {
  const { setAdmin } = useCVData();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isDev = process.env.NODE_ENV !== "production";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAdmin(true);
        onClose();
      } else {
        const j = await res.json() as { error?: string };
        setError(j.error ?? "Invalid password");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-rule rounded-lg shadow-2xl w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink transition-colors">
          <X size={18} />
        </button>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-full bg-tag-bg flex items-center justify-center">
            <Lock size={14} className="text-accent" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink">Admin Access</p>
            <p className="font-mono text-[10px] text-muted tracking-wide">Enter password to edit</p>
          </div>
        </div>

        {isDev && (
          <div className="font-mono text-[10px] text-muted bg-tag-bg rounded px-2.5 py-2 mb-4 leading-[1.7] space-y-1">
            <p>Dev mode — default password: <span className="text-accent font-medium">admin123</span></p>
            <p>For production, generate a hash:</p>
            <code className="block text-[9.5px] text-ink bg-rule/40 rounded px-1.5 py-1 mt-1 break-all">
              node -e &quot;const c=require(&apos;crypto&apos;),s=c.randomBytes(16).toString(&apos;hex&apos;),h=c.createHmac(&apos;sha256&apos;,s).update(&apos;YourPass&apos;).digest(&apos;hex&apos;);console.log(s+&apos;:&apos;+h)&quot;
            </code>
            <p className="mt-1">Paste output into <span className="text-ink">ADMIN_PASSWORD_HASH</span></p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full px-3 py-2.5 pr-10 border border-rule rounded text-[14px] text-ink bg-bg placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors"
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p className="font-mono text-[11px] text-red-500 tracking-wide">{error}</p>}
          <button type="submit" disabled={loading || !password}
            className="w-full py-2.5 bg-ink text-white text-[13px] font-medium rounded hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Verifying…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
