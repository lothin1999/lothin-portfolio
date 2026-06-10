"use client";

import { useEffect, useState, useRef } from "react";
import { useSettings } from "../layout/SettingsContext";

interface ScrambleTextProps {
  text: string;
  duration?: number; // duration in ms
  delay?: number; // delay in ms
  scrambleOnHover?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p" | "div";
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function ScrambleText({
  text,
  duration = 800,
  delay = 0,
  scrambleOnHover = true,
  className = "",
  as: Component = "span",
}: ScrambleTextProps) {
  const { scrambleText: isGlobalScrambleEnabled } = useSettings();
  const [displayText, setDisplayText] = useState(text);
  const isAnimating = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = () => {
    if (!isGlobalScrambleEnabled) {
      setDisplayText(text);
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    isAnimating.current = true;

    const length = text.length;
    let frame = 0;
    const totalFrames = Math.max(10, Math.floor(duration / 30));

    intervalRef.current = setInterval(() => {
      frame++;

      const scrambled = text
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";

          const progress = frame / totalFrames;
          const letterSettleFrame = (index / length) * totalFrames * 0.8;

          if (frame >= letterSettleFrame + (totalFrames - letterSettleFrame) * progress) {
            return char;
          }

          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplayText(scrambled);

      if (frame >= totalFrames) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        isAnimating.current = false;
      }
    }, 30);
  };

  useEffect(() => {
    setDisplayText(text);

    if (!isGlobalScrambleEnabled) {
      return;
    }

    // Set initial dashes
    setDisplayText(
      text
        .split("")
        .map((c) => (c === " " ? " " : "-"))
        .join("")
    );

    // Clean up previous triggers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    isAnimating.current = false;

    timeoutRef.current = setTimeout(() => {
      startScramble();
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, delay, isGlobalScrambleEnabled]);

  const handleMouseEnter = () => {
    if (scrambleOnHover && !isAnimating.current) {
      startScramble();
    }
  };

  return (
    <Component className={className} onMouseEnter={handleMouseEnter}>
      {displayText}
    </Component>
  );
}

