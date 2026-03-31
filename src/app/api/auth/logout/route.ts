import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/api/authCookies";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
