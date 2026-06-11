// src/lib/cvStore.ts
// Abstraction over CV data persistence.
// - Cloudflare R2: Primary free edge object storage
// - Supabase: Persistent cloud PostgreSQL storage (fallback/backup)
// - Dev / Fallback: Local memory cache or environment variables

import { defaultCV } from "./data";
import type { CVData } from "@/types/cv";
import { supabase } from "./supabase";
import localCV from "../../cv.json";

// In-memory cache for serverless (resets on cold start, but fine for single user)
let memCache: CVData | null = null;

const STORAGE_KEY = "lothin_cv_data";
const R2_FILE_KEY = "cv.json";

interface MinimalR2Bucket {
  get(key: string): Promise<{ json(): Promise<any> } | null>;
  put(key: string, value: string): Promise<any>;
}

// Safely get Cloudflare Request Context using dynamic import to prevent loading crashes in non-Cloudflare environments
async function getCFContext() {
  try {
    const { getRequestContext } = await import("@cloudflare/next-on-pages");
    return getRequestContext();
  } catch {
    return null;
  }
}

export async function getCVData(): Promise<CVData> {
  // 1. Try in-memory cache first
  if (memCache) return memCache;

  // 2. Try Cloudflare R2 Object Storage
  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.PORTFOLIO_BUCKET as MinimalR2Bucket | undefined;
    if (bucket) {
      const object = await bucket.get(R2_FILE_KEY);
      if (object) {
        const parsed = (await object.json()) as CVData;
        if (!parsed.articles || parsed.articles.length === 0) {
          parsed.articles = defaultCV.articles;
        }
        memCache = parsed;
        return memCache;
      }
    }
  } catch (err) {
    // Silence warning when running outside Cloudflare env (e.g. build time or next dev)
    console.log("R2 bucket is not available. Falling back to Supabase/defaults.");
  }

  // 3. Try fetching from Supabase database
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("portfolio_data")
        .select("value")
        .eq("key", STORAGE_KEY)
        .maybeSingle();

      if (error) {
        console.log("Supabase error fetching CV data:", error);
      } else if (data && data.value) {
        const parsed = data.value as CVData;
        if (!parsed.articles || parsed.articles.length === 0) {
          parsed.articles = defaultCV.articles;
        }
        memCache = parsed;
        return memCache;
      }
    } catch (err) {
      console.log("Unexpected error fetching CV data from Supabase:", err);
    }
  }

  // 4. Try env-injected data
  try {
    const raw = process.env.CV_JSON_DATA;
    if (raw) {
      const parsed = JSON.parse(raw) as CVData;
      if (!parsed.articles || parsed.articles.length === 0) {
        parsed.articles = defaultCV.articles;
      }
      memCache = parsed;
      return parsed;
    }
  } catch {
    // ignore
  }

  // 5. Fall back to local cv.json seed data
  const fallback = { ...(localCV as any), updatedAt: new Date().toISOString() } as CVData;
  memCache = fallback;
  return fallback;
}

export async function saveCVData(data: CVData): Promise<void> {
  const updatedData = { ...data, updatedAt: new Date().toISOString() };
  memCache = updatedData;

  // 1. Write to Cloudflare R2 Object Storage
  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.PORTFOLIO_BUCKET as MinimalR2Bucket | undefined;
    if (bucket) {
      await bucket.put(R2_FILE_KEY, JSON.stringify(updatedData));
    }
  } catch (err) {
    console.error("Cloudflare R2 save error (might be running locally without binding):", err);
  }

  // 2. Write to Supabase database
  if (supabase) {
    try {
      const { error } = await supabase
        .from("portfolio_data")
        .upsert(
          { key: STORAGE_KEY, value: updatedData, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      if (error) {
        console.error("Supabase error saving CV data:", error);
        throw error;
      }
      return;
    } catch (err) {
      console.error("Unexpected error saving CV data to Supabase:", err);
    }
  }

  // 3. Fallback to process.env
  process.env.CV_JSON_DATA = JSON.stringify(updatedData);
}


