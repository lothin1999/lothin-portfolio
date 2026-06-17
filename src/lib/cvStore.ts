// src/lib/cvStore.ts
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

  const result = { ...decrypted } as CVData;
  if (!result.profile) result.profile = (localCV as any).profile || {};
  if (!result.experiences) {
    result.experiences = [];
  } else {
    result.experiences = result.experiences.map((exp: any) => ({
      ...exp,
      images: exp.images || [],
    }));
  }
  if (!result.educations) result.educations = [];
  if (!result.skillGroups) result.skillGroups = [];
  if (!result.references) result.references = [];
  if (!result.articles) result.articles = [];
  if (!result.adminSettings) result.adminSettings = (localCV as any).adminSettings || {};

  return result;
}

export async function getCVData(): Promise<CVData> {
  if (memCache) return memCache;

  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME as MinimalR2Bucket | undefined;
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
  }

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
    }
  }

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
  }

  const fallback = await ensureDecrypted(localCV);
  fallback.updatedAt = new Date().toISOString();
  memCache = fallback;
  return fallback;
}

async function saveToR2API(jsonData: any): Promise<boolean> {
  const clean = (val?: string) => val ? val.replace(/['"]/g, "") : "";
  const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
  const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";

  if (!accountId || !apiToken) return false;

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${R2_FILE_KEY}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    return response.ok;
  } catch (err) {
    console.error("Failed to save cv.json to R2 via API:", err);
    return false;
  }
}

export async function saveCVData(data: CVData): Promise<void> {
  const updatedData = { ...data, updatedAt: new Date().toISOString() };
  memCache = updatedData;

  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME as MinimalR2Bucket | undefined;
    if (bucket) {
      await bucket.put(R2_FILE_KEY, JSON.stringify(updatedData));
      return;
    }
  } catch (err) {
  }

  try {
    await saveToR2API(updatedData);
  } catch (err) {
  }

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

  process.env.CV_JSON_DATA = JSON.stringify(updatedData);
}
