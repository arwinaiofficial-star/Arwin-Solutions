import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";
import { applyAuthCookies } from "@/lib/api/authCookies";

const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "";
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = new URL(req.url).origin;

  if (error || !code) {
    console.error("[LinkedIn OAuth] Auth failed or no code:", error);
    return NextResponse.redirect(`${baseUrl}/jobready/login?error=linkedin_auth_failed`);
  }

  try {
    // 1. Exchange code for tokens with LinkedIn
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: `${baseUrl}/api/auth/callback/linkedin`,
      }),
    });

    const linkedinTokens = await tokenRes.json();
    if (!linkedinTokens.access_token) {
      console.error("[LinkedIn OAuth] Token exchange failed:", linkedinTokens);
      return NextResponse.redirect(`${baseUrl}/jobready/login?error=linkedin_token_failed`);
    }

    // 2. Get user info from LinkedIn (OpenID Connect userinfo)
    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${linkedinTokens.access_token}` },
    });
    const linkedinUser = await userRes.json();

    if (!linkedinUser.email) {
      console.error("[LinkedIn OAuth] No email in user info:", linkedinUser);
      return NextResponse.redirect(`${baseUrl}/jobready/login?error=linkedin_auth_failed`);
    }

    // 3. Send to our backend via the standard fetchBackend helper
    const backendRes = await fetchBackend("/api/v1/auth/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "linkedin",
        email: linkedinUser.email,
        name: linkedinUser.name || `${linkedinUser.given_name || ""} ${linkedinUser.family_name || ""}`.trim(),
        provider_id: String(linkedinUser.sub),
        image: linkedinUser.picture || "",
      }),
    });

    const backendData = await backendRes.json();

    if (!backendRes.ok) {
      console.error("[LinkedIn OAuth] Backend social auth failed:", backendRes.status, backendData);
      return NextResponse.redirect(`${baseUrl}/jobready/login?error=auth_failed`);
    }

    // 4. Extract tokens — handle both { tokens: {...} } and flat { access_token, ... } shapes
    const tokens = backendData.tokens || backendData;
    if (!tokens?.access_token) {
      console.error("[LinkedIn OAuth] No access_token in backend response:", backendData);
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
    console.error("[LinkedIn OAuth] Callback error:", err);
    return NextResponse.redirect(`${baseUrl}/jobready/login?error=linkedin_callback_error`);
  }
}
