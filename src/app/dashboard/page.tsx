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
  const [activeTab, setActiveTab] = useState<"overview" | "r2" | "ai" | "zone">("overview");

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
