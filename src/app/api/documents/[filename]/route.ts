import { NextRequest, NextResponse } from "next/server";

// Force Edge runtime for Cloudflare Pages compatibility.
export const runtime = "edge";
export const dynamic = "force-dynamic";

async function getCFContext() {
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    return getRequestContext();
  } catch {
    return null;
  }
}

async function fetchFromR2API(key: string): Promise<Response | null> {
  const clean = (val?: string) => (val ? val.replace(/['"]/g, "") : "");
  const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
  const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";

  if (!accountId || !apiToken) return null;

  // NOTE: Per Cloudflare docs, slashes in R2 object keys must NOT be percent-encoded
  // when using the REST API endpoint. Only encode each path segment (not the /).
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
    const key = `documents/${filename}`;

    // --- Path 1: Cloudflare Worker binding (production / pnpm preview) ---
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME;

    const contentType = getContentType(filename);

    if (bucket) {
      const object = await bucket.get(key);
      if (object) {
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("Content-Type", contentType);
        headers.set("Cache-Control", "public, max-age=3600");
        return new NextResponse(object.body, { headers });
      }
    }

    // --- Path 2: R2 REST API (local dev with credentials in .env) ---
    const r2Response = await fetchFromR2API(key);
    if (r2Response && r2Response.ok) {
      return new NextResponse(r2Response.body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // --- Path 3: Static Asset Fallback (Edge runtime compatible) ---
    // Handles files like README.md that live in the public folder.
    try {
      const publicUrl = new URL(`/${filename}`, req.url);
      const res = await fetch(publicUrl);
      if (res.ok) {
        const fileContent = await res.text();
        return new NextResponse(fileContent, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "no-cache",
          },
        });
      }
    } catch (err) {
      console.error("Static asset fallback fetch failed:", err);
    }

    return new NextResponse("Document not found", { status: 404 });
  } catch (err) {
    console.error("Error serving document:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "html" || ext === "htm") return "text/html; charset=utf-8";
  if (ext === "txt") return "text/plain; charset=utf-8";
  return "text/markdown; charset=utf-8";
}
