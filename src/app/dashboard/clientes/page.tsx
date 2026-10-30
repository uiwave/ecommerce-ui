import type { Metadata } from "next";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { UsersView } from "@/features/dashboard/components/UsersView";

export const metadata: Metadata = {
  title: "Clientes",
};

export default function DashboardCustomersPage() {
  return (
    <DashboardGuard>
      <UsersView />
    </DashboardGuard>
  );
}
