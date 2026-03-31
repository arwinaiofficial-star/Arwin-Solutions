import { NextResponse } from "next/server";
import packageJson from "../../../../package.json";
import { fetchBackend } from "@/lib/api/backend";

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    api: "ok" | "error";
    backend: "ok" | "error";
    jobSources: {
      remotive: "ok" | "unknown";
      arbeitnow: "ok" | "unknown";
    };
  };
}

// Track server start time for uptime calculation
const serverStartTime = Date.now();

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  let backend: "ok" | "error" = "error";

  try {
    const response = await fetchBackend("/health");
    backend = response.ok ? "ok" : "error";
  } catch {
    backend = "error";
  }
  
  const response: HealthResponse = {
    status: backend === "ok" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    uptime: uptimeSeconds,
    checks: {
      api: backend === "ok" ? "ok" : "error",
      backend,
      jobSources: {
        remotive: "unknown",
        arbeitnow: "unknown",
      },
    },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
