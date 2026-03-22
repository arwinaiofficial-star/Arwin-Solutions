/**
 * Keep-alive cron endpoint.
 * Called every 5 minutes by Vercel Cron to prevent Render free-tier from sleeping.
 *
 * Vercel Cron config in vercel.json runs every 5 minutes.
 */

import { NextResponse } from "next/server";

const BACKEND_HEALTH_URL =
  process.env.FASTAPI_URL
    ? `${process.env.FASTAPI_URL}/health`
    : "https://arwinai-backend.onrender.com/health";

export async function GET() {
  try {
    const start = Date.now();
    const response = await fetch(BACKEND_HEALTH_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000), // 8s timeout (within Vercel's 10s limit)
    });
    const elapsed = Date.now() - start;

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      elapsed_ms: elapsed,
      pinged_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
      pinged_at: new Date().toISOString(),
    });
  }
}
