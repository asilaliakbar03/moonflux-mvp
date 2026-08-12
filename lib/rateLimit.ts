/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window approach per IP address.
 * 
 * NOTE: This works per-instance. For multi-instance deployments (Vercel serverless),
 * consider upgrading to Redis-backed (e.g., @upstash/ratelimit).
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets.entries()) {
    if (now - entry.lastRefill > 600_000) { // 10 min stale
      buckets.delete(key);
    }
  }
}, 300_000);

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSec: number;
}

/** Default: 10 requests per 60 seconds */
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowSec: 60,
};

/**
 * Check if a request should be rate-limited.
 * Returns { allowed, remaining, retryAfterSec }.
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const windowMs = config.windowSec * 1000;
  
  let entry = buckets.get(identifier);
  
  if (!entry) {
    // First request from this identifier
    entry = { tokens: config.maxRequests - 1, lastRefill: now };
    buckets.set(identifier, entry);
    return { allowed: true, remaining: config.maxRequests - 1, retryAfterSec: 0 };
  }
  
  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill;
  const refillRate = config.maxRequests / windowMs;
  const refilled = Math.min(config.maxRequests, entry.tokens + elapsed * refillRate);
  
  entry.tokens = refilled;
  entry.lastRefill = now;
  
  if (entry.tokens < 1) {
    // Rate limited
    const retryAfterSec = Math.ceil((1 - entry.tokens) / refillRate / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }
  
  // Consume a token
  entry.tokens -= 1;
  return { allowed: true, remaining: Math.floor(entry.tokens), retryAfterSec: 0 };
}

/**
 * Extract client IP from request headers.
 * Works with Vercel, Cloudflare, and standard proxies.
 */
export function getClientIP(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'anonymous'
  );
}

/**
 * Convenience: check rate limit and return a 429 Response if exceeded.
 * Returns null if allowed, or a Response if blocked.
 */
export function checkRateLimit(
  request: Request,
  config?: RateLimitConfig
): Response | null {
  const ip = getClientIP(request);
  const routeKey = new URL(request.url).pathname;
  const key = `${routeKey}:${ip}`;
  
  const result = rateLimit(key, config);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        retryAfterSec: result.retryAfterSec,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.retryAfterSec),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }
  
  return null;
}
