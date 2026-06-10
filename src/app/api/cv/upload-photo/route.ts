import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "IMGBB_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert to base64 for imgbb API
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const body = new URLSearchParams();
    body.set("image", base64);
    body.set("key", apiKey);

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body,
    });

    const json = (await res.json()) as {
      success: boolean;
      data?: { url: string; display_url: string };
      error?: { message: string };
    };

    if (!json.success) {
      return NextResponse.json(
        { error: json.error?.message ?? "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: json.data!.display_url });
  } catch (e) {
    return NextResponse.json({ error: "Upload error" }, { status: 500 });
  }
}
