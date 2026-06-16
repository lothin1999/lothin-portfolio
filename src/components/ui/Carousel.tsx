"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  images: string[];
}

export function Carousel({ images }: CarouselProps) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const next = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const hasMultiple = images.length > 1;

  return (
    <div className="relative w-full aspect-video rounded border border-rule overflow-hidden group bg-surface mt-6 hover:border-ink transition-colors duration-300">
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={`Project screenshot ${index + 1}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="object-cover w-full h-full"
        />
      </AnimatePresence>

      {hasMultiple && (
        <>
          {/* Navigation Controls */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded bg-surface/80 dark:bg-bg/80 border border-rule hover:border-ink hover:text-accent text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
            aria-label="Previous image"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded bg-surface/80 dark:bg-bg/80 border border-rule hover:border-ink hover:text-accent text-ink opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none cursor-pointer flex items-center justify-center"
            aria-label="Next image"
          >
            <ChevronRight size={14} />
          </button>

          {/* Monospace Indicator */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-surface/90 dark:bg-bg/90 border border-rule rounded font-mono text-[9px] tracking-wider text-ink2 select-none shadow-sm">
            {String(index + 1).padStart(2, "0")} // {String(images.length).padStart(2, "0")}
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "bg-accent w-4" : "bg-muted/40 hover:bg-muted/80"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
