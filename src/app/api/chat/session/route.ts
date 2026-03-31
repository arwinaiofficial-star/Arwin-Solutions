import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { getAuthorizationHeader } from "@/lib/api/authCookies";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthorizationHeader(request).Authorization;
    if (!token) {
      return NextResponse.json({ session: null });
    }

    const response = await fetchBackend("/api/v1/chat/session", {
      headers: { Authorization: token },
    });

    if (!response.ok) {
      return NextResponse.json({ session: null });
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ session: null });
    }
  } catch {
    return NextResponse.json({ session: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = getAuthorizationHeader(request).Authorization;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetchBackend("/api/v1/chat/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Backend error" }, { status: 502 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Session save failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Network error" },
      { status: 500 }
    );
  }
}
