// src/lib/cvStore.ts
// Abstraction over CV data persistence.
// - Cloudflare R2: Primary edge object storage (production)
// - Local File: Persistent workspace file read/write (local development)

import { defaultCV } from "./data";
import type { CVData } from "@/types/cv";
import localCV from "../../cv.json";
import { decryptData } from "./encryption";

// In-memory cache for serverless
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

async function getLocalFS() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const fs = eval('require("fs/promises")');
      const path = eval('require("path")');
      return { fs, path };
    } catch {
      return null;
    }
  }
  return null;
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
    // Silence warning when running outside Cloudflare env (e.g. build time or next dev)
  }

  // 3. Try local filesystem (for persistent local development)
  const localFS = await getLocalFS();
  if (localFS) {
    try {
      const filePath = localFS.path.join(process.cwd(), "cv.json");
      const raw = await localFS.fs.readFile(filePath, "utf-8");
      if (raw) {
        const parsed = JSON.parse(raw);
        const decrypted = await ensureDecrypted(parsed);
        if (!decrypted.articles || decrypted.articles.length === 0) {
          decrypted.articles = defaultCV.articles;
        }
        memCache = decrypted;
        return memCache;
      }
    } catch (err) {
      // file might not exist yet
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

  // 2. Write to local filesystem (for persistent local development)
  const localFS = await getLocalFS();
  if (localFS) {
    try {
      const filePath = localFS.path.join(process.cwd(), "cv.json");
      await localFS.fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), "utf-8");
      return;
    } catch (err) {
      console.error("Failed to save CV data to local filesystem:", err);
    }
  }

  // 3. Fallback to process.env
  process.env.CV_JSON_DATA = JSON.stringify(updatedData);
}
