import type { Metadata } from "next";
import { PackageIcon } from "lucide-react";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { ComingSoon } from "@/features/dashboard/components/ComingSoon";

export const metadata: Metadata = {
  title: "Productos",
};

export default function DashboardProductsPage() {
  return (
    <DashboardGuard>
      <ComingSoon
        icon={PackageIcon}
        title="Productos"
        description="Aquí podrás gestionar el catálogo, los precios y el stock cuando el API de productos esté disponible."
      />
    </DashboardGuard>
  );
}
