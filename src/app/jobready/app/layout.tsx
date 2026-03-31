"use client";

import { useEffect } from "react";
import AppShell from "@/components/jobready/AppShell";

export default function JobReadyAppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    return () => {
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
    };
  }, []);

  return <AppShell>{children}</AppShell>;
}
