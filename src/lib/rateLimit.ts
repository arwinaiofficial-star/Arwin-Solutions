/**
 * Simple in-memory rate limiter for API protection
 * 
 * NOTE: This is a basic in-memory implementation suitable for single-instance deployments.
 * For production deployments on serverless platforms (Vercel, AWS Lambda) or multi-instance
 * environments, replace with Redis-based rate limiting using packages like:
 * - @upstash/ratelimit (for serverless)
 * - rate-limiter-flexible with Redis adapter
 * 
 * The cleanup interval below is safe for Node.js servers but may not run reliably
 * in serverless environments. Redis TTL handles expiration automatically.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (only effective in long-running Node.js processes)
// In serverless environments, each function invocation may have a fresh store anyway
const CLEANUP_INTERVAL_MS = 60000;
if (typeof global !== "undefined" && process.env.NODE_ENV !== "test") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {
    maxRequests: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || "60", 10),
    windowMs: 60000, // 1 minute
  }
): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  let entry = rateLimitStore.get(key);
  
  // If no entry or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 * Handles common proxy headers
 */
export function getClientIP(headers: Headers): string {
  // Check common proxy headers
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Get the first IP in the chain (original client)
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback (may not be accurate behind proxies)
  return "unknown";
}
