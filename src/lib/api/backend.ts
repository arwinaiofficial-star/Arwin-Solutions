/**
 * Shared backend fetch helper for BFF API routes.
 *
 * Handles:
 * - Centralized FASTAPI_URL config
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

const ATTEMPT_TIMEOUT_MS = 8_000;

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Get the FASTAPI_URL (for cases where you need it directly, like streaming)
 */
export function getBackendUrl(): string {
  return FASTAPI_URL;
}
