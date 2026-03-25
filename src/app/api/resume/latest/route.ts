/**
 * BFF Route: GET /api/resume/latest
 * Proxies latest resume fetch to FastAPI backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, getBackendCapabilities } from "@/lib/api/backend";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const capabilities = await getBackendCapabilities();
    if (!capabilities.supportsResumeLatest) {
      return NextResponse.json(
        {
          error: "Configured backend does not support loading saved resumes. Deploy the current JobReady backend or point FASTAPI_URL to a compatible API.",
        },
        { status: 503 }
      );
    }

    const response = await fetchBackend("/api/v1/resume/latest", {
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to fetch resume" },
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

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const response = await fetchBackend("/api/v1/resume/latest", {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(
      { error: data.detail || data.error || "Failed to reset resume" },
      { status: response.status }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend service" },
      { status: 503 }
    );
  }
}
