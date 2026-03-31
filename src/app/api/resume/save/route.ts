/**
 * BFF Route: POST /api/resume/save
 * Proxies resume save to FastAPI backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { getAuthorizationHeader } from "@/lib/api/authCookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = getAuthorizationHeader(request).Authorization;

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const response = await fetchBackend("/api/v1/resume/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Resume save failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Resume service is unavailable right now" },
      { status: 503 }
    );
  }
}
