import { NextResponse } from "next/server";
import packageJson from "../../../../package.json";

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    api: "ok" | "error";
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
  
  const response: HealthResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    uptime: uptimeSeconds,
    checks: {
      api: "ok",
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
