import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { applyAuthCookies, getAuthorizationHeader } from "@/lib/api/authCookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetchBackend("/api/v1/auth/social", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthorizationHeader(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Social login failed" },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(data);
    if (data.tokens) {
      applyAuthCookies(nextResponse, data.tokens);
    }
    return nextResponse;
  } catch {
    return NextResponse.json(
      { error: "Network error during social login" },
      { status: 500 }
    );
  }
}
