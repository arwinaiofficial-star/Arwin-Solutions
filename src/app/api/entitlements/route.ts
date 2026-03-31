import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { getAuthorizationHeader } from "@/lib/api/authCookies";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthorizationHeader(request);
    if (!auth.Authorization) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const response = await fetchBackend("/api/v1/entitlements", {
      headers: auth,
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || data.error || "Failed to load entitlements" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to connect to backend service" }, { status: 503 });
  }
}
