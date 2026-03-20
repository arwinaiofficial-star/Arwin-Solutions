import type { Metadata } from "next";
import WorkPageClient from "@/components/WorkPageClient";

export const metadata: Metadata = {
  title: "Our Work — Arwin Forge",
  description:
    "Explore 26+ digital transformation projects delivered by Arwin Forge across government, education, and enterprise sectors since 2011.",
};

export default function WorkPage() {
  return <WorkPageClient />;
}
