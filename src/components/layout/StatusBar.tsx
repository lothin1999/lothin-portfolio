"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCVData } from "@/hooks/useCVData";
import { useSettings } from "./SettingsContext";

export function StatusBar() {
  const { isAdmin } = useCVData();
  const { activePathSegment, setHelpOpen } = useSettings();
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  // Update clock time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (num: number) => String(num).padStart(2, "0");
      setCurrentTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  // Update scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.round(Math.min(100, Math.max(0, progress))));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine path label
  const getPathLabel = () => {
    if (!pathname) return "system";
    if (pathname === "/") {
      return activePathSegment;
    }
    if (pathname === "/articles") {
      return "writing";
    }
    if (pathname.startsWith("/articles/")) {
      return "reading";
    }
    return pathname.substring(1) || "system";
  };

  return (
    <aside className="status-bar" aria-label="System status">
      <div className="status-bar__inner">
        <div className="status-bar__left">
          {/* Mode Indicator */}
          <div className="status-bar__segment status-bar__mode">
            <span className="status-bar__mode-label text-[rgba(25,24,24,0.4)] dark:text-[rgba(244,244,244,0.4)]">[MODE:</span>
            <span className="status-bar__mode-value text-accent font-semibold">
              {isAdmin ? "ADMIN" : "VISITOR"}
            </span>
            <span className="status-bar__mode-label text-[rgba(25,24,24,0.4)] dark:text-[rgba(244,244,244,0.4)]">]</span>
          </div>

          {/* Section Path */}
          <div className="status-bar__segment status-bar__path">
            <span className="status-bar__path-prefix text-[rgba(25,24,24,0.4)] dark:text-[rgba(244,244,244,0.4)]">//</span>
            <span className="status-bar__path-value font-medium text-ink">
              {getPathLabel()}
            </span>
          </div>
        </div>

        {/* Center/Right segments */}
        <div className="status-bar__right">
          {/* Cambodia Lo-Fi Now Playing */}
          <div className="status-bar__segment hidden md:flex items-center gap-1.5">
            <span className="text-accent animate-pulse">♪</span>
            <span className="text-ink2 font-medium">Cambodia Lo-Fi</span>
          </div>

          {/* Scroll Progress Meter */}
          <div className="status-bar__segment flex items-center gap-2">
            <span className="font-mono text-ink text-[10px] w-6 text-right">
              {scrollProgress}
            </span>
            <span className="text-[rgba(25,24,24,0.4)] dark:text-[rgba(244,244,244,0.4)]">%</span>
            <div className="status-bar__progress-bar rounded-[1px] bg-rule">
              <div
                className="status-bar__progress-fill rounded-[1px]"
                style={{ transform: `scaleX(${scrollProgress / 100})` }}
              />
            </div>
          </div>

          {/* Clock */}
          <div className="status-bar__segment status-bar__clock text-ink2 font-medium">
            {currentTime}
          </div>

          {/* Help button to open Keyboard Shortcuts */}
          <button
            className="status-bar__help"
            onClick={() => setHelpOpen(true)}
            aria-label="Open keyboard shortcuts help"
          >
            ?
          </button>
        </div>
      </div>
    </aside>
  );
}
