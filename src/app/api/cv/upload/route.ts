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
  const contentType = file.type || "application/octet-stream";
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
  if (!token) {
    console.error("Upload API Unauthorized: No session cookie found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isValid = await verifySessionToken(token);
  if (!isValid) {
    console.error("Upload API Unauthorized: Token verification failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploadType = formData.get("type") as string | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = file.name || "file";
    const extension = name.split(".").pop()?.toLowerCase() || "bin";
    const isPdf = file.type === "application/pdf" || extension === "pdf";
    const isDoc = uploadType === "document" || extension === "md";
    const isCube = uploadType === "cube";

    // Clean the R2 public URL (remove trailing slash)
    const r2PublicUrl = (process.env.R2_PUBLIC_URL || "").replace(/['"]/g, "").replace(/\/+$/, "");

    let key = "";
    let relativeUrl = "";

    if (isDoc) {
      const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
      key = `documents/${sanitizedName}`;
      relativeUrl = `/api/documents/${sanitizedName}`;
    } else if (isCube) {
      // Cube face images: store in cube/ folder, serve via R2 public URL for instant CDN delivery
      const filename = `face-${Date.now()}.webp`;
      key = `cube/${filename}`;
      // Use direct Cloudflare R2 public URL if configured (no proxy, instant CDN)
      relativeUrl = r2PublicUrl
        ? `${r2PublicUrl}/cube/${filename}`
        : `/api/images/cube/${filename}`;
    } else if (isPdf) {
      if (uploadType === "letter") {
        const filename = `letter-${Date.now()}.pdf`;
        key = `letter/${filename}`;
        relativeUrl = `/api/cv/pdf/${filename}`;
      } else {
        const filename = `cv-${Date.now()}.pdf`;
        key = `cv/${filename}`;
        relativeUrl = `/api/cv/pdf/${filename}`;
      }
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
      let cType = file.type || (isPdf ? "application/pdf" : "image/jpeg");
      if (isDoc) {
        if (extension === "pdf") {
          cType = "application/pdf";
        } else if (extension === "html" || extension === "htm") {
          cType = "text/html; charset=utf-8";
        } else if (extension === "txt") {
          cType = "text/plain; charset=utf-8";
        } else {
          cType = "text/markdown; charset=utf-8";
        }
      }
      await bucket.put(key, new Uint8Array(buffer), {
        httpMetadata: { contentType: cType },
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
            "Upload unavailable in local dev. " +
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
    console.error("File upload exception:", e);
    return NextResponse.json(
      { error: e?.message || "Upload error" },
      { status: 500 }
    );
  }
}

async function deleteViaR2API(key: string): Promise<{ ok: boolean; error?: string }> {
  const clean = (val?: string) => val ? val.replace(/['"]/g, "") : "";
  const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
  const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";

  if (!accountId || !apiToken) {
    return {
      ok: false,
      error: "Cloudflare credentials not configured.",
    };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `R2 API error ${response.status}: ${text}` };
    }

    const json = (await response.json()) as any;
    if (!json.success) {
      // 10007 means "The specified key does not exist." 
      // This makes the DELETE operation idempotent.
      if (json.errors?.some((e: any) => e.code === 10007)) {
        return { ok: true };
      }
      return { ok: false, error: `R2 API failure: ${JSON.stringify(json.errors)}` };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Fetch network error" };
  }
}

export async function DELETE(req: NextRequest) {
  const ip = req.ip || req.headers.get("cf-connecting-ip") || "127.0.0.1";

  // Rate limit: Max 20 delete requests per 1 minute
  const { limited, retryAfter } = isRateLimited(ip, {
    intervalMs: 60 * 1000,
    maxRequests: 20,
    limitName: "delete_file",
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
    let key = body.key || "";

    if (!key) {
      const url = body.url;
      if (!url || typeof url !== "string") {
        return NextResponse.json({ error: "No URL or key provided" }, { status: 400 });
      }

      try {
        const r2PublicUrl = (process.env.R2_PUBLIC_URL || "").replace(/['"]/g, "").replace(/\/+$/, "");
        const parsedUrl = new URL(url, "http://localhost");
        const pathname = parsedUrl.pathname;

        // Handle direct R2 public CDN URLs (e.g. https://pub-xxx.r2.dev/cube/face-123.webp)
        if (r2PublicUrl && url.startsWith(r2PublicUrl)) {
          const r2Path = url.substring(r2PublicUrl.length).replace(/^\//, "");
          key = r2Path; // key is already relative (e.g. "cube/face-123.webp")
        } else if (pathname.startsWith("/api/images/cube/")) {
          key = `cube/${pathname.substring("/api/images/cube/".length)}`;
        } else if (pathname.startsWith("/api/images/")) {
          key = `images/${pathname.substring("/api/images/".length)}`;
        } else if (pathname.startsWith("/api/documents/")) {
          key = `documents/${pathname.substring("/api/documents/".length)}`;
        } else if (pathname.startsWith("/api/cv/pdf/")) {
          const filename = pathname.substring("/api/cv/pdf/".length);
          if (filename.startsWith("letter-")) {
            key = `letter/${filename}`;
          } else {
            key = `cv/${filename}`;
          }
        } else {
          return NextResponse.json({ error: "Invalid file URL format" }, { status: 400 });
        }
      } catch (e) {
        return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
      }
    }

    // --- Path 1: Cloudflare Worker binding (production / pnpm preview) ---
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME;

    if (bucket) {
      await bucket.delete(key);
      return NextResponse.json({ ok: true });
    }

    // --- Path 2: R2 REST API (local dev) ---
    const result = await deleteViaR2API(key);
    if (result.ok) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      {
        error: "R2 Delete failed",
        detail: result.error,
      },
      { status: 500 }
    );
  } catch (e: any) {
    console.error("File delete exception:", e);
    return NextResponse.json(
      { error: e?.message || "Delete error" },
      { status: 500 }
    );
  }
}

async function listViaR2API(): Promise<{ ok: boolean; objects?: any[]; error?: string }> {
  const clean = (val?: string) => val ? val.replace(/['"]/g, "") : "";
  const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
  const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";

  if (!accountId || !apiToken) {
    return { ok: false, error: "Cloudflare credentials not configured." };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `R2 API error ${response.status}: ${text}` };
    }

    const json = (await response.json()) as any;
    if (!json.success) {
      return { ok: false, error: `R2 API failure: ${JSON.stringify(json.errors)}` };
    }

    return { ok: true, objects: json.result || [] };
  } catch (err: any) {
    return { ok: false, error: err.message || "Fetch network error" };
  }
}

export async function GET(req: NextRequest) {
  const ip = req.ip || req.headers.get("cf-connecting-ip") || "127.0.0.1";

  const { limited, retryAfter } = isRateLimited(ip, {
    intervalMs: 60 * 1000,
    maxRequests: 30,
    limitName: "list_files",
  });

  if (limited) {
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: { "Retry-After": retryAfter.toString() } }
    );
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME;

    if (bucket) {
      const listed = await bucket.list();
      const objects = listed.objects.map((o: any) => ({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded,
      }));
      return NextResponse.json({ objects });
    }

    const result = await listViaR2API();
    if (result.ok) {
      return NextResponse.json({ objects: result.objects });
    }

    return NextResponse.json(
      { error: "R2 List failed", detail: result.error },
      { status: 500 }
    );
  } catch (e: any) {
    console.error("File list exception:", e);
    return NextResponse.json(
      { error: e?.message || "List error" },
      { status: 500 }
    );
  }
}
