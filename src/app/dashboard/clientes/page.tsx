import type { Metadata } from "next";
import { UsersIcon } from "lucide-react";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { ComingSoon } from "@/features/dashboard/components/ComingSoon";

export const metadata: Metadata = {
  title: "Clientes",
};

export default function DashboardCustomersPage() {
  return (
    <DashboardGuard>
      <ComingSoon
        icon={UsersIcon}
        title="Clientes"
        description="Aquí podrás consultar los usuarios registrados y sus roles cuando el API de administración de usuarios esté disponible."
      />
    </DashboardGuard>
  );
}
