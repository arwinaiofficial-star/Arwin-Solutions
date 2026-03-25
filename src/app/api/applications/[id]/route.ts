/**
 * BFF Route: /api/applications/[id]
 * PATCH  — update a tracked application (status, notes)
 * DELETE — remove a tracked application
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend, getBackendCapabilities } from "@/lib/api/backend";

function getAuthHeader(request: NextRequest): Record<string, string> {
  const auth = request.headers.get("authorization");
  return auth ? { Authorization: auth } : {};
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const response = await fetchBackend(`/api/v1/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to update application" },
        { status: response.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to connect to backend" }, { status: 503 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const response = await fetchBackend(`/api/v1/applications/${id}`, {
      method: "DELETE",
      headers: { ...auth },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.detail || "Failed to delete application" },
        { status: response.status }
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Unable to connect to backend" }, { status: 503 });
  }
}
