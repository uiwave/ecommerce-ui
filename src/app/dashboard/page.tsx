import type { Metadata } from "next";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";

export const metadata: Metadata = {
  title: "General",
};

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <DashboardOverview />
    </DashboardGuard>
  );
}
