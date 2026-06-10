// src/lib/encryption.ts
// Handles browser-safe client-side encryption and decryption using AES-GCM 256-bit keys derived via PBKDF2.

function getCrypto(): Crypto {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto;
  }
  if (typeof globalThis !== "undefined" && (globalThis as any).crypto) {
    return (globalThis as any).crypto;
  }
  throw new Error("Web Crypto API is not supported in this environment");
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts an object or string using a password.
 * Returns a base64 encoded string containing [salt (16B) | iv (12B) | ciphertext (variable)].
 */
export async function encryptData(data: any, password: string): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const rawData = encoder.encode(JSON.stringify(data));

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    rawData
  );

  const combined = new Uint8Array(salt.length + iv.length + ciphertextBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertextBuffer), salt.length + iv.length);

  // Buffer conversion that works in both Node.js and Browser environments
  if (typeof Buffer !== "undefined") {
    return Buffer.from(combined).toString("base64");
  } else {
    let binary = "";
    const len = combined.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  }
}

/**
 * Decrypts a base64 payload containing [salt (16B) | iv (12B) | ciphertext (variable)] using a password.
 * Returns the parsed JSON object.
 */
export async function decryptData(base64Payload: string, password: string): Promise<any> {
  const crypto = getCrypto();
  let bytes: Uint8Array;

  // Buffer conversion that works in both Node.js and Browser environments
  if (typeof Buffer !== "undefined") {
    bytes = new Uint8Array(Buffer.from(base64Payload, "base64"));
  } else {
    const binaryString = atob(base64Payload);
    const len = binaryString.length;
    bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  }

  if (bytes.length < 28) {
    throw new Error("Invalid payload: too short");
  }

  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const ciphertext = bytes.slice(28);

  const key = await deriveKey(password, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decryptedBuffer));
}
