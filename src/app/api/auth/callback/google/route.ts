import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { applyAuthCookies } from "@/lib/api/authCookies";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = new URL(req.url).origin;

  if (error || !code) {
    console.error("[Google OAuth] Auth failed or no code:", error);
    return NextResponse.redirect(`${baseUrl}/jobready/login?error=google_auth_failed`);
  }

  try {
    // 1. Exchange code for tokens with Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    const googleTokens = await tokenRes.json();
    if (!googleTokens.access_token) {
      console.error("[Google OAuth] Token exchange failed:", googleTokens);
      return NextResponse.redirect(`${baseUrl}/jobready/login?error=google_token_failed`);
    }

    // 2. Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${googleTokens.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      console.error("[Google OAuth] No email in user info:", googleUser);
      return NextResponse.redirect(`${baseUrl}/jobready/login?error=google_auth_failed`);
    }

    // 3. Send to our backend via the standard fetchBackend helper
    const backendRes = await fetchBackend("/api/v1/auth/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "google",
        email: googleUser.email,
        name: googleUser.name || "",
        provider_id: String(googleUser.id),
        image: googleUser.picture || "",
      }),
    });

    const backendData = await backendRes.json();

    if (!backendRes.ok) {
      console.error("[Google OAuth] Backend social auth failed:", backendRes.status, backendData);
      return NextResponse.redirect(`${baseUrl}/jobready/login?error=auth_failed`);
    }

    // 4. Extract tokens — handle both { tokens: {...} } and flat { access_token, ... } shapes
    const tokens = backendData.tokens || backendData;
    if (!tokens?.access_token) {
      console.error("[Google OAuth] No access_token in backend response:", backendData);
      return NextResponse.redirect(`${baseUrl}/jobready/login?error=auth_failed`);
    }

    // 5. Set auth cookies using the standard helper and redirect
    const destination = backendData.is_new_user
      ? `${baseUrl}/jobready/app/onboarding`
      : `${baseUrl}/jobready/app`;
    const response = NextResponse.redirect(destination);
    applyAuthCookies(response, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || "",
      expires_in: tokens.expires_in || 3600,
    });

    return response;
  } catch (err) {
    console.error("[Google OAuth] Callback error:", err);
    return NextResponse.redirect(`${baseUrl}/jobready/login?error=google_callback_error`);
  }
}
