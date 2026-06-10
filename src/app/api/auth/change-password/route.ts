import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, hashPassword, verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = schema.parse(body);

    const valid = await verifyPassword(currentPassword);
    if (!valid) {
      return NextResponse.json({ error: "Current password is wrong" }, { status: 403 });
    }

    const newHash = await hashPassword(newPassword);

    return NextResponse.json({
      ok: true,
      message: "Copy this value into your ADMIN_PASSWORD_HASH environment variable, then redeploy.",
      newHash,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
