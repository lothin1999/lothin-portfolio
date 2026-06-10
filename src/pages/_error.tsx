import React from 'react';

export const runtime = "experimental-edge";

interface ErrorProps {
  statusCode?: number;
}

export default function Error({ statusCode }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center max-w-xl mx-auto">
      <span className="chip chip-glow mb-6 text-xs px-3 py-1 font-mono uppercase tracking-wider text-accent border border-accent/20">
        Error {statusCode || ''}
      </span>
      <h1 className="font-serif text-5xl md:text-6xl mb-6 italic text-ink">
        An unexpected error occurred
      </h1>
      <p className="font-sans text-base text-muted mb-10 leading-relaxed">
        Something went wrong on our end. Please try reloading the page.
      </p>
    </div>
  );
}
