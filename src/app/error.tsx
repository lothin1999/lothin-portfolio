'use client';

export const runtime = 'edge';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center max-w-xl mx-auto">
      <span className="chip chip-glow mb-6 text-xs px-3 py-1 font-mono uppercase tracking-wider text-accent border border-accent/20">
        System Error
      </span>
      <h1 className="font-display text-5xl md:text-6xl mb-6 italic text-ink">
        Something went wrong
      </h1>
      <p className="font-body text-base text-muted mb-10 leading-relaxed">
        An unexpected error occurred during execution.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 rounded-full bg-accent text-white font-body text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm"
      >
        Try again
      </button>
    </div>
  );
}
