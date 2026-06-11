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

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.PORTFOLIO_BUCKET;

    if (!bucket) {
      return new NextResponse("Bucket not configured", { status: 500 });
    }

    const filename = params.filename;
    const key = `images/${filename}`;

    const object = await bucket.get(key);
    if (!object) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    // Enable public caching for 1 year since profile photos are static assets
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(object.body, {
      headers,
    });
  } catch (err) {
    console.error("Error serving image from R2:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
