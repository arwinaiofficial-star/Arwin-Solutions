/**
 * BFF Route: POST /api/auth/refresh
 * Proxies token refresh to FastAPI backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { applyAuthCookies, getRefreshToken } from "@/lib/api/authCookies";

export async function POST(request: NextRequest) {
  try {
    let refreshToken = getRefreshToken(request);
    if (!refreshToken) {
      try {
        const body = await request.json() as { refresh_token?: string };
        refreshToken = body.refresh_token || null;
      } catch {
        refreshToken = null;
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token missing" },
        { status: 401 }
      );
    }

    const response = await fetchBackend("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Token refresh failed" },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(data);
    if (data.access_token && data.refresh_token) {
      applyAuthCookies(nextResponse, data);
    }
    return nextResponse;
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend service" },
      { status: 503 }
    );
  }
}
