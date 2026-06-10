"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSettings } from "../layout/SettingsContext";

interface ScrambleTextProps {
  text: string;
  duration?: number; // duration in ms
  delay?: number; // delay in ms
  scrambleOnHover?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p" | "div";
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]|;:,.<>?";

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
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const startScramble = useCallback(() => {
    if (!isGlobalScrambleEnabled || isAnimating.current) return;
    isAnimating.current = true;

    const length = text.length;
    let frame = 0;
    const totalFrames = Math.max(10, Math.floor(duration / 30));
    
    const interval = setInterval(() => {
      frame++;
      
      const scrambled = text
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          
          // Settle index based on progress
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
        clearInterval(interval);
        setDisplayText(text);
        isAnimating.current = false;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text, duration, isGlobalScrambleEnabled]);

  useEffect(() => {
    if (!isGlobalScrambleEnabled) {
      setDisplayText(text);
      return;
    }

    setDisplayText(
      text
        .split("")
        .map((c) => (c === " " ? " " : "-"))
        .join("")
    );

    timeoutId.current = setTimeout(() => {
      startScramble();
    }, delay);

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [text, delay, isGlobalScrambleEnabled, startScramble]);

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
