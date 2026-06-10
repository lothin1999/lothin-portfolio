import Link from "next/link";

export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center max-w-xl mx-auto">
      <span className="chip chip-glow mb-6 text-xs px-3 py-1 font-mono uppercase tracking-wider text-accent border border-accent/20">
        404 / Page Not Found
      </span>
      <h1 className="font-display text-7xl md:text-8xl mb-6 italic text-ink">
        Lost in space
      </h1>
      <p className="font-body text-base md:text-lg text-muted mb-10 leading-relaxed">
        The page you are looking for has either been moved, deleted, or never existed in the first place. Let's get you back on track.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/"
          className="px-8 py-3 rounded-full bg-accent text-white font-body text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02]"
        >
          Return Home
        </Link>
        <Link
          href="/about"
          className="px-8 py-3 rounded-full border border-color-border text-ink font-body text-sm font-medium hover:bg-tag-bg transition-all flex items-center gap-2"
        >
          About Me
        </Link>
      </div>
    </div>
  );
}
