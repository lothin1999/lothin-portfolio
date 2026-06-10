// src/lib/cvStore.ts
// Abstraction over CV data persistence.
// - Dev / Fallback: Local memory cache or environment variables
// - Supabase: Persistent cloud PostgreSQL storage

import { defaultCV } from "./data";
import type { CVData } from "@/types/cv";
import { supabase } from "./supabase";

// In-memory cache for serverless (resets on cold start, but fine for single user)
let memCache: CVData | null = null;

const STORAGE_KEY = "lothin_cv_data";

export async function getCVData(): Promise<CVData> {
  // 1. Try in-memory cache first
  if (memCache) return memCache;

  // 2. Try fetching from Supabase database
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("portfolio_data")
        .select("value")
        .eq("key", STORAGE_KEY)
        .maybeSingle();

      if (error) {
        console.error("Supabase error fetching CV data:", error);
      } else if (data && data.value) {
        memCache = data.value as CVData;
        return memCache;
      }
    } catch (err) {
      console.error("Unexpected error fetching CV data from Supabase:", err);
    }
  }

  // 3. Try env-injected data
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

  // 4. Fall back to default seed data
  memCache = { ...defaultCV, updatedAt: new Date().toISOString() };
  return memCache;
}

export async function saveCVData(data: CVData): Promise<void> {
  const updatedData = { ...data, updatedAt: new Date().toISOString() };
  memCache = updatedData;

  // 1. Write to Supabase database
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

  // 2. Fallback to process.env
  process.env.CV_JSON_DATA = JSON.stringify(updatedData);
}

