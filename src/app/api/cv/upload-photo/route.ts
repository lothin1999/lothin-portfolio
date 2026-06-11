import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "edge";

async function getCFContext() {
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    return getRequestContext();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.PORTFOLIO_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { error: "Cloudflare R2 Bucket binding (PORTFOLIO_BUCKET) is not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Get file extension (fallback to png)
    const extension = file.name.split(".").pop() || "png";
    const filename = `profile-${Date.now()}.${extension}`;
    const key = `images/${filename}`;

    const buffer = await file.arrayBuffer();
    await bucket.put(key, buffer, {
      httpMetadata: {
        contentType: file.type || "image/png",
      },
    });

    // Return the relative URL of our serving route
    const relativeUrl = `/api/images/${filename}`;
    return NextResponse.json({ url: relativeUrl });
  } catch (e) {
    console.error("Image upload error:", e);
    return NextResponse.json({ error: "Upload error" }, { status: 500 });
  }
}
