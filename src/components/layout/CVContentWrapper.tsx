"use client";

import { useCVData } from "@/hooks/useCVData";
import { LockScreen } from "../ui/LockScreen";
import { useEffect, useState } from "react";

function LoadingScreen() {
  const [dot, setDot] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setDot((d) => (d + 1) % 4), 500);
    return () => clearInterval(id);
  }, []);

  const dots = ".".repeat(dot);

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <div className="relative mb-10 flex items-center justify-center">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          className="absolute"
          aria-hidden="true"
        >
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="var(--rule)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeDasharray="30 170"
            strokeLinecap="round"
            style={{
              transformOrigin: "36px 36px",
              animation: "tl-spin 2s linear infinite",
            }}
          />
        </svg>
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          fill="none"
          className="absolute"
          aria-hidden="true"
        >
          <circle
            cx="26"
            cy="26"
            r="22"
            stroke="var(--accent-pink)"
            strokeWidth="1"
            strokeDasharray="15 120"
            strokeLinecap="round"
            style={{
              transformOrigin: "26px 26px",
              animation: "tl-spin-rev 3s linear infinite",
            }}
          />
        </svg>

        {/* Monogram */}
        <div
          className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: "var(--tag-bg)" }}
        >
          <span
            className="font-serif italic text-[17px] leading-none"
            style={{ color: "var(--accent)" }}
          >
            T
          </span>
        </div>
      </div>
      <p
        className="font-serif text-[22px] tracking-tight mb-1"
        style={{ color: "var(--ink)" }}
      >
        <span style={{ color: "var(--accent)" }} className="italic">
          Thoeun
        </span>{" "}
        Lothin
      </p>
      <p
        className="font-mono text-[11px] tracking-[0.18em] uppercase mb-8"
        style={{ color: "var(--muted)" }}
      >
        Full-Stack Web Developer
      </p>
      <div
        className="w-[160px] h-[1.5px] rounded-full overflow-hidden"
        style={{ background: "var(--rule)" }}
      >
        <div
          style={{
            height: "100%",
            background:
              "linear-gradient(90deg, var(--accent), var(--accent-pink))",
            borderRadius: "9999px",
            animation: "tl-progress 1.6s ease-in-out infinite",
          }}
        />
      </div>
      <p
        className="font-mono text-[11px] tracking-widest mt-4 w-10 text-center"
        style={{ color: "var(--muted)" }}
        aria-live="polite"
        aria-label="Loading"
      >
        {dots || "\u00a0"}
      </p>

      <style>{`
        @keyframes tl-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes tl-spin-rev {
          to { transform: rotate(-360deg); }
        }
        @keyframes tl-progress {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

export function CVContentWrapper({ children }: { children: React.ReactNode }) {
  const { isLocked, isLoading } = useCVData();

  if (isLoading) return <LoadingScreen />;
  if (isLocked) return <LockScreen />;
  return <>{children}</>;
}