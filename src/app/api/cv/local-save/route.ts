import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  return NextResponse.json(
    { error: "Local file system access is not supported in this environment." },
    { status: 501 }
  );
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Local file system access is not supported in this environment." },
    { status: 501 }
  );
}
