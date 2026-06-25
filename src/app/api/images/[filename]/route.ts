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
    const clean = (val?: string) => val ? val.replace(/['"]/g, "") : "";

    // --- Path 1: Cloudflare Worker binding (production / pnpm preview) ---
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME;

    if (bucket) {
      let object = await bucket.get(key);
      if (!object) {
        // Fallback to first available image key in bucket
        const listed = await bucket.list({ prefix: "images/" });
        const firstImage = listed.objects.find((o: any) => o.key !== key && /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(o.key));
        if (firstImage) {
          object = await bucket.get(firstImage.key);
        }
      }

      if (!object) {
        return NextResponse.redirect(new URL("/og-image.png", req.url));
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      return new NextResponse(object.body, { headers });
    }

    // --- Path 2: R2 S3-compatible API (local dev with credentials in .env) ---
    let r2Response = await fetchFromR2API(key);

    if (r2Response) {
      if (r2Response.status === 404) {
        // Fallback: search for first available image via S3 API listing
        const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
        const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
        const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";
        if (accountId && apiToken) {
          try {
            const listUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects`;
            const listRes = await fetch(listUrl, {
              method: "GET",
              headers: { Authorization: `Bearer ${apiToken}` },
            });
            if (listRes.ok) {
              const listJson = await listRes.json() as any;
              if (listJson.success && listJson.result) {
                const firstImage = listJson.result.find((o: any) => 
                  o.key.startsWith("images/") && 
                  /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(o.key)
                );
                if (firstImage) {
                  r2Response = await fetchFromR2API(firstImage.key);
                }
              }
            }
          } catch (listErr) {
            console.error("Failed to list fallback image in dev:", listErr);
          }
        }
      }

      if (r2Response && r2Response.status === 404) {
        return NextResponse.redirect(new URL("/og-image.png", req.url));
      }
      if (r2Response && r2Response.ok) {
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
      if (r2Response) {
        console.error(
          "R2 API fetch failed:",
          r2Response.status,
          await r2Response.text()
        );
      }
    }

    // --- Path 3: No credentials configured ---
    return NextResponse.redirect(new URL("/og-image.png", req.url));
  } catch (err) {
    console.error("Error serving image, redirecting to default:", err);
    return NextResponse.redirect(new URL("/og-image.png", req.url));
  }
}
