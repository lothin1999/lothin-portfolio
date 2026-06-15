import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const decodedPath = decodeURIComponent(url.pathname);

  // Match the filename both with and without url encoding
  if (
    decodedPath === "/THOEUN LOTHIN CV & LETTER HEAD.html" ||
    url.pathname === "/THOEUN%20LOTHIN%20CV%20&%20LETTER%20HEAD.html"
  ) {
    // Dynamically rewrite to the download API route
    return NextResponse.rewrite(new URL("/api/cv/download", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/THOEUN LOTHIN CV & LETTER HEAD.html",
    // Next.js matchers decode pathnames before matching, but we list both just in case
    "/THOEUN%20LOTHIN%20CV%20&%20LETTER%20HEAD.html",
  ],
};
