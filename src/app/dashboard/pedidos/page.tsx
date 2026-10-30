import type { Metadata } from "next";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { AdminOrdersView } from "@/features/dashboard/components/AdminOrdersView";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default function DashboardOrdersPage() {
  return (
    <DashboardGuard>
      <AdminOrdersView />
    </DashboardGuard>
  );
}
