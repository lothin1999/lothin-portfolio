"use client";

import { useCVData } from "@/hooks/useCVData";

export function CVButtons() {
  const { cv } = useCVData();
  const { profile } = cv;

  return (
    <div className="pt-4 border-t border-rule mt-4 space-y-2 w-full">
      {profile.cvPdfUrl && (
        <a
          href={profile.cvPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 bg-surface border border-rule hover:border-ink text-ink hover:text-accent text-xs font-mono rounded tracking-wide transition-all duration-200 inline-flex items-center justify-center gap-1.5"
        >
          Download CV (PDF)
        </a>
      )}
      {profile.coverLetterPdfUrl && (
        <a
          href={profile.coverLetterPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 bg-surface border border-rule hover:border-ink text-ink hover:text-accent text-xs font-mono rounded tracking-wide transition-all duration-200 inline-flex items-center justify-center gap-1.5"
        >
          Download Letter (PDF)
        </a>
      )}
      <a
        href="/cv"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-4 bg-ink hover:bg-accent text-white hover:text-white dark:bg-ink dark:hover:bg-accent text-xs font-mono rounded tracking-wide transition-all duration-200 inline-flex items-center justify-center gap-1.5"
      >
        View CV (HTML Preview)
      </a>
    </div>
  );
}
