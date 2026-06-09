"use client";

import { useScrollProgress } from "@/hooks/useScrollReveal";

export function ScrollProgressBar() {
  const ref = useScrollProgress<HTMLDivElement>();
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
