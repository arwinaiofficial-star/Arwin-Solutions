/**
 * BFF Route: /api/applications
 * Proxies job application CRUD to FastAPI backend.
 * GET  — list all tracked applications
 * POST — create a new tracked application
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, getBackendCapabilities } from "@/lib/api/backend";

function getAuthHeader(request: NextRequest): Record<string, string> {
  const auth = request.headers.get("authorization");
  return auth ? { Authorization: auth } : {};
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthHeader(request);
    if (!auth.Authorization) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const capabilities = await getBackendCapabilities();
    if (!capabilities.supportsApplications) {
      return NextResponse.json(
        {
          error: "Configured backend does not support application tracking. Deploy the current JobReady backend or point FASTAPI_URL to a compatible API.",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";

    const response = await fetchBackend(`/api/v1/applications${qs}`, {
      headers: { ...auth },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to fetch applications" },
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to connect to backend" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthHeader(request);
    if (!auth.Authorization) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const capabilities = await getBackendCapabilities();
    if (!capabilities.supportsApplications) {
      return NextResponse.json(
        {
          error: "Configured backend does not support application tracking. Deploy the current JobReady backend or point FASTAPI_URL to a compatible API.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const response = await fetchBackend("/api/v1/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to create application" },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to connect to backend" }, { status: 503 });
  }
}
