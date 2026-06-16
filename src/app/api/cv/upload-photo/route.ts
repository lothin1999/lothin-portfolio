import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";

export const runtime = "edge";

async function getCFContext() {
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    return getRequestContext();
  } catch {
    return null;
  }
}

/**
 * Upload an image to Cloudflare R2 via the S3-compatible API.
 * Used when the Worker binding (R2_BUCKET_NAME) is unavailable (e.g. pnpm dev).
 */
async function uploadViaR2API(
  file: File,
  key: string
): Promise<{ ok: boolean; error?: string }> {
  const clean = (val?: string) => val ? val.replace(/['"]/g, "") : "";
  const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
  const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";

  if (!accountId || !apiToken) {
    return {
      ok: false,
      error:
        "Cloudflare credentials not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_API_TOKEN in .env",
    };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`;
  const contentType = file.type || "image/jpeg";
  const buffer = await file.arrayBuffer();

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": contentType,
      },
      body: new Uint8Array(buffer),
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `R2 API error ${response.status}: ${text}` };
    }

    const json = (await response.json()) as any;
    if (!json.success) {
      return { ok: false, error: `R2 API failure: ${JSON.stringify(json.errors)}` };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Fetch network error" };
  }
}

export async function POST(req: NextRequest) {
  const ip = req.ip || req.headers.get("cf-connecting-ip") || "127.0.0.1";

  // Rate limit: Max 5 upload requests per 1 minute (60,000 ms)
  const { limited, retryAfter } = isRateLimited(ip, {
    intervalMs: 60 * 1000,
    maxRequests: 5,
    limitName: "upload_photo",
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
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Compress/resize is handled on the client side before upload.
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `profile-${Date.now()}.${extension}`;
    const key = `images/${filename}`;
    const relativeUrl = `/api/images/${filename}`;

    // --- Path 1: Cloudflare Worker binding (production / pnpm preview) ---
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME;

    if (bucket) {
      const buffer = await file.arrayBuffer();
      await bucket.put(key, new Uint8Array(buffer), {
        httpMetadata: { contentType: file.type || "image/jpeg" },
      });
      return NextResponse.json({ url: relativeUrl });
    }

    // --- Path 2: R2 REST API (local dev with credentials in .env) ---
    const result = await uploadViaR2API(file, key);
    if (result.ok) {
      return NextResponse.json({ url: relativeUrl });
    }

    // --- Path 3: Credentials present but upload failed, OR no credentials at all ---
    if (result.error && result.error.includes("not configured")) {
      return NextResponse.json(
        {
          error:
            "Image upload unavailable in local dev. " +
            "Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_API_TOKEN to your .env.",
          detail: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "R2 Upload failed",
        detail: result.error,
      },
      { status: 500 }
    );
  } catch (e: any) {
    console.error("Image upload exception:", e);
    return NextResponse.json(
      { error: e?.message || "Upload error" },
      { status: 500 }
    );
  }
}
