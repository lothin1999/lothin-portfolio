"use client";

import { useEffect, useState, useRef } from "react";
import { useSettings } from "./SettingsContext";

export function CustomCursor() {
  const { customCursor } = useSettings();
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [ringPosition, setRingPosition] = useState({ x: -100, y: -100 });
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const requestRef = useRef<number | null>(null);

  // Check if touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-ignore
          navigator.msMaxTouchPoints > 0
      );
    };
    checkTouch();
  }, []);

  // Mouse move handler
  useEffect(() => {
    if (!customCursor || isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [customCursor, isTouchDevice]);

  // Lerp loop for the lagging ring
  useEffect(() => {
    if (!customCursor || isTouchDevice) return;

    const updateRing = () => {
      const lerp = 0.15; // interpolation rate
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;

      const newX = ringRef.current.x + (targetX - ringRef.current.x) * lerp;
      const newY = ringRef.current.y + (targetY - ringRef.current.y) * lerp;

      ringRef.current = { x: newX, y: newY };
      setRingPosition({ x: newX, y: newY });

      requestRef.current = requestAnimationFrame(updateRing);
    };

    requestRef.current = requestAnimationFrame(updateRing);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [customCursor, isTouchDevice]);

  // Track hover targets using mouseover event delegation
  useEffect(() => {
    if (!customCursor || isTouchDevice) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        "a, button, [data-cursor-hover], .interactive, .post-card, .post-item"
      ) as HTMLElement | null;

      if (target) {
        setIsHovering(true);
        const rect = target.getBoundingClientRect();
        setHoveredRect(rect);
      } else {
        setIsHovering(false);
        setHoveredRect(null);
      }
    };

    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [customCursor, isTouchDevice]);

  if (!customCursor || isTouchDevice) return null;

  return (
    <>
      {/* Dot and Lagging Ring */}
      <div
        className={`custom-cursor ${isHovering ? "is-hovering" : ""}`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      >
        <div className="custom-cursor__dot" />
        <div
          className="custom-cursor__ring"
          style={{
            transform: `translate3d(${ringPosition.x - position.x}px, ${ringPosition.y - position.y}px, 0)`,
          }}
        />
      </div>

      {/* Target Corner Brackets Overlay */}
      {hoveredRect && isHovering && (
        <div
          className="cursor-target active"
          style={{
            position: "fixed",
            left: `${hoveredRect.left - 4}px`,
            top: `${hoveredRect.top - 4}px`,
            width: `${hoveredRect.width + 8}px`,
            height: `${hoveredRect.height + 8}px`,
            border: "1.5px solid var(--accent-orange)",
            pointerEvents: "none",
            zIndex: 9996,
            transition: "left 0.12s ease, top 0.12s ease, width 0.12s ease, height 0.12s ease",
          }}
        >
          {/* Brackets styled using borders */}
          <style>{`
            .cursor-target::before, .cursor-target::after {
              content: '';
              position: absolute;
              width: 6px;
              height: 6px;
              border-color: var(--accent-orange);
              border-style: solid;
            }
            /* Corner Brackets Masking */
            .cursor-target {
              border-color: transparent !important; /* Hide outer border, show corners */
            }
            .cursor-target-corner-tl {
              position: absolute; top: 0; left: 0; width: 6px; height: 6px;
              border-top: 1.5px solid var(--accent-orange); border-left: 1.5px solid var(--accent-orange);
            }
            .cursor-target-corner-tr {
              position: absolute; top: 0; right: 0; width: 6px; height: 6px;
              border-top: 1.5px solid var(--accent-orange); border-right: 1.5px solid var(--accent-orange);
            }
            .cursor-target-corner-bl {
              position: absolute; bottom: 0; left: 0; width: 6px; height: 6px;
              border-bottom: 1.5px solid var(--accent-orange); border-left: 1.5px solid var(--accent-orange);
            }
            .cursor-target-corner-br {
              position: absolute; bottom: 0; right: 0; width: 6px; height: 6px;
              border-bottom: 1.5px solid var(--accent-orange); border-right: 1.5px solid var(--accent-orange);
            }
          `}</style>
          <div className="cursor-target-corner-tl" />
          <div className="cursor-target-corner-tr" />
          <div className="cursor-target-corner-bl" />
          <div className="cursor-target-corner-br" />
        </div>
      )}
    </>
  );
}
