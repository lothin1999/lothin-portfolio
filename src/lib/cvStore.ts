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
  if (!result.documents) result.documents = (localCV as any).documents || [];
  if (!result.adminSettings) result.adminSettings = (localCV as any).adminSettings || {};

  return result;
}

interface R2Object {
  key: string;
  size?: number;
  uploaded?: string;
}

async function listR2Files(): Promise<R2Object[]> {
  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME;
    if (bucket && typeof bucket.list === "function") {
      const listed = await bucket.list();
      return (listed.objects || []).map((o: any) => ({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded || o.last_modified,
      }));
    }
  } catch (err) {
    console.error("Worker R2 list failed:", err);
  }

  try {
    const clean = (val?: string) => val ? val.replace(/['"]/g, "") : "";
    const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
    const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
    const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";

    if (accountId && apiToken) {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (response.ok) {
        const json = await response.json() as any;
        if (json.success) {
          // Cloudflare REST API returns `last_modified`, normalize to `uploaded`
          return (json.result || []).map((o: any) => ({
            key: o.key,
            size: o.size,
            uploaded: o.uploaded || o.last_modified,
          }));
        }
      }
    }
  } catch (err) {
    console.error("REST API R2 list failed:", err);
  }

  return [];
}

async function loadFromR2API(): Promise<any | null> {
  const clean = (val?: string) => val ? val.replace(/['"]/g, "") : "";
  const accountId = clean(process.env.CLOUDFLARE_ACCOUNT_ID);
  const apiToken = clean(process.env.CLOUDFLARE_AI_API_TOKEN);
  const bucketName = clean(process.env.R2_BUCKET_NAME) || "portfolio-data";

  if (!accountId || !apiToken) return null;

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${R2_FILE_KEY}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiToken}` },
      cache: "no-store",
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error("Failed to load cv.json from R2 via API:", err);
  }
  return null;
}

export async function getCVData(): Promise<CVData> {
  if (memCache) return memCache;

  let decrypted: CVData | null = null;

  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME as MinimalR2Bucket | undefined;
    if (bucket) {
      const object = await bucket.get(R2_FILE_KEY);
      if (object) {
        const parsed = (await object.json()) as any;
        decrypted = await ensureDecrypted(parsed);
      }
    }
  } catch (err) {
    console.error("Failed to load CV from R2 bucket:", err);
  }

  if (!decrypted) {
    try {
      const parsed = await loadFromR2API();
      if (parsed) {
        decrypted = await ensureDecrypted(parsed);
      }
    } catch (err) {
      console.error("Failed to load CV from R2 API:", err);
    }
  }

  if (!decrypted && process.env.NODE_ENV === "development") {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const res = await fetch(`${siteUrl}/api/cv/local-save`, { cache: "no-store" });
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        const parsed = await res.json();
        if (parsed && !parsed.error) {
          decrypted = await ensureDecrypted(parsed);
        }
      }
    } catch {
      // Gracefully continue to fallback data
    }
  }

  if (!decrypted) {
    try {
      const raw = process.env.CV_JSON_DATA;
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        decrypted = await ensureDecrypted(parsed);
      }
    } catch (err) {
      console.error("Failed to load CV from env:", err);
    }
  }

  if (!decrypted) {
    decrypted = await ensureDecrypted(localCV);
    decrypted.updatedAt = new Date().toISOString();
  }

  if (!decrypted.articles || decrypted.articles.length === 0) {
    decrypted.articles = defaultCV.articles;
  }

  // Query Cloudflare R2 files dynamically to set cvPdfUrl, coverLetterPdfUrl, and profile.photoUrl
  try {
    const files = await listR2Files();

    // Profile Photo: key starts with "images/profile-" and ends with a valid image extension
    const profilePhotoFiles = files.filter(
      f =>
        f.key.startsWith("images/profile-") &&
        /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(f.key)
    );

    if (profilePhotoFiles.length > 0) {
      profilePhotoFiles.sort((a, b) => {
        const timeA = a.uploaded ? new Date(a.uploaded).getTime() : 0;
        const timeB = b.uploaded ? new Date(b.uploaded).getTime() : 0;
        if (timeA && timeB) return timeB - timeA;

        const matchA = a.key.match(/profile-(\d+)\./);
        const matchB = b.key.match(/profile-(\d+)\./);
        if (matchA && matchB) {
          return parseInt(matchB[1], 10) - parseInt(matchA[1], 10);
        }
        return b.key.localeCompare(a.key);
      });

      const latestPhoto = profilePhotoFiles[0];
      const filename = latestPhoto.key.substring(7); // Remove "images/" (which is 7 chars)
      decrypted.profile.photoUrl = `/api/images/${filename}`;
    } else {
      // If no custom profile photo is uploaded:
      // If cube images exist, set photoUrl to empty to force fallback/cube rendering
      // Otherwise, keep /og-image.png as fallback
      const hasCubeImages = !!(
        decrypted.profile.cubeImages &&
        decrypted.profile.cubeImages.some((img: string) => img && img.trim() !== "")
      );
      if (hasCubeImages) {
        decrypted.profile.photoUrl = "";
      } else {
        decrypted.profile.photoUrl = "/og-image.png";
      }
    }

    // CV: key starts with "cv/" and ends with ".pdf"
    const cvFiles = files.filter(f => f.key.startsWith("cv/") && f.key.endsWith(".pdf"));
    if (cvFiles.length > 0) {
      cvFiles.sort((a, b) => {
        const timeA = a.uploaded ? new Date(a.uploaded).getTime() : 0;
        const timeB = b.uploaded ? new Date(b.uploaded).getTime() : 0;
        if (timeA && timeB) return timeB - timeA;

        const matchA = a.key.match(/cv-(\d+)\.pdf/);
        const matchB = b.key.match(/cv-(\d+)\.pdf/);
        if (matchA && matchB) {
          return parseInt(matchB[1], 10) - parseInt(matchA[1], 10);
        }
        return b.key.localeCompare(a.key);
      });
      
      const latestCv = cvFiles[0];
      const filename = latestCv.key.substring(3); // Remove "cv/"
      decrypted.profile.cvPdfUrl = `/api/cv/pdf/${filename}`;
    } else {
      decrypted.profile.cvPdfUrl = "";
    }

    // Cover Letter: key starts with "letter/" and ends with ".pdf"
    const letterFiles = files.filter(f => f.key.startsWith("letter/") && f.key.endsWith(".pdf"));
    if (letterFiles.length > 0) {
      letterFiles.sort((a, b) => {
        const timeA = a.uploaded ? new Date(a.uploaded).getTime() : 0;
        const timeB = b.uploaded ? new Date(b.uploaded).getTime() : 0;
        if (timeA && timeB) return timeB - timeA;

        const matchA = a.key.match(/letter-(\d+)\.pdf/);
        const matchB = b.key.match(/letter-(\d+)\.pdf/);
        if (matchA && matchB) {
          return parseInt(matchB[1], 10) - parseInt(matchA[1], 10);
        }
        return b.key.localeCompare(a.key);
      });
      
      const latestLetter = letterFiles[0];
      const filename = latestLetter.key.substring(7); // Remove "letter/"
      decrypted.profile.coverLetterPdfUrl = `/api/cv/pdf/${filename}`;
    } else {
      decrypted.profile.coverLetterPdfUrl = "";
    }

    // Documents: auto-sync all files in the "documents/" R2 prefix
    // Any file in R2 that isn't already registered in cv.documents gets added automatically.
    const docFiles = files.filter(f => f.key.startsWith("documents/") && f.key !== "documents/");
    if (docFiles.length > 0) {
      const existingKeys = new Set((decrypted.documents || []).map((d: any) => d.key));
      const newDocs = docFiles
        .filter(f => !existingKeys.has(f.key))
        .map(f => {
          const filename = f.key.substring("documents/".length);
          // Auto-generate a readable display name from the filename
          const name = filename
            .replace(/\.[^/.]+$/, "")       // strip extension
            .replace(/[-_]/g, " ")           // dashes/underscores → spaces
            .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
          return {
            id: `doc-r2-${filename.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`,
            name,
            filename,
            key: f.key,
            url: `/api/documents/${filename}`,
            uploadedAt: f.uploaded || new Date().toISOString(),
          };
        });

      if (newDocs.length > 0) {
        decrypted.documents = [...(decrypted.documents || []), ...newDocs];
      }
    }
  } catch (err) {
    console.error("Error syncing R2 files into CV data:", err);
  }

  memCache = decrypted;
  return memCache;
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
} // hot-reload-trigger

export async function saveCVData(data: CVData): Promise<void> {
  const updatedData = { ...data, updatedAt: new Date().toISOString() };
  memCache = updatedData;

  try {
    const context = await getCFContext();
    const env = context?.env as any;
    const bucket = env?.R2_BUCKET_NAME as MinimalR2Bucket | undefined;
    if (bucket) {
      await bucket.put(R2_FILE_KEY, JSON.stringify(updatedData));
      memCache = null;
      return;
    }
  } catch (err) {
    console.error("Failed to save CV to R2 bucket:", err);
  }

  try {
    await saveToR2API(updatedData);
  } catch (err) {
    console.error("Failed to save CV via API:", err);
  }

  if (process.env.NODE_ENV === "development") {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      await fetch(`${siteUrl}/api/cv/local-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      memCache = null;
      return;
    } catch (err) {
      console.error("Failed to save CV data to local endpoint:", err);
    }
  }

  process.env.CV_JSON_DATA = JSON.stringify(updatedData);
  memCache = null;
}

export function sanitizeCVForVisitor(cvData: CVData): CVData {
  if (!cvData) return cvData;
  const clone = JSON.parse(JSON.stringify(cvData)) as CVData;
  if (clone.references && Array.isArray(clone.references)) {
    clone.references = clone.references.map((ref: any) => ({
      ...ref,
      contact: "Available upon request"
    }));
  }
  return clone;
}
