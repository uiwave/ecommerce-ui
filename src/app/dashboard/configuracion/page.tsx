import type { Metadata } from "next";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { SettingsView } from "@/features/dashboard/components/SettingsView";

export const metadata: Metadata = {
  title: "Configuración",
};

export default function DashboardSettingsPage() {
  return (
    <DashboardGuard>
      <SettingsView />
    </DashboardGuard>
  );
}
