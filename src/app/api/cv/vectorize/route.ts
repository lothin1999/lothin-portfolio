import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";

export const runtime = "edge";

function getCredentials() {
  const clean = (val?: string) => val ? val.replace(/['"]/g, "") : "";
  const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
  return { accountId, apiToken };
}

export async function GET(req: NextRequest) {
  const ip = req.ip || req.headers.get("cf-connecting-ip") || "127.0.0.1";

  // Rate limit check
  const { limited, retryAfter } = isRateLimited(ip, {
    intervalMs: 60 * 1000,
    maxRequests: 30,
    limitName: "list_vectorize",
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

  const { accountId, apiToken } = getCredentials();

  // If no credentials, return mock data fallback
  if (!accountId || !apiToken) {
    return NextResponse.json({
      success: true,
      live: false,
      indexes: [
        {
          name: "portfolio-embeddings-v1",
          description: "Used for semantic search across portfolio articles and CV contents.",
          config: {
            dimensions: 1536,
            metric: "cosine",
          },
          created_on: "2026-06-15T12:00:00Z",
          modified_on: "2026-06-15T12:00:00Z",
          stats: {
            count: 1420,
          },
        },
        {
          name: "recommendation-index-v2",
          description: "Real-time user reading recommendation suggestions and similarity matching.",
          config: {
            dimensions: 384,
            metric: "cosine",
          },
          created_on: "2026-06-15T14:30:00Z",
          modified_on: "2026-06-15T14:30:00Z",
          stats: {
            count: 8400,
          },
        },
        {
          name: "face-recognition-embeddings",
          description: "Image feature vectors for secure biometric verification and user authentication.",
          config: {
            dimensions: 128,
            metric: "euclidean",
          },
          created_on: "2026-06-16T08:15:00Z",
          modified_on: "2026-06-16T08:15:00Z",
          stats: {
            count: 520,
          },
        },
        {
          name: "voice-transcribe-vectors",
          description: "Audio feature models for speech transcription and classification task bindings.",
          config: {
            dimensions: 768,
            metric: "dot-product",
          },
          created_on: "2026-06-16T10:00:00Z",
          modified_on: "2026-06-16T10:00:00Z",
          stats: {
            count: 2310,
          },
        },
      ],
      usage: {
        requests: 12480,
        p95_latency: "15 ms",
        total_vectors: 12650,
        billable_usage: "$0.00",
      },
    });
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/vectorize/v2/indexes`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `Cloudflare API error: ${text}` }, { status: response.status });
    }

    const json = (await response.json()) as any;
    if (!json.success) {
      return NextResponse.json({ error: json.errors }, { status: 400 });
    }

    const indexes = json.result || [];
    let totalVectors = 0;

    // Fetch stats for each index concurrently
    const indexesWithStats = await Promise.all(
      indexes.map(async (idx: any) => {
        try {
          const statsUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/vectorize/v2/indexes/${idx.name}/stats`;
          const statsRes = await fetch(statsUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          });
          if (statsRes.ok) {
            const statsJson = (await statsRes.json()) as any;
            if (statsJson.success && statsJson.result) {
              totalVectors += statsJson.result.count || 0;
              return {
                ...idx,
                stats: statsJson.result,
              };
            }
          }
        } catch (err) {
          console.error(`Error fetching stats for Vectorize index ${idx.name}:`, err);
        }
        return idx;
      })
    );

    return NextResponse.json({
      success: true,
      live: true,
      indexes: indexesWithStats,
      usage: {
        requests: 0,
        p95_latency: "0 ms",
        total_vectors: totalVectors,
        billable_usage: "$0.00",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to list Vectorize indexes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId, apiToken } = getCredentials();

  try {
    const body = await req.json();
    const { name, description, config } = body;

    if (!name || !config || !config.dimensions || !config.metric) {
      return NextResponse.json({ error: "Missing required fields (name, config.dimensions, config.metric)" }, { status: 400 });
    }

    // In mock mode, simply return success
    if (!accountId || !apiToken) {
      return NextResponse.json({
        success: true,
        live: false,
        result: {
          name,
          description: description || "",
          config,
          created_on: new Date().toISOString(),
          modified_on: new Date().toISOString(),
          stats: { count: 0 },
        },
      });
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/vectorize/v2/indexes`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description: description || "",
        config: {
          dimensions: Number(config.dimensions),
          metric: config.metric,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `Cloudflare API error: ${text}` }, { status: response.status });
    }

    const json = (await response.json()) as any;
    if (!json.success) {
      return NextResponse.json({ error: json.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, live: true, result: json.result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create index" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId, apiToken } = getCredentials();

  try {
    const urlParams = new URL(req.url).searchParams;
    const name = urlParams.get("name");

    if (!name) {
      return NextResponse.json({ error: "Missing required query parameter: name" }, { status: 400 });
    }

    // In mock mode, simply return success
    if (!accountId || !apiToken) {
      return NextResponse.json({ success: true, live: false });
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/vectorize/v2/indexes/${name}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `Cloudflare API error: ${text}` }, { status: response.status });
    }

    const json = (await response.json()) as any;
    if (!json.success) {
      return NextResponse.json({ error: json.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, live: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete index" }, { status: 500 });
  }
}
