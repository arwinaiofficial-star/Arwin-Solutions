import { NextResponse } from "next/server";
import packageJson from "../../../../package.json";
import { getBackendCapabilities } from "@/lib/api/backend";

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
    checks: {
      api: "ok" | "error";
      backendCapabilities: {
        resumeSave: boolean;
        resumeLatest: boolean;
        applications: boolean;
      };
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
  const capabilities = await getBackendCapabilities();
  
  const response: HealthResponse = {
    status: capabilities.supportsResumeSave && capabilities.supportsResumeLatest && capabilities.supportsApplications
      ? "healthy"
      : "degraded",
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    uptime: uptimeSeconds,
    checks: {
      api: capabilities.supportsResumeSave && capabilities.supportsResumeLatest && capabilities.supportsApplications ? "ok" : "error",
      backendCapabilities: {
        resumeSave: capabilities.supportsResumeSave,
        resumeLatest: capabilities.supportsResumeLatest,
        applications: capabilities.supportsApplications,
      },
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
