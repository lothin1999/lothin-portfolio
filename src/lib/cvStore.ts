// src/lib/cvStore.ts
// Abstraction over CV data persistence.
// - Cloudflare R2: Primary edge object storage (production)
// - Local API: Persistent local JSON endpoint (local development)

import { defaultCV } from "./data";
import type { CVData } from "@/types/cv";
import localCV from "../../cv.json";
import { decryptData } from "./encryption";

let memCache: CVData | null = null;
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

const getEncryptionKey = () => process.env.CV_ENCRYPTION_KEY || "lothin-dev";

async function ensureDecrypted(data: any): Promise<CVData> {
  let decrypted = data;
  if (data && data.encrypted && data.ciphertext) {
    try {
      decrypted = await decryptData(data.ciphertext, getEncryptionKey());
    } catch (err) {
      console.error("Failed to decrypt CV data in cvStore:", err);
      decrypted = localCV;
    }
  }

  // Ensure robust properties to prevent crashes on outdated schema shapes
  const result = { ...decrypted } as CVData;
  if (!result.profile) result.profile = (localCV as any).profile || {};
  if (!result.experiences) result.experiences = [];
  if (!result.educations) result.educations = [];
  if (!result.skillGroups) result.skillGroups = [];
  if (!result.references) result.references = [];
  if (!result.articles) result.articles = [];
  
  return result;
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
        const parsed = (await object.json()) as any;
        const decrypted = await ensureDecrypted(parsed);
        if (!decrypted.articles || decrypted.articles.length === 0) {
          decrypted.articles = defaultCV.articles;
        }
        memCache = decrypted;
        return memCache;
      }
    }
  } catch (err) {
    // Silence warning when running outside Cloudflare env
  }

  // 3. Try fetching from local save endpoint in local development
  if (process.env.NODE_ENV === "development") {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const res = await fetch(`${siteUrl}/api/cv/local-save`, { cache: "no-store" });
      if (res.ok) {
        const parsed = await res.json();
        const decrypted = await ensureDecrypted(parsed);
        if (!decrypted.articles || decrypted.articles.length === 0) {
          decrypted.articles = defaultCV.articles;
        }
        memCache = decrypted;
        return memCache;
      }
    } catch (err) {
      // ignore local dev endpoint failures
    }
  }

  // 4. Try env-injected data
  try {
    const raw = process.env.CV_JSON_DATA;
    if (raw) {
      const parsed = JSON.parse(raw) as any;
      const decrypted = await ensureDecrypted(parsed);
      if (!decrypted.articles || decrypted.articles.length === 0) {
        decrypted.articles = defaultCV.articles;
      }
      memCache = decrypted;
      return decrypted;
    }
  } catch {
    // ignore
  }

  // 5. Fall back to local cv.json seed data
  const fallback = await ensureDecrypted(localCV);
  fallback.updatedAt = new Date().toISOString();
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
      return;
    }
  } catch (err) {
    console.error("Cloudflare R2 save error (might be running locally without binding):", err);
  }

  // 2. Save locally via Node save endpoint in development
  if (process.env.NODE_ENV === "development") {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      await fetch(`${siteUrl}/api/cv/local-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      return;
    } catch (err) {
      console.error("Failed to save CV data to local endpoint:", err);
    }
  }

  // 3. Fallback to process.env
  process.env.CV_JSON_DATA = JSON.stringify(updatedData);
}
