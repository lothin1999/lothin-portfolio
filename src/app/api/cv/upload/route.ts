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
 * Upload any file to Cloudflare R2 via the S3-compatible API.
 * Used when the Worker binding (R2_BUCKET_NAME) is unavailable (e.g. pnpm dev).
 */
async function uploadViaR2API(
  file: File,
  key: string
): Promise<{ ok: boolean; error?: string }> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || "portfolio-data";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return {
      ok: false,
      error:
        "R2 credentials not configured. Set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env",
    };
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const url = `${endpoint}/${bucketName}/${key}`;

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:-]/g, "").split(".")[0] + "Z";
  const dateOnly = dateStr.slice(0, 8);

  const buffer = await file.arrayBuffer();
  const bodyBytes = new Uint8Array(buffer);

  // Compute SHA-256 of payload
  const hashBuffer = await crypto.subtle.digest("SHA-256", bodyBytes);
  const payloadHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const contentType = file.type || "application/octet-stream";
  const region = "auto";
  const service = "s3";

  const canonicalHeaders =
    `host:${accountId}.r2.cloudflarestorage.com\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${dateStr}\n`;

  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    "PUT",
    `/${bucketName}/${key}`,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateOnly}/${region}/${service}/aws4_request`;
  const requestHashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalRequest)
  );
  const requestHash = Array.from(new Uint8Array(requestHashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    dateStr,
    credentialScope,
    requestHash,
  ].join("\n");

  // Derive signing key
  const sign = async (key: CryptoKey, data: string): Promise<CryptoKey> => {
    const sig = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(data)
    );
    return crypto.subtle.importKey(
      "raw",
      sig,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  };

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`AWS4${secretAccessKey}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const kDate = await sign(keyMaterial, dateOnly);
  const kRegion = await sign(kDate, region);
  const kService = await sign(kRegion, service);
  const kSigning = await sign(kService, "aws4_request");

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    kSigning,
    new TextEncoder().encode(stringToSign)
  );
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-date": dateStr,
      "x-amz-content-sha256": payloadHash,
      Authorization: authHeader,
    },
    body: bodyBytes,
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, error: `R2 API error ${response.status}: ${text}` };
  }

  return { ok: true };
}

export async function POST(req: NextRequest) {
  const ip = req.ip || req.headers.get("cf-connecting-ip") || "127.0.0.1";

  // Rate limit: Max 10 upload requests per 1 minute (60,000 ms)
  const { limited, retryAfter } = isRateLimited(ip, {
    intervalMs: 60 * 1000,
    maxRequests: 10,
    limitName: "upload_file",
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
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = file.name || "file";
    const extension = name.split(".").pop()?.toLowerCase() || "bin";
    const isPdf = file.type === "application/pdf" || extension === "pdf";

    let key = "";
    let relativeUrl = "";

    if (isPdf) {
      const filename = `cv-${Date.now()}.pdf`;
      key = `cv/${filename}`;
      relativeUrl = `/api/cv/pdf/${filename}`;
    } else {
      const filename = `img-${Date.now()}.${extension}`;
      key = `images/${filename}`;
      relativeUrl = `/api/images/${filename}`;
    }

    // --- Path 1: Cloudflare Worker binding (production / pnpm preview) ---
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME;

    if (bucket) {
      const buffer = await file.arrayBuffer();
      await bucket.put(key, new Uint8Array(buffer), {
        httpMetadata: { contentType: file.type || (isPdf ? "application/pdf" : "image/jpeg") },
      });
      return NextResponse.json({ url: relativeUrl });
    }

    // --- Path 2: R2 S3-compatible API (local dev with credentials in .env) ---
    const result = await uploadViaR2API(file, key);
    if (result.ok) {
      return NextResponse.json({ url: relativeUrl });
    }

    // --- Path 3: No credentials at all — tell dev clearly what to do ---
    return NextResponse.json(
      {
        error:
          "Upload unavailable in local dev. " +
          "Add CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY to your .env, " +
          "OR run `pnpm preview` to use the full Cloudflare runtime locally.",
        detail: result.error,
      },
      { status: 500 }
    );
  } catch (e: any) {
    console.error("File upload exception:", e);
    return NextResponse.json(
      { error: e?.message || "Upload error" },
      { status: 500 }
    );
  }
}
