"use client";

import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hide global header/footer on dashboard — it has its own navigation
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    return () => {
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
    };
  }, []);

  return <>{children}</>;
}
