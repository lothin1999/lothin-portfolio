"use client";

import { useCVData } from "@/hooks/useCVData";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSettings } from "@/components/layout/SettingsContext";
import { LockScreen } from "../ui/LockScreen";
import { useEffect, useState } from "react";


function LoadingScreen() {
  const [dot, setDot] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const id = setInterval(() => setDot((d) => (d + 1) % 4), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStuck(true);
    }, 6000); // 6 seconds threshold before showing stuck screen
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isStuck) return;
    if (countdown <= 0) {
      window.location.reload();
      return;
    }
    const interval = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isStuck, countdown]);

  const dots = ".".repeat(dot);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg, #f4f4f4)",
        fontFamily: "var(--font-body), system-ui, sans-serif",
        padding: "24px",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      {!isStuck ? (
        <>
          <div style={{ position: "relative", marginBottom: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              style={{ position: "absolute" }}
              aria-hidden="true"
            >
              <circle
                cx="36"
                cy="36"
                r="32"
                stroke="var(--rule, rgba(25, 24, 24, 0.1))"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              <circle
                cx="36"
                cy="36"
                r="32"
                stroke="var(--accent, #1b5def)"
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
              style={{ position: "absolute" }}
              aria-hidden="true"
            >
              <circle
                cx="26"
                cy="26"
                r="22"
                stroke="var(--accent-orange, #e25327)"
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
              style={{ 
                position: "relative",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--tag-bg, rgba(25, 24, 24, 0.05))" 
              }}
            >
              <span
                style={{ color: "var(--accent, #1b5def)", fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", fontSize: "17px", lineHeight: "1" }}
              >
                T
              </span>
            </div>
          </div>
          <p
            style={{ color: "var(--ink, #191818)", fontFamily: "var(--font-display), Georgia, serif", fontSize: "22px", margin: "0 0 4px 0" }}
          >
            <span style={{ color: "var(--accent, #1b5def)", fontStyle: "italic" }}>
              Thoeun
            </span>{" "}
            Lothin
          </p>
          <p
            style={{ color: "var(--muted, #787572)", fontFamily: "var(--font-mono), monospace", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 32px 0" }}
          >
            Full-Stack Web Developer
          </p>
          <div
            style={{ background: "var(--rule, rgba(25, 24, 24, 0.1))", width: "160px", height: "1.5px", borderRadius: "999px", overflow: "hidden" }}
          >
            <div
              style={{
                height: "100%",
                background:
                  "linear-gradient(90deg, var(--accent, #1b5def), var(--accent-orange, #e25327))",
                borderRadius: "9999px",
                animation: "tl-progress 1.6s ease-in-out infinite",
              }}
            />
          </div>
          <p
            style={{ color: "var(--muted, #787572)", fontFamily: "var(--font-mono), monospace", fontSize: "11px", marginTop: "16px", width: "40px" }}
            aria-live="polite"
            aria-label="Loading"
          >
            {dots || "\u00a0"}
          </p>
        </>
      ) : (
        /* Breathtaking, highly styled Stuck UI using standard CSS variables */
        <div 
          className="animate-fade-in"
          style={{
            maxWidth: "440px",
            width: "100%",
            padding: "40px 32px",
            borderRadius: "16px",
            border: "1px solid var(--rule, rgba(25, 24, 24, 0.1))",
            backgroundColor: "var(--surface, #ffffff)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box"
          }}
        >
          <div 
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              backgroundColor: "rgba(226, 83, 39, 0.08)",
              border: "1px solid rgba(226, 83, 39, 0.15)",
              color: "var(--accent-orange, #e25327)",
              animation: "pulse 2s infinite"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "32px", height: "32px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <h2 
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: "25px",
              fontStyle: "italic",
              fontWeight: "normal",
              lineHeight: 1.2,
              color: "var(--ink, #191818)",
              margin: "0 0 12px 0"
            }}
          >
            Connection taking longer than expected
          </h2>
          
          <p 
            style={{
              fontFamily: "var(--font-body), sans-serif",
              fontSize: "13.5px",
              color: "var(--muted, #787572)",
              lineHeight: 1.6,
              margin: "0 0 28px 0"
            }}
          >
            We are having trouble establishing a connection to the data store. This could be due to a slow network connection or server-side latency.
          </p>

          {/* Countdown progress section */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
            <div 
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--muted, #787572)"
              }}
            >
              <span>Auto-reloading page</span>
              <span style={{ color: "var(--accent-orange, #e25327)", fontWeight: "bold" }}>{countdown}s</span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--rule, rgba(25, 24, 24, 0.1))", borderRadius: "999px", overflow: "hidden" }}>
              <div 
                style={{
                  height: "100%",
                  backgroundColor: "var(--accent-orange, #e25327)",
                  borderRadius: "999px",
                  width: `${(countdown / 5) * 100}%`,
                  transition: "width 1s linear"
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "var(--ink, #191818)",
                color: "var(--surface, #ffffff)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(25, 24, 24, 0.1)",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--accent-orange, #e25327)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--ink, #191818)"}
            >
              Reload Now
            </button>
            <button
              onClick={() => setIsStuck(false)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid var(--rule, rgba(25, 24, 24, 0.1))",
                backgroundColor: "transparent",
                color: "var(--ink, #191818)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                cursor: "pointer",
                transition: "border-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--ink, #191818)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--rule, rgba(25, 24, 24, 0.1))"}
            >
              Keep Waiting
            </button>
          </div>
        </div>
      )}

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
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}

function ThemeColorsApplier() {
  const { cv } = useCVData();
  const { visitorPalette } = useSettings();
  useThemeColors(cv.adminSettings?.themeColors ?? null, visitorPalette);
  return null;
}

function ThemeStylesApplier() {
  const { cv } = useCVData();
  const styles = cv.adminSettings?.themeStyles;

  useEffect(() => {
    if (!styles) return;
    const root = document.documentElement;
    if (styles.fontDisplay) {
      root.style.setProperty("--font-display", styles.fontDisplay);
      root.style.setProperty("--font-instrument", styles.fontDisplay);
    }
    if (styles.fontBody) {
      root.style.setProperty("--font-body", styles.fontBody);
      root.style.setProperty("--font-dm-sans", styles.fontBody);
    }
    if (styles.fontMono) {
      root.style.setProperty("--font-mono", styles.fontMono);
      root.style.setProperty("--font-dm-mono", styles.fontMono);
    }
    if (styles.boxShadow) {
      root.style.setProperty("--box-shadow", styles.boxShadow);
    }
    if (styles.borderRadius) {
      root.style.setProperty("--card-radius", styles.borderRadius);
    }
  }, [styles]);

  return null;
}

export function CVContentWrapper({ children }: { children: React.ReactNode }) {
  const { isLocked, isLoading } = useCVData();

  if (isLoading) return <LoadingScreen />;
  if (isLocked) return <LockScreen />;
  return (
    <>
      <ThemeColorsApplier />
      <ThemeStylesApplier />
      {children}
    </>
  );
}