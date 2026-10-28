"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "./DashboardSidebar";

const SECTION_TITLES: Record<string, string> = {
  "/dashboard": "General",
  "/dashboard/sistema": "Sistema",
  "/dashboard/productos": "Productos",
  "/dashboard/pedidos": "Pedidos",
  "/dashboard/clientes": "Clientes",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sectionTitle = SECTION_TITLES[pathname] ?? "Panel";

  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4!" />
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">{sectionTitle}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Dashboard
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <ThemeToggle />
              <Button asChild variant="outline" size="sm">
                <Link href="/">Ver tienda</Link>
              </Button>
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
