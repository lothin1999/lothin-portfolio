import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const decodedPath = decodeURIComponent(url.pathname);

  if (
    decodedPath === "/THOEUN LOTHIN CV & LETTER HEAD.html" ||
    url.pathname === "/THOEUN%20LOTHIN%20CV%20&%20LETTER%20HEAD.html"
  ) {
    return NextResponse.rewrite(new URL("/api/cv/download", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/THOEUN LOTHIN CV & LETTER HEAD.html",
    "/THOEUN%20LOTHIN%20CV%20&%20LETTER%20HEAD.html",
  ],
};
