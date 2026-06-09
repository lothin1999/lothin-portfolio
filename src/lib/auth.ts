// src/lib/auth.ts
// Uses Web Crypto API (SHA-256 HMAC) — no bcrypt, works on Cloudflare Edge runtime.
//
// HOW TO SET YOUR PASSWORD:
//   node -e "
//     const crypto = require('crypto');
//     const pass = 'YourPassword';
//     const salt = crypto.randomBytes(16).toString('hex');
//     const hash = crypto.createHmac('sha256', salt).update(pass).digest('hex');
//     console.log('ADMIN_PASSWORD_HASH=' + salt + ':' + hash);
//   "
//   Paste the output into your .env.local / Cloudflare env vars.

import { SignJWT, jwtVerify } from "jose";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET env var is required in production");
    }
    return new TextEncoder().encode("dev-jwt-secret-32-chars-minimum!!");
  }
  return new TextEncoder().encode(secret);
}

/** HMAC-SHA256 using the Web Crypto API — works on Edge & Node */
async function hmacSha256(key: string, data: string): Promise<string> {
  const keyData = new TextEncoder().encode(key);
  const dataBytes = new TextEncoder().encode(data);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, dataBytes);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison to prevent timing attacks */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Hash a password for storage.
 * Returns "salt:hmac" string to paste into ADMIN_PASSWORD_HASH env var.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hash = await hmacSha256(salt, plain);
  return `${salt}:${hash}`;
}

/**
 * Verify a plain password against the stored "salt:hash" value.
 */
export async function verifyPassword(plain: string): Promise<boolean> {
  const stored = process.env.ADMIN_PASSWORD_HASH;

  // Dev fallback — no env var set
  if (!stored) {
    if (process.env.NODE_ENV === "production") return false;
    console.warn("⚠️  ADMIN_PASSWORD_HASH not set. Dev fallback password: admin123");
    return plain === "admin123";
  }

  const [salt, expectedHash] = stored.split(":");
  if (!salt || !expectedHash) {
    console.error("❌ ADMIN_PASSWORD_HASH format is invalid. Expected: salt:hash");
    return false;
  }

  const actualHash = await hmacSha256(salt, plain);
  return safeEqual(actualHash, expectedHash);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = "lothin_admin_session";
export const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE ?? "14400", 10);
