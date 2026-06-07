import type { Metadata } from "next";
import "./billing.css";

export const metadata: Metadata = {
  title: "Billing Admin | Arwin Group",
  description: "Internal billing and invoice management system",
  robots: { index: false, follow: false },
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="billing-root">
      {children}
    </div>
  );
}
