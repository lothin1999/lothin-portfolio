import { NextRequest, NextResponse } from "next/server";
import { getCVData, saveCVData } from "@/lib/cvStore";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { encryptData, decryptData } from "@/lib/encryption";
import { isRateLimited } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const getEncryptionKey = () => process.env.CV_ENCRYPTION_KEY || "lothin-dev";

export async function GET(req: NextRequest) {
  const ip = req.ip || req.headers.get("cf-connecting-ip") || "127.0.0.1";

  // Rate limit: Max 30 requests per 1 minute (60,000 ms) for public GET
  const { limited, retryAfter } = isRateLimited(ip, {
    intervalMs: 60 * 1000,
    maxRequests: 30,
    limitName: "cv_get",
  });

  if (limited) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }
  const data = await getCVData();
  
  if (data && (data as any).encrypted && (data as any).ciphertext) {
    try {
      const decrypted = await decryptData((data as any).ciphertext, getEncryptionKey());
      return NextResponse.json(decrypted, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    } catch (err) {
      console.error("Failed to decrypt CV data on server:", err);
      return NextResponse.json({ error: "Decryption failed" }, { status: 500 });
    }
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function PUT(req: NextRequest) {
  const ip = req.ip || req.headers.get("cf-connecting-ip") || "127.0.0.1";

  // Rate limit: Max 5 requests per 1 minute (60,000 ms) for admin updates
  const { limited, retryAfter } = isRateLimited(ip, {
    intervalMs: 60 * 1000,
    maxRequests: 5,
    limitName: "cv_put",
  });

  if (limited) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const encryptedStr = await encryptData(body, getEncryptionKey());
    const payload = {
      encrypted: true,
      ciphertext: encryptedStr
    };
    await saveCVData(payload as any);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to save encrypted CV data on server:", err);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

