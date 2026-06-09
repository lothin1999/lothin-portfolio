// src/app/api/cv/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCVData, saveCVData } from "@/lib/cvStore";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

/** GET /api/cv — public, returns current CV data */
export async function GET() {
  const data = await getCVData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

/** PUT /api/cv — protected, updates CV data */
export async function PUT(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await saveCVData(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
