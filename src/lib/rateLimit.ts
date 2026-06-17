// src/lib/rateLimit.ts

interface RateLimitConfig {
  intervalMs: number;
  maxRequests: number;
  limitName?: string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

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

  if (store.size > 5000) {
    store.forEach((record, key) => {
      if (now > record.resetTime) {
        store.delete(key);
      }
    });
  }

  const record = store.get(ip);

  if (!record || now > record.resetTime) {
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
