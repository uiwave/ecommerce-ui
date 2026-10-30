import type { Metadata } from "next";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { InventoryView } from "@/features/dashboard/components/InventoryView";

export const metadata: Metadata = {
  title: "Inventario",
};

export default function DashboardInventoryPage() {
  return (
    <DashboardGuard>
      <InventoryView />
    </DashboardGuard>
  );
}
