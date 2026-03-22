/**
 * Shared backend fetch helper for BFF API routes.
 *
 * Handles:
 * - Render free-tier cold starts (up to 60s spin-up) with retry
 * - Centralized FASTAPI_URL config
 * - Consistent error responses
 * - Timeout management
 */

// FASTAPI_URL must be set in Vercel env vars for production.
// Fallback to Render URL if not set (better than localhost which never works in prod).
const FASTAPI_URL =
  process.env.FASTAPI_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://arwinai-backend.onrender.com"
    : "http://localhost:8000");

if (!process.env.FASTAPI_URL && process.env.NODE_ENV === "production") {
  console.warn(
    "[backend] FASTAPI_URL not set — falling back to https://arwinai-backend.onrender.com. Set FASTAPI_URL in Vercel env vars!"
  );
}

/** Timeout per attempt (Vercel Hobby has 10s function limit — keep under that) */
const ATTEMPT_TIMEOUT_MS = 8_000;

/** Max retries — keep total time under 10s (8s attempt + no delay = ~8s for 1 try) */
const MAX_RETRIES = 0;

/** Delay between retries */
const RETRY_DELAY_MS = 1_000;

function isConnectionError(err: unknown): boolean {
  if (err instanceof TypeError && String(err.message).includes("fetch failed")) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("econnrefused") ||
      msg.includes("econnreset") ||
      msg.includes("etimedout") ||
      msg.includes("socket hang up") ||
      msg.includes("abort") ||
      msg.includes("network") ||
      msg.includes("fetch failed")
    );
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch from the FastAPI backend with cold-start retry.
 *
 * @param path  — path after FASTAPI_URL, e.g. "/api/v1/auth/login"
 * @param init  — standard RequestInit (method, headers, body, etc.)
 * @returns       the Response object from the backend
 * @throws        only after all retries are exhausted
 */
export async function fetchBackend(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = `${FASTAPI_URL}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);

      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timer);
      return response;
    } catch (err) {
      lastError = err;

      // Only retry on connection errors (cold start), not on other failures
      if (attempt < MAX_RETRIES && isConnectionError(err)) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      throw err;
    }
  }

  // Should never reach here, but just in case
  throw lastError;
}

/**
 * Get the FASTAPI_URL (for cases where you need it directly, like streaming)
 */
export function getBackendUrl(): string {
  return FASTAPI_URL;
}
