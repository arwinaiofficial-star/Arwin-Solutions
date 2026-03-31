import type { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "jobready_access_token";
const REFRESH_COOKIE = "jobready_refresh_token";
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

type TokenPayload = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

function isSecureCookie() {
  return process.env.NODE_ENV === "production";
}

export function getAccessToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (header) {
    return header.replace(/^Bearer\s+/i, "").trim();
  }
  return request.cookies.get(ACCESS_COOKIE)?.value || null;
}

export function getRefreshToken(request: NextRequest): string | null {
  return request.cookies.get(REFRESH_COOKIE)?.value || null;
}

export function getAuthorizationHeader(request: NextRequest): Record<string, string> {
  const token = getAccessToken(request);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function applyAuthCookies(response: NextResponse, tokens: TokenPayload) {
  response.cookies.set(ACCESS_COOKIE, tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: Math.max(tokens.expires_in, 60),
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: 0,
  });
}
