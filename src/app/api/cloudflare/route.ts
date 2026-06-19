import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const clean = (val?: string) => (val ? val.replace(/['"]/g, "") : "");

async function cfApiFetch(path: string, token: string, method = "GET", body?: any) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`CF API error [${res.status}] ${path}:`, text);
    return null;
  }
  return res.json();
}

// GraphQL for zone analytics
async function cfGraphQL(token: string, query: string, variables: Record<string, any>) {
  const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    console.error("CF GraphQL error:", await res.text());
    return null;
  }
  return res.json();
}

export async function GET(req: NextRequest) {
  // Auth check
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
  const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";

  if (!accountId || !apiToken) {
    return NextResponse.json({ error: "Missing Cloudflare credentials" }, { status: 500 });
  }

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];

  // Parallel fetch all Cloudflare data
  const [
    r2BucketsRes,
    r2ObjectsRes,
    aiModelsRes,
    aiGatewayRes,
    workersRes,
    zoneListRes,
  ] = await Promise.all([
    // 1. List R2 buckets
    cfApiFetch(`/accounts/${accountId}/r2/buckets`, apiToken),
    // 2. List objects in the main bucket
    cfApiFetch(`/accounts/${accountId}/r2/buckets/${bucketName}/objects`, apiToken),
    // 3. AI models catalog (limited)
    cfApiFetch(`/accounts/${accountId}/ai/models/search?per_page=5`, apiToken),
    // 4. AI Gateway logs (last 7 days)
    cfApiFetch(`/accounts/${accountId}/ai-gateway/gateways`, apiToken),
    // 5. Workers scripts
    cfApiFetch(`/accounts/${accountId}/workers/scripts`, apiToken),
    // 6. Zones list
    cfApiFetch("/zones", apiToken),
  ]);

  // ─── R2 Stats ────────────────────────────────────────────────
  const r2Buckets = Array.isArray(r2BucketsRes?.result)
    ? r2BucketsRes.result
    : Array.isArray(r2BucketsRes?.result?.buckets)
    ? r2BucketsRes.result.buckets
    : [];
  const r2BucketCount = r2Buckets.length;

  const r2Objects = Array.isArray(r2ObjectsRes?.result)
    ? r2ObjectsRes.result
    : Array.isArray(r2ObjectsRes?.result?.objects)
    ? r2ObjectsRes.result.objects
    : [];
  const r2ObjectCount = r2Objects.length;
  const r2TotalSize = r2Objects.reduce((sum: number, obj: any) => sum + (obj.size || 0), 0);

  // Build file list with metadata
  const r2FileList = r2Objects.map((obj: any) => ({
    key: obj.key,
    size: obj.size || 0,
    uploaded: obj.uploaded || obj.last_modified || null,
  }));

  // ─── Workers AI / Gateway Stats ──────────────────────────────
  let aiGatewayStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    gatewayName: "default",
    gatewayId: "",
  };

  const gateways = Array.isArray(aiGatewayRes?.result)
    ? aiGatewayRes.result
    : Array.isArray(aiGatewayRes?.result?.gateways)
    ? aiGatewayRes.result.gateways
    : [];
  if (gateways.length > 0) {
    const gw = gateways[0];
    aiGatewayStats.gatewayName = gw.name || "default";
    aiGatewayStats.gatewayId = gw.id || "";

    // Fetch gateway analytics via GraphQL
    if (gw.id) {
      const aiGatewayQuery = `
        query AIGatewayAnalytics($accountTag: String!, $since: Date!, $until: Date!) {
          viewer {
            accounts(filter: { accountTag: $accountTag }) {
              aiGatewayRequestsAdaptiveGroups(
                limit: 100
                filter: { date_geq: $since, date_leq: $until }
              ) {
                count
                sum {
                  uncachedTokensIn
                  uncachedTokensOut
                }
              }
            }
          }
        }
      `;
      const gwAnalytics = await cfGraphQL(apiToken, aiGatewayQuery, {
        accountTag: accountId,
        since: sevenDaysAgo,
        until: today,
      });
      const groups = gwAnalytics?.data?.viewer?.accounts?.[0]?.aiGatewayRequestsAdaptiveGroups || [];
      for (const group of groups) {
        aiGatewayStats.totalRequests += group.count || 0;
        aiGatewayStats.totalTokens += (group.sum?.uncachedTokensIn || 0) + (group.sum?.uncachedTokensOut || 0);
      }
      aiGatewayStats.totalCost = +(aiGatewayStats.totalTokens * 0.000002).toFixed(4);
    }
  }

  // ─── Workers Scripts ─────────────────────────────────────────
  const workersScripts = Array.isArray(workersRes?.result)
    ? workersRes.result
    : Array.isArray(workersRes?.result?.scripts)
    ? workersRes.result.scripts
    : [];
  const workersList = workersScripts.map((w: any) => ({
    id: w.id,
    name: w.id,
    modified: w.modified_on || w.created_on || null,
  }));

  // ─── Zone Analytics (if zones exist) ─────────────────────────
  let zoneAnalytics: {
    totalRequests: number;
    cachedRequests: number;
    totalBandwidth: number;
    cachedBandwidth: number;
    threats: number;
    uniqueVisitors: number;
    countries: { code: string; requests: number }[];
    statusCodes: Record<string, number>;
    requestsByDate: { date: string; requests: number; cached: number }[];
    zoneId?: string;
    zoneName?: string;
  } = {
    totalRequests: 0,
    cachedRequests: 0,
    totalBandwidth: 0,
    cachedBandwidth: 0,
    threats: 0,
    uniqueVisitors: 0,
    countries: [],
    statusCodes: {},
    requestsByDate: [],
  };

  const zones = Array.isArray(zoneListRes?.result)
    ? zoneListRes.result
    : Array.isArray(zoneListRes?.result?.zones)
    ? zoneListRes.result.zones
    : [];
  if (zones.length > 0) {
    const zoneId = zones[0].id;
    const zoneName = zones[0].name;

    // GraphQL zone analytics for the last 7 days
    const analyticsQuery = `
      query ZoneAnalytics($zoneTag: String!, $since: Date!, $until: Date!) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequests1dGroups(
              limit: 30
              filter: { date_geq: $since, date_leq: $until }
              orderBy: [date_ASC]
            ) {
              dimensions { date }
              sum {
                requests
                cachedRequests
                bytes
                cachedBytes
                threats
                countryMap { clientCountryName requests }
                responseStatusMap { edgeResponseStatus requests }
              }
              uniq { uniques }
            }
          }
        }
      }
    `;

    const gqlRes = await cfGraphQL(apiToken, analyticsQuery, {
      zoneTag: zoneId,
      since: sevenDaysAgo,
      until: today,
    });

    const zoneGroups = gqlRes?.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];

    const countryMap = new Map<string, number>();
    const statusMap = new Map<string, number>();

    for (const group of zoneGroups) {
      zoneAnalytics.totalRequests += group.sum?.requests || 0;
      zoneAnalytics.cachedRequests += group.sum?.cachedRequests || 0;
      zoneAnalytics.totalBandwidth += group.sum?.bytes || 0;
      zoneAnalytics.cachedBandwidth += group.sum?.cachedBytes || 0;
      zoneAnalytics.threats += group.sum?.threats || 0;
      zoneAnalytics.uniqueVisitors += group.uniq?.uniques || 0;

      zoneAnalytics.requestsByDate.push({
        date: group.dimensions?.date || "",
        requests: group.sum?.requests || 0,
        cached: group.sum?.cachedRequests || 0,
      });

      for (const c of group.sum?.countryMap || []) {
        countryMap.set(c.clientCountryName, (countryMap.get(c.clientCountryName) || 0) + c.requests);
      }
      for (const s of group.sum?.responseStatusMap || []) {
        const code = String(s.edgeResponseStatus);
        statusMap.set(code, (statusMap.get(code) || 0) + s.requests);
      }
    }

    zoneAnalytics.countries = Array.from(countryMap.entries())
      .map(([code, requests]) => ({ code, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    zoneAnalytics.statusCodes = Object.fromEntries(statusMap);
    zoneAnalytics.zoneId = (zoneId as string | undefined);
    zoneAnalytics.zoneName = (zoneName as string | undefined);
  }

  // ─── Build Response ──────────────────────────────────────────
  const dashboard = {
    timestamp: now.toISOString(),
    r2: {
      bucketCount: r2BucketCount,
      buckets: r2Buckets.map((b: any) => ({ name: b.name, created: b.creation_date })),
      objectCount: r2ObjectCount,
      totalSizeBytes: r2TotalSize,
      totalSizeMB: +(r2TotalSize / (1024 * 1024)).toFixed(2),
      files: r2FileList.slice(0, 50), // cap at 50
    },
    ai: {
      gateway: aiGatewayStats,
      availableModels: (aiModelsRes?.result || []).slice(0, 10).map((m: any) => m.name || m.id),
    },
    workers: {
      scriptCount: workersList.length,
      scripts: workersList,
    },
    zone: zoneAnalytics,
  };

  return NextResponse.json(dashboard, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
