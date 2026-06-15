import { NextRequest, NextResponse } from "next/server";

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
 * Fetch an image from R2 via the S3-compatible API.
 * Used when the Worker binding (PORTFOLIO_BUCKET) is unavailable (e.g. pnpm dev).
 */
async function fetchFromR2API(key: string): Promise<Response | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || "portfolio-data";

  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:-]/g, "").split(".")[0] + "Z";
  const dateOnly = dateStr.slice(0, 8);
  const region = "auto";
  const service = "s3";

  const canonicalHeaders =
    `host:${accountId}.r2.cloudflarestorage.com\n` +
    `x-amz-content-sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n` +
    `x-amz-date:${dateStr}\n`;

  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const emptyHash =
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  const encodedKey = key
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");

  const canonicalRequest = [
    "GET",
    `/${bucketName}/${encodedKey}`,
    "",
    canonicalHeaders,
    signedHeaders,
    emptyHash,
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

  const url = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${encodedKey}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-amz-date": dateStr,
      "x-amz-content-sha256": emptyHash,
      Authorization: authHeader,
    },
  });

  return response;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const key = `images/${filename}`;

    // --- Path 1: Cloudflare Worker binding (production / pnpm preview) ---
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.PORTFOLIO_BUCKET;

    if (bucket) {
      const object = await bucket.get(key);
      if (!object) {
        return new NextResponse("Image not found", { status: 404 });
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new NextResponse(object.body, { headers });
    }

    // --- Path 2: R2 S3-compatible API (local dev with credentials in .env) ---
    const r2Response = await fetchFromR2API(key);

    if (r2Response) {
      if (r2Response.status === 404) {
        return new NextResponse("Image not found", { status: 404 });
      }
      if (r2Response.ok) {
        const contentType =
          r2Response.headers.get("Content-Type") || "image/jpeg";
        return new NextResponse(r2Response.body, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
      console.error(
        "R2 API fetch failed:",
        r2Response.status,
        await r2Response.text()
      );
    }

    // --- Path 3: No credentials configured ---
    return new NextResponse(
      "Image unavailable in local dev: set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env",
      { status: 500 }
    );
  } catch (err) {
    console.error("Error serving image:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
