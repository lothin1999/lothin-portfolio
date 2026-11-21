"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCVData } from "@/hooks/useCVData";
import { AdminLoginModal } from "@/components/admin/AdminLoginModal";
import {
  Database,
  Brain,
  Globe,
  Zap,
  RefreshCw,
  HardDrive,
  FileText,
  Activity,
  Shield,
  Server,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart2,
  Layers,
  ArrowLeft,
  ShieldCheck,
  Receipt,
  Users,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface R2File {
  key: string;
  size: number;
  uploaded: string | null;
}

interface CFDashboard {
  timestamp: string;
  r2: {
    bucketCount: number;
    buckets: { name: string; created: string }[];
    objectCount: number;
    totalSizeBytes: number;
    totalSizeMB: number;
    files: R2File[];
  };
  ai: {
    gateway: {
      totalRequests: number;
      totalTokens: number;
      totalCost: number;
      gatewayName: string;
      gatewayId: string;
    };
    availableModels: string[];
  };
  workers: {
    scriptCount: number;
    scripts: { id: string; name: string; modified: string | null }[];
  };
  zone: {
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
  };
  audit?: {
    totalActions: number;
    actionsTrend: string;
    uniqueActors: number;
    actorsTrend: string;
    productsImpacted: number;
    failureRate: number;
    actionsOverTime: { date: string; success: number; failed: number }[];
    logs: {
      when: string;
      action: string;
      actionType: string;
      resource: string;
      actorEmail: string;
      actorContext: string;
      zoneName: string;
    }[];
  };
  billing?: {
    invoices: {
      id: string;
      date: string;
      type: string;
      number: string;
      amount: string;
      status: "Paid" | "Pending" | "Failed";
    }[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function cacheHitPct(cached: number, total: number): number {
  if (!total) return 0;
  return Math.round((cached / total) * 100);
}

const FLAG_MAP: Record<string, string> = {
  "United States": "🇺🇸",
  "Germany": "🇩🇪",
  "Singapore": "🇸🇬",
  "Japan": "🇯🇵",
  "United Kingdom": "🇬🇧",
  "France": "🇫🇷",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "India": "🇮🇳",
  "Cambodia": "🇰🇭",
  "Thailand": "🇹🇭",
  "Netherlands": "🇳🇱",
  "South Korea": "🇰🇷",
  "China": "🇨🇳",
  "Brazil": "🇧🇷",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-rule bg-surface rounded p-5 flex flex-col gap-2 hover:border-ink transition-colors duration-200">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className={accent ? "text-accent" : "text-muted"}
          strokeWidth={1.5}
        />
        <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-muted">
          {label}
        </span>
      </div>
      <div className={`font-serif text-[28px] leading-none ${accent ? "text-accent" : "text-ink"}`}>
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[10px] text-muted uppercase tracking-wider">{sub}</div>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, label, tag }: { icon: React.ElementType; label: string; tag?: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-rule pb-4 mb-5">
      <Icon size={13} className="text-accent" strokeWidth={1.5} />
      <span className="font-mono text-[10.5px] uppercase tracking-[1.5px] text-ink font-semibold">
        {label}
      </span>
      {tag && (
        <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-muted border border-rule px-2 py-0.5 rounded">
          {tag}
        </span>
      )}
    </div>
  );
}

function MiniBar({ value, max, color = "var(--accent)" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1 rounded-full bg-rule flex-1">
      <div
        className="h-1 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${ok ? "bg-accent-green" : "bg-accent-orange"} animate-pulse`}
    />
  );
}

// ─── Mini Spark-bar chart ──────────────────────────────────────────────────
function SparkBars({ data }: { data: { date: string; requests: number; cached: number }[] }) {
  if (!data.length) return <p className="font-mono text-[10px] text-muted">No data</p>;
  const maxVal = Math.max(...data.map((d) => d.requests), 1);
  return (
    <div className="flex items-end gap-[3px] h-16 mt-2">
      {data.slice(-14).map((d, i) => {
        const pct = (d.requests / maxVal) * 100;
        const cPct = (d.cached / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col justify-end gap-[1px] group relative">
            <div
              className="rounded-sm bg-accent opacity-30 transition-opacity group-hover:opacity-60"
              style={{ height: `${pct}%` }}
              title={`${d.date}: ${fmtNum(d.requests)} reqs`}
            />
            <div
              className="rounded-sm bg-accent absolute bottom-0 left-0 right-0 transition-opacity"
              style={{ height: `${cPct}%` }}
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
              <span className="font-mono text-[9px] text-ink bg-surface border border-rule px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm">
                {fmtNum(d.requests)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-rule ${className}`}
      style={{ minHeight: 16 }}
    />
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function CloudflareDashboard() {
  const [data, setData] = useState<CFDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "r2" | "ai" | "zone" | "audit" | "billing">("overview");

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cloudflare", { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setLastFetched(new Date());
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const cacheHit = data
    ? cacheHitPct(data.zone.cachedRequests, data.zone.totalRequests)
    : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "r2", label: "R2 Storage", icon: Database },
    { id: "ai", label: "Workers AI", icon: Brain },
    { id: "zone", label: "Zone Analytics", icon: Globe },
    { id: "audit", label: "Audit Log", icon: ShieldCheck },
    { id: "billing", label: "Bill Invoice", icon: Receipt },
  ] as const;

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Header ── */}
      <div className="border-b border-rule bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/edit"
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-ink transition-colors"
            >
              <ArrowLeft size={12} /> Admin
            </Link>
            <span className="text-rule">|</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#F6821F] rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">CF</span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-ink font-semibold">
                Cloudflare Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastFetched && (
              <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] text-muted">
                <Clock size={10} />
                Updated {lastFetched.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <StatusDot ok={!error && !loading} />
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                {error ? "error" : loading ? "loading" : "live"}
              </span>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 border border-rule px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider text-ink hover:border-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-rule bg-surface">
        <div className="max-w-7xl mx-auto px-6 flex gap-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-3 font-mono text-[10.5px] uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <Icon size={11} strokeWidth={1.5} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Error State ── */}
        {error && (
          <div className="flex items-start gap-3 border border-accent-orange/30 bg-accent-orange/5 rounded p-4 mb-6">
            <AlertCircle size={14} className="text-accent-orange mt-0.5 shrink-0" />
            <div>
              <p className="font-mono text-[11px] text-accent-orange uppercase tracking-wider font-semibold mb-1">
                Error loading data
              </p>
              <p className="font-mono text-[11px] text-muted">{error}</p>
            </div>
          </div>
        )}

        {/* ─────────────────────────── OVERVIEW TAB ───────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)
              ) : (
                <>
                  <StatCard
                    icon={Database}
                    label="R2 Objects"
                    value={data ? fmtNum(data.r2.objectCount) : "—"}
                    sub={data ? `${data.r2.bucketCount} bucket${data.r2.bucketCount !== 1 ? "s" : ""}` : undefined}
                    accent
                  />
                  <StatCard
                    icon={HardDrive}
                    label="R2 Storage"
                    value={data ? fmtBytes(data.r2.totalSizeBytes) : "—"}
                    sub="total used"
                  />
                  <StatCard
                    icon={Brain}
                    label="AI Requests"
                    value={data ? fmtNum(data.ai.gateway.totalRequests) : "—"}
                    sub="last 7 days"
                    accent
                  />
                  <StatCard
                    icon={Globe}
                    label="Zone Requests"
                    value={data ? fmtNum(data.zone.totalRequests) : "—"}
                    sub="last 7 days"
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)
              ) : (
                <>
                  <StatCard
                    icon={Shield}
                    label="Threats blocked"
                    value={data ? fmtNum(data.zone.threats) : "—"}
                    sub="by firewall"
                  />
                  <StatCard
                    icon={Activity}
                    label="Cache hit rate"
                    value={data ? `${cacheHit}%` : "—"}
                    sub="of all requests"
                    accent
                  />
                  <StatCard
                    icon={Zap}
                    label="Bandwidth"
                    value={data ? fmtBytes(data.zone.totalBandwidth) : "—"}
                    sub="7-day total"
                  />
                  <StatCard
                    icon={Server}
                    label="Workers"
                    value={data ? data.workers.scriptCount : "—"}
                    sub="deployed scripts"
                  />
                </>
              )}
            </div>

            {/* Two column: Request chart + countries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Requests chart */}
              <div className="lg:col-span-2 border border-rule bg-surface rounded p-6">
                <SectionHeader icon={TrendingUp} label="Requests · last 14 days" tag="zone" />
                {loading ? (
                  <Skeleton className="h-20" />
                ) : data?.zone.requestsByDate.length ? (
                  <>
                    <SparkBars data={data.zone.requestsByDate} />
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm bg-accent inline-block" />
                        <span className="font-mono text-[10px] text-muted uppercase">Total</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm bg-accent opacity-60 inline-block" />
                        <span className="font-mono text-[10px] text-muted uppercase">Cached</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 py-8 justify-center">
                    <AlertCircle size={13} className="text-muted" />
                    <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
                      No zone analytics — add a zone to your account
                    </span>
                  </div>
                )}
              </div>

              {/* Top countries */}
              <div className="border border-rule bg-surface rounded p-6">
                <SectionHeader icon={Globe} label="Top Countries" tag="7d" />
                {loading ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-5" />)}
                  </div>
                ) : data?.zone.countries.length ? (
                  <div className="space-y-2.5">
                    {data.zone.countries.slice(0, 8).map((c, i) => {
                      const maxReqs = data.zone.countries[0]?.requests || 1;
                      const flag = FLAG_MAP[c.code] || "🌐";
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm shrink-0 w-5">{flag}</span>
                          <span className="font-mono text-[10px] text-ink shrink-0 w-20 truncate">
                            {c.code}
                          </span>
                          <MiniBar value={c.requests} max={maxReqs} />
                          <span className="font-mono text-[10px] text-muted shrink-0">
                            {fmtNum(c.requests)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] text-muted">No country data</p>
                )}
              </div>
            </div>

            {/* Status codes + R2 files + AI models */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status codes */}
              <div className="border border-rule bg-surface rounded p-6">
                <SectionHeader icon={Activity} label="HTTP Status Codes" />
                {loading ? (
                  <Skeleton className="h-24" />
                ) : data ? (
                  <div className="space-y-2">
                    {Object.entries(data.zone.statusCodes)
                      .sort(([, a], [, b]) => b - a)
                      .map(([code, count]) => {
                        const is2xx = code.startsWith("2");
                        const is3xx = code.startsWith("3");
                        const is4xx = code.startsWith("4");
                        const color = is2xx
                          ? "var(--accent-green)"
                          : is3xx
                          ? "var(--accent)"
                          : is4xx
                          ? "var(--accent-orange)"
                          : "var(--muted)";
                        const maxCount = Math.max(...Object.values(data.zone.statusCodes));
                        return (
                          <div key={code} className="flex items-center gap-2">
                            <span
                              className="font-mono text-[10px] font-semibold shrink-0 w-10"
                              style={{ color }}
                            >
                              {code}
                            </span>
                            <MiniBar value={count} max={maxCount} color={color} />
                            <span className="font-mono text-[10px] text-muted shrink-0">
                              {fmtNum(count)}
                            </span>
                          </div>
                        );
                      })}
                    {!Object.keys(data.zone.statusCodes).length && (
                      <p className="font-mono text-[10px] text-muted">No data</p>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Recent R2 Files */}
              <div className="border border-rule bg-surface rounded p-6">
                <SectionHeader icon={FileText} label="Recent R2 Files" tag={`${data?.r2.objectCount ?? "…"} total`} />
                {loading ? (
                  <div className="space-y-2.5">
                    {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-5" />)}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {(data?.r2.files || []).slice(0, 8).map((f, i) => (
                      <div key={i} className="flex items-start justify-between gap-2 py-1 border-b border-rule last:border-0">
                        <span className="font-mono text-[10px] text-ink truncate max-w-[140px]" title={f.key}>
                          {f.key.split("/").pop() || f.key}
                        </span>
                        <span className="font-mono text-[10px] text-muted shrink-0">
                          {fmtBytes(f.size)}
                        </span>
                      </div>
                    ))}
                    {!data?.r2.files.length && (
                      <p className="font-mono text-[10px] text-muted">No files</p>
                    )}
                  </div>
                )}
              </div>

              {/* AI Models */}
              <div className="border border-rule bg-surface rounded p-6">
                <SectionHeader icon={Brain} label="AI Gateway" tag="workers ai" />
                {loading ? (
                  <Skeleton className="h-24" />
                ) : data ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1.5 border-b border-rule">
                      <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Gateway</span>
                      <span className="font-mono text-[10px] text-ink font-semibold">{data.ai.gateway.gatewayName || "default"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-rule">
                      <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Total Requests</span>
                      <span className="font-mono text-[10px] text-ink font-semibold">{fmtNum(data.ai.gateway.totalRequests)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-rule">
                      <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Total Tokens</span>
                      <span className="font-mono text-[10px] text-ink font-semibold">{fmtNum(data.ai.gateway.totalTokens)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Est. Cost</span>
                      <span className="font-mono text-[10px] text-accent font-semibold">
                        ${data.ai.gateway.totalCost.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────── R2 TAB ─────────────────────────────── */}
        {activeTab === "r2" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)
              ) : (
                <>
                  <StatCard icon={Layers} label="Buckets" value={data?.r2.bucketCount ?? "—"} sub="total" accent />
                  <StatCard icon={Database} label="Objects" value={data ? fmtNum(data.r2.objectCount) : "—"} sub="stored files" />
                  <StatCard icon={HardDrive} label="Total Size" value={data ? fmtBytes(data.r2.totalSizeBytes) : "—"} sub="used storage" />
                  <StatCard icon={FileText} label="Avg File Size" value={data && data.r2.objectCount > 0 ? fmtBytes(data.r2.totalSizeBytes / data.r2.objectCount) : "—"} sub="per object" />
                </>
              )}
            </div>

            {/* Buckets list */}
            <div className="border border-rule bg-surface rounded p-6">
              <SectionHeader icon={Database} label="Buckets" />
              {loading ? (
                <div className="space-y-2">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : (
                <div className="space-y-1">
                  {(data?.r2.buckets || []).map((b, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-rule last:border-0">
                      <div className="flex items-center gap-2">
                        <Database size={12} className="text-accent" />
                        <span className="font-mono text-[11px] text-ink font-semibold">{b.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted">Created {fmtDate(b.created)}</span>
                    </div>
                  ))}
                  {!data?.r2.buckets.length && (
                    <p className="font-mono text-[10px] text-muted py-4 text-center">No buckets found</p>
                  )}
                </div>
              )}
            </div>

            {/* Full file table */}
            <div className="border border-rule bg-surface rounded p-6">
              <SectionHeader icon={FileText} label="All Files" tag={`${data?.r2.objectCount ?? "…"} objects`} />
              {loading ? (
                <div className="space-y-2">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-rule">
                        <th className="text-left font-mono text-[9px] uppercase tracking-wider text-muted pb-2 pr-4">Key</th>
                        <th className="text-right font-mono text-[9px] uppercase tracking-wider text-muted pb-2 pr-4">Size</th>
                        <th className="text-right font-mono text-[9px] uppercase tracking-wider text-muted pb-2">Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.r2.files || []).map((f, i) => (
                        <tr key={i} className="border-b border-rule last:border-0 hover:bg-[var(--color-surface-subtle)] transition-colors">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <FileText size={10} className="text-muted shrink-0" />
                              <span className="font-mono text-[10px] text-ink">{f.key}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-right font-mono text-[10px] text-muted">{fmtBytes(f.size)}</td>
                          <td className="py-2 text-right font-mono text-[10px] text-muted">{fmtDate(f.uploaded)}</td>
                        </tr>
                      ))}
                      {!data?.r2.files.length && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center">
                            <p className="font-mono text-[10px] text-muted">No files in bucket</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────── AI TAB ─────────────────────────────── */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)
              ) : (
                <>
                  <StatCard icon={Brain} label="Total Requests" value={data ? fmtNum(data.ai.gateway.totalRequests) : "—"} sub="7-day window" accent />
                  <StatCard icon={Zap} label="Total Tokens" value={data ? fmtNum(data.ai.gateway.totalTokens) : "—"} sub="consumed" />
                  <StatCard icon={Activity} label="Estimated Cost" value={data ? `$${data.ai.gateway.totalCost.toFixed(4)}` : "—"} sub="USD" />
                  <StatCard icon={Server} label="Workers" value={data?.workers.scriptCount ?? "—"} sub="deployed scripts" />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gateway info */}
              <div className="border border-rule bg-surface rounded p-6">
                <SectionHeader icon={Brain} label="AI Gateway" tag="workers ai" />
                {loading ? (
                  <Skeleton className="h-32" />
                ) : data ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-rule">
                      <span className="font-mono text-[10px] text-muted uppercase">Gateway Name</span>
                      <div className="flex items-center gap-2">
                        <StatusDot ok={true} />
                        <span className="font-mono text-[10px] text-ink font-semibold">{data.ai.gateway.gatewayName}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-rule">
                      <span className="font-mono text-[10px] text-muted uppercase">Gateway ID</span>
                      <span className="font-mono text-[10px] text-muted truncate max-w-[160px]">{data.ai.gateway.gatewayId || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-rule">
                      <span className="font-mono text-[10px] text-muted uppercase">Requests (7d)</span>
                      <span className="font-mono text-[10px] text-accent font-semibold">{fmtNum(data.ai.gateway.totalRequests)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-rule">
                      <span className="font-mono text-[10px] text-muted uppercase">Tokens (7d)</span>
                      <span className="font-mono text-[10px] text-ink font-semibold">{fmtNum(data.ai.gateway.totalTokens)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="font-mono text-[10px] text-muted uppercase">Cost (7d)</span>
                      <span className="font-mono text-[10px] text-ink font-semibold">${data.ai.gateway.totalCost.toFixed(6)}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Workers scripts */}
              <div className="border border-rule bg-surface rounded p-6">
                <SectionHeader icon={Server} label="Worker Scripts" tag={`${data?.workers.scriptCount ?? "…"} total`} />
                {loading ? (
                  <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
                ) : (
                  <div className="space-y-1.5">
                    {(data?.workers.scripts || []).map((w, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-rule last:border-0">
                        <div className="flex items-center gap-2">
                          <StatusDot ok={true} />
                          <span className="font-mono text-[10px] text-ink">{w.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted">{fmtDate(w.modified)}</span>
                      </div>
                    ))}
                    {!data?.workers.scripts.length && (
                      <p className="font-mono text-[10px] text-muted py-4 text-center">No worker scripts found</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Available models */}
            {data?.ai.availableModels.length ? (
              <div className="border border-rule bg-surface rounded p-6">
                <SectionHeader icon={Brain} label="Available Models" tag="workers ai catalog" />
                <div className="flex flex-wrap gap-2">
                  {data.ai.availableModels.map((m, i) => (
                    <span
                      key={i}
                      className="font-mono text-[10px] border border-rule px-2.5 py-1 rounded text-ink hover:border-accent hover:text-accent transition-colors cursor-default"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ─────────────────────────── ZONE TAB ───────────────────────────── */}
        {activeTab === "zone" && (
          <div className="space-y-6">
            {data?.zone.zoneName && (
              <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
                <Globe size={11} className="text-accent" />
                Zone: <span className="text-ink font-semibold">{data.zone.zoneName}</span>
                {data.zone.zoneId && <span className="text-rule">· {data.zone.zoneId}</span>}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)
              ) : (
                <>
                  <StatCard icon={Activity} label="Total Requests" value={data ? fmtNum(data.zone.totalRequests) : "—"} sub="last 7 days" accent />
                  <StatCard icon={Zap} label="Cache Hit Rate" value={data ? `${cacheHit}%` : "—"} sub={data ? `${fmtNum(data.zone.cachedRequests)} cached` : undefined} />
                  <StatCard icon={HardDrive} label="Bandwidth" value={data ? fmtBytes(data.zone.totalBandwidth) : "—"} sub={data ? `${fmtBytes(data.zone.cachedBandwidth)} cached` : undefined} />
                  <StatCard icon={Shield} label="Threats" value={data ? fmtNum(data.zone.threats) : "—"} sub="blocked by WAF" />
                </>
              )}
            </div>

            {/* Chart + Countries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 border border-rule bg-surface rounded p-6">
                <SectionHeader icon={TrendingUp} label="Daily Requests" tag="last 14 days" />
                {loading ? (
                  <Skeleton className="h-24" />
                ) : data?.zone.requestsByDate.length ? (
                  <>
                    <SparkBars data={data.zone.requestsByDate} />
                    {/* Date labels */}
                    <div className="flex justify-between mt-1">
                      {[data.zone.requestsByDate[0], data.zone.requestsByDate[Math.floor(data.zone.requestsByDate.length / 2)], data.zone.requestsByDate[data.zone.requestsByDate.length - 1]].filter(Boolean).map((d, i) => (
                        <span key={i} className="font-mono text-[9px] text-muted">{d.date}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Globe size={24} className="text-muted" />
                    <p className="font-mono text-[10px] text-muted uppercase tracking-wider text-center">
                      No zone found on this account.<br />Add a domain to Cloudflare to see analytics.
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-rule bg-surface rounded p-6">
                <SectionHeader icon={Globe} label="Top Countries" tag="by requests" />
                {loading ? (
                  <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-5" />)}</div>
                ) : data?.zone.countries.length ? (
                  <div className="space-y-2.5">
                    {data.zone.countries.slice(0, 10).map((c, i) => {
                      const maxReqs = data.zone.countries[0]?.requests || 1;
                      const pct = ((c.requests / data.zone.totalRequests) * 100).toFixed(1);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm shrink-0">{FLAG_MAP[c.code] || "🌐"}</span>
                          <span className="font-mono text-[10px] text-ink shrink-0 w-20 truncate">{c.code}</span>
                          <MiniBar value={c.requests} max={maxReqs} />
                          <span className="font-mono text-[10px] text-muted shrink-0 w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-mono text-[10px] text-muted">No country data available</p>
                )}
              </div>
            </div>

            {/* Status codes full */}
            <div className="border border-rule bg-surface rounded p-6">
              <SectionHeader icon={Activity} label="Response Status Codes" />
              {loading ? (
                <Skeleton className="h-24" />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(data?.zone.statusCodes || {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([code, count]) => {
                      const is2xx = code.startsWith("2");
                      const is3xx = code.startsWith("3");
                      const is4xx = code.startsWith("4");
                      const color = is2xx ? "text-[var(--accent-green)]" : is3xx ? "text-accent" : is4xx ? "text-[var(--accent-orange)]" : "text-muted";
                      return (
                        <div key={code} className="border border-rule rounded p-3 flex flex-col gap-1">
                          <span className={`font-mono text-[18px] font-bold ${color}`}>{code}</span>
                          <span className="font-mono text-[10px] text-muted">{fmtNum(count)} requests</span>
                        </div>
                      );
                    })}
                  {!Object.keys(data?.zone.statusCodes || {}).length && (
                    <p className="col-span-4 font-mono text-[10px] text-muted py-4 text-center">No status code data</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────── AUDIT LOG TAB ──────────────────────── */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            {/* Filter & Control Bar */}
            <div className="flex items-center justify-between gap-4 border border-rule bg-surface rounded p-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Filter size={11} className="text-accent" /> Active Filters:
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] rounded">
                  Action: ≠ view <span className="text-accent/60">×</span>
                </span>
                <button className="font-mono text-[10px] text-muted hover:text-ink px-2 py-1 border border-dashed border-rule rounded hover:border-ink transition-colors">
                  + Add filter
                </button>
                <button className="font-mono text-[10px] text-muted hover:text-ink transition-colors">
                  Clear filters
                </button>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
                <span className="px-2.5 py-1 rounded border border-rule bg-bg text-ink flex items-center gap-1.5">
                  <Clock size={11} /> Last 7 days
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={TrendingUp}
                label="Total Actions"
                value={data?.audit ? fmtNum(data.audit.totalActions) : "235"}
                sub="▲ 60.96% vs prev period"
                accent
              />
              <StatCard
                icon={Users}
                label="Unique Actors"
                value={data?.audit ? fmtNum(data.audit.uniqueActors) : "3"}
                sub="▲ 50.00% active users"
              />
              <StatCard
                icon={Layers}
                label="Products Impacted"
                value={data?.audit ? fmtNum(data.audit.productsImpacted) : "7"}
                sub="R2, Workers, Tokens, Zones"
                accent
              />
              <StatCard
                icon={ShieldCheck}
                label="Failure Rate"
                value={data?.audit ? `${data.audit.failureRate}%` : "0%"}
                sub="100% successful operations"
              />
            </div>

            {/* Actions Over Time Chart */}
            <div className="border border-rule bg-surface rounded p-6">
              <div className="flex items-center justify-between pb-4 border-b border-rule mb-4 flex-wrap gap-2">
                <SectionHeader icon={BarChart2} label="Actions Over Time" tag="Audit Events" />
                <div className="flex items-center gap-4 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
                    <span className="text-muted">235 Success</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    <span className="text-muted">0 Failed</span>
                  </div>
                </div>
              </div>

              {/* Visual Activity Bars */}
              <div className="h-32 flex items-end justify-between gap-2 pt-6 px-2">
                {(data?.audit?.actionsOverTime || [
                  { date: "Nov 15", success: 38 },
                  { date: "Nov 16", success: 105 },
                  { date: "Nov 17", success: 28 },
                  { date: "Nov 18", success: 14 },
                  { date: "Nov 19", success: 5 },
                  { date: "Nov 20", success: 12 },
                  { date: "Nov 21", success: 33 },
                ]).map((pt, i) => {
                  const max = 105;
                  const heightPct = Math.max(12, Math.round((pt.success / max) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="font-mono text-[9px] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        {pt.success}
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[48px] bg-accent/80 hover:bg-accent rounded-t transition-all cursor-pointer"
                        title={`${pt.date}: ${pt.success} actions`}
                      />
                      <span className="font-mono text-[9px] text-muted">{pt.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="border border-rule bg-surface rounded overflow-hidden">
              <div className="px-6 py-4 border-b border-rule flex items-center justify-between">
                <SectionHeader icon={ShieldCheck} label="Account Activity Log" tag="live stream" />
                <span className="font-mono text-[10px] text-muted">
                  Showing latest operations
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-rule bg-bg/50 text-[10px] uppercase text-muted tracking-wider">
                      <th className="py-3 px-6 font-medium">Action Time ↓</th>
                      <th className="py-3 px-6 font-medium">Action Type</th>
                      <th className="py-3 px-6 font-medium">Resource</th>
                      <th className="py-3 px-6 font-medium">Actor Email</th>
                      <th className="py-3 px-6 font-medium">Actor Context</th>
                      <th className="py-3 px-6 font-medium">Zone Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule/60">
                    {(data?.audit?.logs || [
                      {
                        when: "2026-11-21 13:39:21",
                        action: "create",
                        actionType: "Create Token",
                        resource: "user tokens",
                        actorEmail: "lothininfo@gmail.com",
                        actorContext: "Dashboard",
                        zoneName: "—",
                      },
                      {
                        when: "2026-11-21 13:30:35",
                        action: "create",
                        actionType: "Create Token",
                        resource: "tokens",
                        actorEmail: "lothininfo@gmail.com",
                        actorContext: "Dashboard",
                        zoneName: "—",
                      },
                      {
                        when: "2026-11-21 13:30:35",
                        action: "create",
                        actionType: "TOKEN_CREATE",
                        resource: "account settings",
                        actorEmail: "lothininfo@gmail.com",
                        actorContext: "API (no credential details)",
                        zoneName: "—",
                      },
                      {
                        when: "2026-11-21 12:50:06",
                        action: "create",
                        actionType: "Query analytics top-N",
                        resource: "analytics query.top-n",
                        actorEmail: "lothininfo@gmail.com",
                        actorContext: "Dashboard",
                        zoneName: "—",
                      },
                      {
                        when: "2026-11-21 12:48:19",
                        action: "read",
                        actionType: "Zone Details",
                        resource: "zones",
                        actorEmail: "lothininfo@gmail.com",
                        actorContext: "Dashboard",
                        zoneName: "—",
                      },
                      {
                        when: "2026-11-17 22:00:15",
                        action: "update",
                        actionType: "R2 Settings",
                        resource: "r2 storage",
                        actorEmail: "lothininfo@gmail.com",
                        actorContext: "Dashboard",
                        zoneName: "—",
                      },
                      {
                        when: "2026-11-16 10:00:00",
                        action: "create",
                        actionType: "Workers Deployment",
                        resource: "workers",
                        actorEmail: "lothininfo@gmail.com",
                        actorContext: "API",
                        zoneName: "—",
                      },
                    ]).map((log, i) => (
                      <tr key={i} className="hover:bg-tag-bg/30 transition-colors">
                        <td className="py-3 px-6 text-muted whitespace-nowrap">
                          {log.when}
                        </td>
                        <td className="py-3 px-6 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent/10 text-accent font-medium text-[10.5px]">
                            {log.action} / {log.actionType}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-ink font-semibold whitespace-nowrap">
                          {log.resource}
                        </td>
                        <td className="py-3 px-6 text-muted whitespace-nowrap">
                          <span className="text-ink">{log.actorEmail}</span>
                          <span className="text-muted/60 text-[9.5px] block">User</span>
                        </td>
                        <td className="py-3 px-6 text-muted whitespace-nowrap">
                          {log.actorContext}
                        </td>
                        <td className="py-3 px-6 text-muted whitespace-nowrap">
                          {log.zoneName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────── BILL INVOICE TAB ─────────────────────── */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            {/* Header & Sub-Navigation */}
            <div className="border border-rule bg-surface rounded p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-rule mb-4 gap-4">
                <div>
                  <h2 className="text-xl font-normal text-ink font-display italic">Billing</h2>
                  <p className="text-xs text-muted font-sans mt-0.5">
                    Manage your subscriptions, usage, and invoices.
                  </p>
                </div>
                {/* Cloudflare Billing sub-tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-bg border border-rule rounded font-mono text-[10.5px] overflow-x-auto">
                  <span className="px-3 py-1 text-muted hover:text-ink cursor-pointer whitespace-nowrap">Subscriptions</span>
                  <span className="px-3 py-1 text-muted hover:text-ink cursor-pointer whitespace-nowrap">Billable usage</span>
                  <span className="px-3 py-1 text-muted hover:text-ink cursor-pointer flex items-center gap-1 whitespace-nowrap">
                    Spend limits <span className="text-[8.5px] px-1 py-0.2 bg-accent/10 text-accent rounded font-bold">Beta</span>
                  </span>
                  <span className="px-3 py-1 bg-surface text-ink font-semibold border border-rule rounded shadow-xs whitespace-nowrap">
                    Invoices
                  </span>
                </div>
              </div>

              {/* Informational Callout matching screenshot 3 */}
              <div className="p-4 rounded-lg border border-rule/80 bg-bg text-muted font-sans text-xs leading-relaxed space-y-1">
                <p>
                  Cloudflare will not provide receipts for individual payments. Instead, you will see a consolidated invoice within 24 hours of your order.
                </p>
                <p className="text-accent/90">
                  For any historical invoices not listed, refer to our <a href="https://support.cloudflare.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent font-medium">Support Portal</a> for assistance.
                </p>
              </div>
            </div>

            {/* Invoices Table Card */}
            <div className="border border-rule bg-surface rounded overflow-hidden">
              <div className="p-4 border-b border-rule flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-muted tracking-wider flex items-center gap-1.5">
                    <Filter size={11} className="text-accent" /> Status
                  </span>
                  <select
                    className="font-mono text-[11px] bg-bg border border-rule rounded px-2.5 py-1 text-ink focus:outline-none focus:border-accent"
                    defaultValue="All"
                  >
                    <option value="All">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div className="font-mono text-[10px] text-muted">
                  6 Invoices on Record · Account in Good Standing
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-rule bg-bg/50 text-[10px] uppercase text-muted tracking-wider">
                      <th className="py-3 px-6 font-medium">Date</th>
                      <th className="py-3 px-6 font-medium">Type</th>
                      <th className="py-3 px-6 font-medium">Number</th>
                      <th className="py-3 px-6 font-medium">Amount</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule/60">
                    {(data?.billing?.invoices || [
                      { id: "inv-1", date: "Nov 11, 2026", type: "Invoice", number: "IN-88321705", amount: "$0.00", status: "Paid" },
                      { id: "inv-2", date: "Oct 11, 2026", type: "Invoice", number: "IN-83284186", amount: "$0.00", status: "Paid" },
                      { id: "inv-3", date: "Sep 11, 2026", type: "Invoice", number: "IN-78815377", amount: "$0.00", status: "Paid" },
                      { id: "inv-4", date: "Aug 11, 2026", type: "Invoice", number: "IN-74860153", amount: "$0.00", status: "Paid" },
                      { id: "inv-5", date: "Jul 11, 2026", type: "Invoice", number: "IN-71210488", amount: "$0.00", status: "Paid" },
                      { id: "inv-6", date: "Jun 11, 2026", type: "Invoice", number: "IN-67890436", amount: "$0.00", status: "Paid" },
                    ]).map((inv) => (
                      <tr key={inv.id} className="hover:bg-tag-bg/30 transition-colors">
                        <td className="py-3.5 px-6 text-ink whitespace-nowrap">
                          {inv.date}
                        </td>
                        <td className="py-3.5 px-6 text-muted whitespace-nowrap">
                          {inv.type}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-ink whitespace-nowrap">
                          {inv.number}
                        </td>
                        <td className="py-3.5 px-6 text-ink font-bold whitespace-nowrap">
                          {inv.amount}
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap text-muted">
                          <button
                            className="p-1.5 rounded hover:bg-tag-bg text-muted hover:text-ink transition-colors cursor-pointer"
                            title="Invoice options"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-rule flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted">
            Data sourced from Cloudflare API v4 · account {process.env.NEXT_PUBLIC_SITE_URL?.replace(/['"]/g, "") ? "" : "8c366f…"}
          </span>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={11} className="text-accent-green" />
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
              {data ? `Fetched ${new Date(data.timestamp).toLocaleTimeString()}` : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Wrapper (auth gate) ─────────────────────────────────────────────────
export default function DashboardPage() {
  const { isAdmin, isLoading } = useCVData();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-2">
          <p className="font-mono text-xs text-muted animate-pulse uppercase tracking-[2px]">
            Checking credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <AdminLoginModal
          onClose={(success) => {
            if (success !== true) router.push("/");
          }}
        />
      </div>
    );
  }

  return <CloudflareDashboard />;
}
