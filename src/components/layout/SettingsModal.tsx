"use client";

import { useSettings } from "./SettingsContext";
import { VISITOR_PALETTES } from "@/lib/visitorPalettes";
import { useTheme } from "@/hooks/useTheme";

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
    visitorPalette,
    setVisitorPalette,
  } = useSettings();

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleClose = () => setSettingsOpen(false);

  if (!settingsOpen) return null;

  const activePaletteId = visitorPalette?.id ?? "default";

  return (
    <div className="overlay-dialog" role="dialog" aria-modal="true">
      <div className="overlay-dialog__backdrop" onClick={handleClose} />
      <div className="overlay-dialog__content max-w-[440px] p-6 z-10 rounded border bg-surface flex flex-col gap-5">
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

        {/* ── Toggle Switches ─────────────────────────────────────── */}
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

        {/* ── Color Palette Picker ─────────────────────────────────── */}
        <div className="border-t border-rule pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] tracking-[1.5px] uppercase text-muted">// color.palette</p>
              <p className="font-mono text-[10px] text-muted/70 mt-0.5">Saved locally in your browser</p>
            </div>
            {activePaletteId !== "default" && (
              <button
                onClick={() => setVisitorPalette(null)}
                className="font-mono text-[9px] uppercase tracking-wide text-muted hover:text-accent transition-colors border border-rule rounded px-2 py-0.5 cursor-pointer bg-transparent"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {VISITOR_PALETTES.map((palette) => {
              const colors = isDark ? palette.dark : palette.light;
              const isActive = activePaletteId === palette.id;

              return (
                <button
                  key={palette.id}
                  title={palette.name}
                  onClick={() => setVisitorPalette(palette.id === "default" ? null : palette)}
                  className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer focus:outline-none ${
                    isActive
                      ? "border-accent bg-accent/5"
                      : "border-rule hover:border-ink/30 bg-transparent"
                  }`}
                  aria-pressed={isActive}
                  aria-label={`${palette.name} color palette`}
                >
                  {/* Color swatches */}
                  <div className="flex gap-0.5">
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: colors.accent }}
                    />
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: colors.bg }}
                    />
                    <div
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: colors.surface }}
                    />
                  </div>

                  {/* Palette name */}
                  <span
                    className={`font-mono text-[8px] leading-tight text-center transition-colors ${
                      isActive ? "text-accent" : "text-muted group-hover:text-ink"
                    }`}
                  >
                    {palette.emoji}
                  </span>
                  <span
                    className={`font-mono text-[8px] leading-tight text-center transition-colors ${
                      isActive ? "text-accent" : "text-muted group-hover:text-ink"
                    }`}
                  >
                    {palette.name}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                      <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                        <path d="M1 3.5l1.5 1.5 3-3" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active palette preview */}
          {activePaletteId !== "default" && visitorPalette && (
            <div
              className="rounded-md p-3 border text-[11px] font-mono transition-all"
              style={{
                backgroundColor: isDark ? visitorPalette.dark.bg : visitorPalette.light.bg,
                borderColor: "rgba(128,128,128,0.15)",
              }}
            >
              <span style={{ color: isDark ? visitorPalette.dark.muted : visitorPalette.light.muted }}>
                // active:{" "}
              </span>
              <span style={{ color: isDark ? visitorPalette.dark.accent : visitorPalette.light.accent }}>
                {visitorPalette.emoji} {visitorPalette.name}
              </span>
            </div>
          )}
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
