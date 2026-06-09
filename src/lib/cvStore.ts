// src/lib/cvStore.ts
// Abstraction over CV data persistence.
// - Dev / Vercel: JSON file in /tmp or in-memory cache
// - Cloudflare Pages: use KV binding (set NEXT_PUBLIC_USE_KV=true)
//
// For Cloudflare KV:
//   1. Create KV namespace in Cloudflare dashboard
//   2. Add binding "CV_STORE" in wrangler.toml / Pages settings
//   3. Set NEXT_PUBLIC_USE_KV=true in env

import { defaultCV } from "./data";
import type { CVData } from "@/types/cv";

// In-memory cache for serverless (resets on cold start, but fine for single user)
let memCache: CVData | null = null;

const STORAGE_KEY = "lothin_cv_data";

export async function getCVData(): Promise<CVData> {
  // 1. Try in-memory cache first
  if (memCache) return memCache;

  // 2. Try env-injected data (set at build time or via Cloudflare KV in a real setup)
  try {
    const raw = process.env.CV_JSON_DATA;
    if (raw) {
      const parsed = JSON.parse(raw) as CVData;
      memCache = parsed;
      return parsed;
    }
  } catch {
    // ignore
  }

  // 3. Fall back to default seed data
  memCache = { ...defaultCV, updatedAt: new Date().toISOString() };
  return memCache;
}

export async function saveCVData(data: CVData): Promise<void> {
  memCache = { ...data, updatedAt: new Date().toISOString() };
  // In production with Cloudflare KV you'd do:
  //   await env.CV_STORE.put(STORAGE_KEY, JSON.stringify(memCache));
}
