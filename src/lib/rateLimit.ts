// src/lib/rateLimit.ts

interface RateLimitConfig {
  intervalMs: number; // e.g. 60000 for 1 minute
  maxRequests: number; // e.g. 5 requests per interval
  limitName?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting.
// Note: Since Cloudflare Worker/Edge instances are distributed, this limits per edge instance (warm container).
// This is highly effective against bot-nets and spam attacks without needing a database.
const stores: Record<string, Map<string, RequestRecord>> = {};

export function isRateLimited(
  ip: string,
  config: RateLimitConfig
): { limited: boolean; retryAfter: number } {
  const limitName = config.limitName || "default";
  if (!stores[limitName]) {
    stores[limitName] = new Map();
  }

  const store = stores[limitName];
  const now = Date.now();

  // Clean up old entries periodically to prevent memory leaks (keep map size bounded to 5,000)
  if (store.size > 5000) {
    store.forEach((record, key) => {
      if (now > record.resetTime) {
        store.delete(key);
      }
    });
  }

  const record = store.get(ip);

  if (!record || now > record.resetTime) {
    // New window or expired record
    store.set(ip, {
      count: 1,
      resetTime: now + config.intervalMs,
    });
    return { limited: false, retryAfter: 0 };
  }

  if (record.count >= config.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { limited: true, retryAfter };
  }

  record.count += 1;
  return { limited: false, retryAfter: 0 };
}
