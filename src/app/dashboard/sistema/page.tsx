import type { Metadata } from "next";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { AdminView } from "@/features/dashboard/components/AdminView";

export const metadata: Metadata = {
  title: "Sistema",
};

export default function DashboardSystemPage() {
  return (
    <DashboardGuard>
      <AdminView />
    </DashboardGuard>
  );
}
