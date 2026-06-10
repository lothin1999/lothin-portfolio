"use client";

import { useSettings } from "./SettingsContext";

export function SettingsModal() {
  const {
    settingsOpen,
    setSettingsOpen,
    customCursor,
    setCustomCursor,
    scrambleText,
    setScrambleText,
    smoothScroll,
    setSmoothScroll,
  } = useSettings();

  const handleClose = () => setSettingsOpen(false);

  if (!settingsOpen) return null;

  return (
    <div className="overlay-dialog" role="dialog" aria-modal="true">
      <div className="overlay-dialog__backdrop" onClick={handleClose} />
      <div className="overlay-dialog__content max-w-[380px] p-6 z-10 rounded border bg-surface flex flex-col gap-5">
        <header className="flex items-center justify-between border-b border-rule pb-3">
          <h2 className="font-mono text-[14px] text-ink font-semibold">// site.settings</h2>
          <button
            onClick={handleClose}
            className="text-[20px] text-muted hover:text-ink leading-none cursor-pointer focus:outline-none"
            aria-label="Close settings"
          >
            &times;
          </button>
        </header>

        <div className="flex flex-col gap-4 font-mono text-[13px]">
          {/* Custom Cursor Option */}
          <div className="flex justify-between items-center py-1">
            <div className="flex flex-col gap-0.5 max-w-[200px]">
              <span className="text-ink font-medium text-[13px]">Custom cursor</span>
              <span className="text-muted text-[11px] leading-tight">Bracket-target cursor with lag ring</span>
            </div>
            <button
              onClick={() => setCustomCursor(!customCursor)}
              className={`w-9 h-5 rounded-full flex items-center transition-colors p-0.5 focus:outline-none ${customCursor ? "bg-accent" : "bg-rule-solid"}`}
              role="switch"
              aria-checked={customCursor}
              aria-label="Toggle custom cursor"
            >
              <div
                className={`bg-surface w-4 h-4 rounded-full shadow-sm transform transition-transform ${customCursor ? "translate-x-4" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Smooth Scroll Option */}
          <div className="flex justify-between items-center py-1">
            <div className="flex flex-col gap-0.5 max-w-[200px]">
              <span className="text-ink font-medium text-[13px]">Smooth scroll</span>
              <span className="text-muted text-[11px] leading-tight">Eased scrolling within the viewport</span>
            </div>
            <button
              onClick={() => setSmoothScroll(!smoothScroll)}
              className={`w-9 h-5 rounded-full flex items-center transition-colors p-0.5 focus:outline-none ${smoothScroll ? "bg-accent" : "bg-rule-solid"}`}
              role="switch"
              aria-checked={smoothScroll}
              aria-label="Toggle smooth scroll"
            >
              <div
                className={`bg-surface w-4 h-4 rounded-full shadow-sm transform transition-transform ${smoothScroll ? "translate-x-4" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Scramble Text Option */}
          <div className="flex justify-between items-center py-1">
            <div className="flex flex-col gap-0.5 max-w-[200px]">
              <span className="text-ink font-medium text-[13px]">Text scramble</span>
              <span className="text-muted text-[11px] leading-tight">Decoder reveals on page headers</span>
            </div>
            <button
              onClick={() => setScrambleText(!scrambleText)}
              className={`w-9 h-5 rounded-full flex items-center transition-colors p-0.5 focus:outline-none ${scrambleText ? "bg-accent" : "bg-rule-solid"}`}
              role="switch"
              aria-checked={scrambleText}
              aria-label="Toggle text scramble"
            >
              <div
                className={`bg-surface w-4 h-4 rounded-full shadow-sm transform transition-transform ${scrambleText ? "translate-x-4" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>

        <footer className="border-t border-rule pt-4 flex justify-end gap-2 font-mono text-[11.5px]">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 border border-rule hover:border-ink rounded text-muted hover:text-ink transition-colors cursor-pointer"
          >
            close
          </button>
        </footer>
      </div>
    </div>
  );
}
