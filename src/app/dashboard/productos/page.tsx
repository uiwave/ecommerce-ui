import type { Metadata } from "next";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { AdminProductsView } from "@/features/dashboard/components/AdminProductsView";

export const metadata: Metadata = {
  title: "Productos",
};

export default function DashboardProductsPage() {
  return (
    <DashboardGuard>
      <AdminProductsView />
    </DashboardGuard>
  );
}
