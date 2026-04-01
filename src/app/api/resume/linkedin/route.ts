/**
 * BFF Route: POST /api/resume/linkedin
 * Proxies LinkedIn profile import to FastAPI backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { getAuthorizationHeader } from "@/lib/api/authCookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { linkedin_url?: string };
    const authHeader = getAuthorizationHeader(request).Authorization;

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!body.linkedin_url) {
      return NextResponse.json(
        { error: "LinkedIn URL is required" },
        { status: 400 }
      );
    }

    const response = await fetchBackend("/api/v1/resume/linkedin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ linkedin_url: body.linkedin_url }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "LinkedIn import failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to LinkedIn import service" },
      { status: 503 }
    );
  }
}
