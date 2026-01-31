import type { Metadata } from "next";
import JobReadyClient from "@/components/jobready/JobReadyClient";

export const metadata: Metadata = {
  title: "JobReady.ai - Arwin AI Solutions",
  description:
    "Phase 1 prototype for JobReady.ai-capture candidate context and auto-search LinkedIn-style platforms with Maya Design System UX.",
};

export default function JobReadyPage() {
  return <JobReadyClient />;
}
