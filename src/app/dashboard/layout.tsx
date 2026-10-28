import type { Metadata } from "next";

import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s · Dashboard Uiwave",
  },
};

/**
 * El layout siempre renderiza {children}: el guard de sesión/rol vive en cada
 * página. Si el guard estuviera aquí, durante el prerender omitiría el subtree
 * y Next lo marcaría como "dropped segment" (instant navigation).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
