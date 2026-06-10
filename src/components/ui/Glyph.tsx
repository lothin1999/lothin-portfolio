"use client";

import { useState } from "react";

interface GlyphProps {
  pattern: string; // 9 characters string of 1s and 0s
  hoverPattern?: string; // 9 characters string
  size?: number; // width/height in px
  gap?: number; // gap in px
  color?: string; // CSS color
  isParentHovered?: boolean; // trigger hover externally
  className?: string;
}

export function Glyph({
  pattern,
  hoverPattern,
  size = 20,
  gap = 2,
  color = "currentColor",
  isParentHovered = false,
  className = "",
}: GlyphProps) {
  const [isSelfHovered, setIsSelfHovered] = useState(false);
  const activeHover = isParentHovered || isSelfHovered;
  const currentPattern = activeHover && hoverPattern ? hoverPattern : pattern;

  // Render a 3x3 grid of cells
  const cells = currentPattern.padEnd(9, "0").split("");

  return (
    <div
      className={`glyph shrink-0 select-none ${className}`}
      onMouseEnter={() => setIsSelfHovered(true)}
      onMouseLeave={() => setIsSelfHovered(false)}
      role="presentation"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-block",
      }}
    >
      <div
        className="glyph__grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: `${gap}px`,
          width: "100%",
          height: "100%",
          // @ts-ignore
          "--glyph-color": color,
        }}
      >
        {cells.map((char, index) => (
          <div
            key={index}
            className="glyph__cell"
            data-cell-index={index}
            data-filled={char === "1" ? "true" : "false"}
            style={{
              backgroundColor: char === "1" ? color : "transparent",
              borderColor: char === "1" ? color : "var(--rule)",
              borderWidth: "1px",
              borderStyle: "solid",
              width: "100%",
              height: "100%",
              transition: "background-color 0.16s ease, border-color 0.16s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
