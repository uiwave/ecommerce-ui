import type { Metadata } from "next";
import { ShoppingCartIcon } from "lucide-react";

import { DashboardGuard } from "@/features/dashboard/DashboardGuard";
import { ComingSoon } from "@/features/dashboard/components/ComingSoon";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default function DashboardOrdersPage() {
  return (
    <DashboardGuard>
      <ComingSoon
        icon={ShoppingCartIcon}
        title="Pedidos"
        description="Aquí podrás consultar las órdenes de compra, sus estados y el historial de envíos cuando el API esté disponible."
      />
    </DashboardGuard>
  );
}
