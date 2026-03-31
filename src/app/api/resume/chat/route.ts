/**
 * BFF Route: POST /api/resume/chat
 * Proxies resume AI chat to FastAPI backend.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { getAuthorizationHeader } from "@/lib/api/authCookies";

function extractUserId(authHeader: string): string | null {
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as { sub?: string };
    return payload.sub || null;
  } catch {
    return null;
  }
}

function isMissingUserIdError(body: unknown): boolean {
  const detail = (body as { detail?: Array<{ loc?: Array<string | number> }> })?.detail;
  return Array.isArray(detail) && detail.some((item) => item.loc?.includes("user_id"));
}

function normalizeChatResponse(body: unknown) {
  if (body && typeof body === "object" && "reply" in body) {
    return body;
  }

  const legacy = body as {
    agent_message?: string;
    resume_data?: unknown;
    progress?: number;
    state?: string;
    session_id?: string;
  };

  if (legacy.agent_message) {
    return {
      reply: legacy.agent_message,
      data: {
        resume_data: legacy.resume_data,
        progress: legacy.progress,
        state: legacy.state,
        session_id: legacy.session_id,
      },
    };
  }

  return { reply: "I couldn't process that right now." };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const authHeader = getAuthorizationHeader(request).Authorization;

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const callBackend = async (payload: Record<string, unknown>) => {
      const response = await fetchBackend("/api/v1/resume/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return { response, data };
    };

    let { response, data } = await callBackend(body);

    if (!response.ok && response.status === 422 && isMissingUserIdError(data)) {
      const userId = extractUserId(authHeader);
      if (userId) {
        ({ response, data } = await callBackend({ ...body, user_id: userId }));
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Resume chat failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(normalizeChatResponse(data));
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend service" },
      { status: 503 }
    );
  }
}
