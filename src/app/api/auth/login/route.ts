/**
 * BFF Route: POST /api/auth/login
 * Proxies login to FastAPI backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetchBackend("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Login failed" },
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
