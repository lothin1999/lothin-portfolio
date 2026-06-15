import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ idToken: z.string().min(1) });

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = schema.parse(body);

    const payload = await verifyFirebaseIdToken(idToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid ID Token" }, { status: 401 });
    }

    const adminEmailEnv = (process.env.ADMIN_EMAIL || "").trim();
    if (!adminEmailEnv) {
      console.error("ADMIN_EMAIL environment variable is not configured");
      return NextResponse.json({ error: "Server authentication misconfigured" }, { status: 500 });
    }

    const allowedEmails = adminEmailEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const email = (payload.email || "").toLowerCase();
    if (!email || !allowedEmails.includes(email)) {
      return NextResponse.json({ error: "Access denied: unauthorized email" }, { status: 403 });
    }

    const token = await createSessionToken();

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Authentication handler error:", err);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
