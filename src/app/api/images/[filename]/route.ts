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
 * Used when the Worker binding (R2_BUCKET_NAME) is unavailable (e.g. pnpm dev).
 */
async function fetchFromR2API(key: string): Promise<Response | null> {
  const clean = (val?: string) => val ? val.replace(/['"]/g, "") : "";
  const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
  const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";

  if (!accountId || !apiToken) return null;

  const encodedKey = key
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${encodedKey}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });
    return response;
  } catch (err) {
    console.error("Error in fetchFromR2API:", err);
    return null;
  }
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
    const bucket = env?.R2_BUCKET_NAME;

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
