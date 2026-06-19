"use client";

import { useState, useRef } from "react";

interface ImageCubeProps {
  imageUrl?: string;
  fallbackText?: string;
  size?: number;
  className?: string;
}

export function ImageCube({
  imageUrl,
  fallbackText = "//",
  size = 120,
  className = "",
}: ImageCubeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const cubeRef = useRef<HTMLDivElement>(null);
  const half = size / 2;

  const faceStyle = (transform: string): React.CSSProperties => ({
    position: "absolute",
    width: `${size}px`,
    height: `${size}px`,
    backfaceVisibility: "hidden",
    transform,
    overflow: "hidden",
    border: "1px solid var(--rule)",
  });

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const overlayColors = [
    "rgba(var(--accent-rgb, 99,102,241), 0.08)",
    "rgba(var(--accent-orange-rgb, 234,88,12), 0.10)",
    "rgba(99, 102, 241, 0.06)",
    "rgba(234, 88, 12, 0.08)",
    "rgba(99, 102, 241, 0.12)",
    "rgba(234, 88, 12, 0.06)",
  ];

  const transforms = [
    `rotateY(0deg) translateZ(${half}px)`,     // front
    `rotateY(180deg) translateZ(${half}px)`,   // back
    `rotateY(90deg) translateZ(${half}px)`,    // right
    `rotateY(-90deg) translateZ(${half}px)`,   // left
    `rotateX(90deg) translateZ(${half}px)`,    // top
    `rotateX(-90deg) translateZ(${half}px)`,   // bottom
  ];

  return (
    <div
      className={`image-cube-wrapper ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        perspective: `${size * 4}px`,
        perspectiveOrigin: "50% 50%",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={cubeRef}
        className="image-cube"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: "relative",
          transformStyle: "preserve-3d",
          animation: `cubeRotate 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite`,
          animationPlayState: isPaused ? "paused" : "running",
          transition: "animation-play-state 0.3s ease",
        }}
      >
        {transforms.map((tf, i) => (
          <div key={i} style={faceStyle(tf)}>
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt=""
                  style={{
                    ...imgStyle,
                    filter: i === 0 ? "none" : `grayscale(${20 + i * 12}%) brightness(${1 - i * 0.04})`,
                  }}
                  draggable={false}
                />
                {/* Tinted overlay per face */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: overlayColors[i],
                    mixBlendMode: "multiply",
                  }}
                />
                {/* Corner index label */}
                <span
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    right: "6px",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "8px",
                    letterSpacing: "1.5px",
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                  }}
                >
                  {["front", "back", "right", "left", "top", "bottom"][i]}
                </span>
              </>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: `${size * 0.15}px`,
                    color: "var(--muted)",
                    letterSpacing: "2px",
                  }}
                >
                  {fallbackText}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes cubeRotate {
          0% {
            transform: rotateX(-15deg) rotateY(0deg);
          }
          25% {
            transform: rotateX(15deg) rotateY(90deg);
          }
          50% {
            transform: rotateX(-10deg) rotateY(180deg);
          }
          75% {
            transform: rotateX(20deg) rotateY(270deg);
          }
          100% {
            transform: rotateX(-15deg) rotateY(360deg);
          }
        }

        .image-cube-wrapper:hover .image-cube {
          filter: drop-shadow(0 0 20px rgba(var(--accent-rgb, 99,102,241), 0.15));
        }
      `}</style>
    </div>
  );
}
