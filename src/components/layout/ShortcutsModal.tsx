"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "./SettingsContext";

export function ShortcutsModal() {
  const { helpOpen, setHelpOpen, setSettingsOpen } = useSettings();
  const router = useRouter();
  const lastKeyRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal dismiss handler
  const handleClose = () => setHelpOpen(false);

  // Global Keydown Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      const key = e.key;

      // Escape key
      if (key === "Escape") {
        setHelpOpen(false);
        setSettingsOpen(false);
        return;
      }

      // Help Modal toggle
      if (key === "?") {
        e.preventDefault();
        setHelpOpen(!helpOpen);
        return;
      }

      // Scrolling
      if (key === "j" || key === "ArrowDown") {
        e.preventDefault();
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(window.scrollY + 120, { duration: 0.4 });
        } else {
          window.scrollBy({ top: 120, behavior: "smooth" });
        }
        return;
      }
      if (key === "k" || key === "ArrowUp") {
        e.preventDefault();
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(window.scrollY - 120, { duration: 0.4 });
        } else {
          window.scrollBy({ top: -120, behavior: "smooth" });
        }
        return;
      }
      if (key === "G") {
        e.preventDefault();
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo("bottom", { duration: 1.0 });
        } else {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
        }
        return;
      }

      // Sequence hotkeys (starts with 'g')
      if (lastKeyRef.current === "g") {
        if (key === "g") {
          e.preventDefault();
          if ((window as any).lenis) {
            (window as any).lenis.scrollTo("top", { duration: 1.0 });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        } else if (key === "h") {
          e.preventDefault();
          router.push("/");
        } else if (key === "p") {
          e.preventDefault();
          router.push("/#experience");
          setTimeout(() => {
            const el = document.getElementById("experience");
            if (el) {
              if ((window as any).lenis) {
                (window as any).lenis.scrollTo(el, { offset: -58, duration: 1.0 });
              } else {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }
          }, 100);
        } else if (key === "s") {
          e.preventDefault();
          router.push("/#skills");
          setTimeout(() => {
            const el = document.getElementById("skills");
            if (el) {
              if ((window as any).lenis) {
                (window as any).lenis.scrollTo(el, { offset: -58, duration: 1.0 });
              } else {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }
          }, 100);
        } else if (key === "w") {
          e.preventDefault();
          router.push("/articles");
        } else if (key === "c") {
          e.preventDefault();
          router.push("/#about");
          setTimeout(() => {
            const el = document.getElementById("about");
            if (el) {
              if ((window as any).lenis) {
                (window as any).lenis.scrollTo(el, { offset: -58, duration: 1.0 });
              } else {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }
          }, 100);
        } else if (key === ",") {
          e.preventDefault();
          setSettingsOpen(true);
        }

        lastKeyRef.current = null;
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        if (key === "g") {
          lastKeyRef.current = "g";
          // Clear prefix if no second key pressed in 1 second
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            lastKeyRef.current = null;
          }, 1000);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router, setHelpOpen, setSettingsOpen]);

  if (!helpOpen) return null;

  return (
    <div className="overlay-dialog" role="dialog" aria-modal="true">
      <div className="overlay-dialog__backdrop" onClick={handleClose} />
      <div className="overlay-dialog__content max-w-[420px] p-6 z-10 rounded border bg-surface flex flex-col gap-4">
        <header className="flex items-center justify-between border-b border-rule pb-3">
          <h2 className="font-mono text-[14px] text-ink font-semibold">// keyboard.shortcuts</h2>
          <button
            onClick={handleClose}
            className="text-[20px] text-muted hover:text-ink leading-none cursor-pointer focus:outline-none"
            aria-label="Close shortcuts help"
          >
            &times;
          </button>
        </header>

        <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto pr-1">
          {/* Group 1: Navigation */}
          <section className="flex flex-col gap-2">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted">// Navigation</h3>
            <div className="flex flex-col gap-1.5 font-mono text-[13px]">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Scroll down</span>
                <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">j</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Scroll up</span>
                <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">k</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Go to top</span>
                <span className="flex gap-1 items-center">
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">g</span>
                  <span className="text-muted text-[10px]">then</span>
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">g</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Go to bottom</span>
                <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">G</span>
              </div>
            </div>
          </section>

          {/* Group 2: Quick Jump */}
          <section className="flex flex-col gap-2">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted">// Quick Jump</h3>
            <div className="flex flex-col gap-1.5 font-mono text-[13px]">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Go home</span>
                <span className="flex gap-1 items-center">
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">g</span>
                  <span className="text-muted text-[10px]">then</span>
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">h</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Go to experience</span>
                <span className="flex gap-1 items-center">
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">g</span>
                  <span className="text-muted text-[10px]">then</span>
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">p</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Go to skills</span>
                <span className="flex gap-1 items-center">
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">g</span>
                  <span className="text-muted text-[10px]">then</span>
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">s</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Go to writing (blog)</span>
                <span className="flex gap-1 items-center">
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">g</span>
                  <span className="text-muted text-[10px]">then</span>
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">w</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Go to contact</span>
                <span className="flex gap-1 items-center">
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">g</span>
                  <span className="text-muted text-[10px]">then</span>
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">c</span>
                </span>
              </div>
            </div>
          </section>

          {/* Group 3: General */}
          <section className="flex flex-col gap-2">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted">// General</h3>
            <div className="flex flex-col gap-1.5 font-mono text-[13px]">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Toggle shortcuts list</span>
                <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">?</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Open settings panel</span>
                <span className="flex gap-1 items-center">
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">g</span>
                  <span className="text-muted text-[10px]">then</span>
                  <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">,</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-ink2">Dismiss overlays</span>
                <span className="bg-tag-bg border border-rule px-1.5 py-0.5 rounded text-[11px] text-tag-text font-bold">Esc</span>
              </div>
            </div>
          </section>
        </div>

        <footer className="border-t border-rule pt-3 text-center">
          <p className="font-mono text-[10.5px] text-muted">Press [?] anytime to toggle this helper.</p>
        </footer>
      </div>
    </div>
  );
}
