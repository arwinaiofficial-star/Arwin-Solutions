import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "";
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = new URL(req.url).origin;

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/jobready/login?error=linkedin_auth_failed`);
  }

  try {
    // Exchange code for tokens with LinkedIn
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

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(`${baseUrl}/jobready/login?error=linkedin_token_failed`);
    }

    // Get user info from LinkedIn using OpenID Connect userinfo endpoint
    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const linkedinUser = await userRes.json();

    // Send to our backend social auth endpoint
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "linkedin",
        email: linkedinUser.email,
        name: linkedinUser.name || `${linkedinUser.given_name || ""} ${linkedinUser.family_name || ""}`.trim(),
        provider_id: linkedinUser.sub,
        image: linkedinUser.picture,
      }),
    });

    const backendData = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.redirect(`${baseUrl}/jobready/login?error=auth_failed`);
    }

    // Set auth cookies and redirect to app
    const response = NextResponse.redirect(`${baseUrl}/jobready/app`);

    if (backendData.tokens?.access_token) {
      response.cookies.set("jobready_access_token", backendData.tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: backendData.tokens.expires_in || 3600,
      });
    }

    if (backendData.tokens?.refresh_token) {
      response.cookies.set("jobready_refresh_token", backendData.tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err) {
    console.error("LinkedIn OAuth callback error:", err);
    return NextResponse.redirect(`${baseUrl}/jobready/login?error=linkedin_callback_error`);
  }
}
