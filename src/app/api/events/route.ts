import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { getAuthorizationHeader } from "@/lib/api/authCookies";

export async function POST(request: NextRequest) {
  try {
    const authHeader = getAuthorizationHeader(request).Authorization;
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const response = await fetchBackend("/api/v1/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || data.error || "Failed to record event" }, { status: response.status });
    }

    return NextResponse.json(data, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Unable to record event" }, { status: 503 });
  }
}
