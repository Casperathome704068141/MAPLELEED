type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type RateLimitResult = {
  success: boolean;
  retryAfter?: number;
};

const buckets = new Map<string, { hits: number; expiresAt: number }>();

export function applyRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.expiresAt <= now) {
    buckets.set(key, { hits: 1, expiresAt: now + options.windowMs });
    return { success: true };
  }

  if (bucket.hits >= options.max) {
    const retryAfter = Math.ceil((bucket.expiresAt - now) / 1000);
    return { success: false, retryAfter: Math.max(retryAfter, 1) };
  }

  bucket.hits += 1;
  return { success: true };
}
