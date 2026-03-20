/**
 * BFF Route: GET /api/auth/me, PATCH /api/auth/me
 * Proxies user profile operations to FastAPI backend.
 */

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

function getAuthHeader(request: NextRequest): Record<string, string> {
  const auth = request.headers.get("authorization");
  if (auth) {
    return { Authorization: auth };
  }
  return {};
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(request),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to fetch profile" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend service" },
      { status: 503 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${FASTAPI_URL}/api/v1/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to update profile" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend service" },
      { status: 503 }
    );
  }
}
