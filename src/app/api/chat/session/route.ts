import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ session: null });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/chat/session`, {
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
    const token = request.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/chat/session`, {
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
