/**
 * Lightweight in-memory sliding-window rate limiter for API routes.
 *
 * Note: in-memory state is per-server-instance. On serverless (Vercel) it
 * limits per warm instance, which still meaningfully throttles abusive bursts
 * without any external store. For stronger guarantees use a shared store
 * (e.g. Upstash) — kept dependency-free here on purpose.
 */

type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms when the window resets
  retryAfter: number; // seconds
}

/**
 * @param key     unique caller key (usually IP + route)
 * @param limit   max requests per window
 * @param windowMs window length in ms
 */
export function rateLimit(key: string, limit = 60, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  let b = buckets.get(key);

  if (!b || b.reset <= now) {
    b = { count: 0, reset: now + windowMs };
    buckets.set(key, b);
  }

  b.count += 1;

  // Opportunistic cleanup to keep the map bounded.
  if (buckets.size > MAX_KEYS) {
    for (const [k, v] of buckets) {
      if (v.reset <= now) buckets.delete(k);
      if (buckets.size <= MAX_KEYS) break;
    }
  }

  const remaining = Math.max(0, limit - b.count);
  const ok = b.count <= limit;
  return {
    ok,
    limit,
    remaining,
    reset: b.reset,
    retryAfter: Math.max(0, Math.ceil((b.reset - now) / 1000)),
  };
}

/** Best-effort client IP from common proxy headers (Vercel/Netlify/Cloudflare). */
export function clientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-vercel-forwarded-for") ||
    "unknown"
  );
}

/** Standard rate-limit headers for a response. */
export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  const out: Record<string, string> = {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(Math.ceil(r.reset / 1000)),
  };
  if (!r.ok) out["Retry-After"] = String(r.retryAfter);
  return out;
}
