"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboardIcon,
  Loader2Icon,
  LogOutIcon,
  PackageIcon,
  ServerIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/useAuth";
import { getInitials } from "@/lib/format";

const NAV_SECTIONS = [
  {
    label: "Panel",
    items: [
      {
        title: "General",
        href: "/dashboard",
        icon: LayoutDashboardIcon,
        exact: true,
      },
    ],
  },
  {
    label: "Catálogo",
    items: [
      {
        title: "Productos",
        href: "/dashboard/productos",
        icon: PackageIcon,
        comingSoon: true,
      },
      {
        title: "Pedidos",
        href: "/dashboard/pedidos",
        icon: ShoppingCartIcon,
        comingSoon: true,
      },
    ],
  },
  {
    label: "Administración",
    items: [
      {
        title: "Clientes",
        href: "/dashboard/clientes",
        icon: UsersIcon,
        comingSoon: true,
      },
      {
        title: "Sistema",
        href: "/dashboard/sistema",
        icon: ServerIcon,
      },
    ],
  },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Uiwave Admin">
              <Link href="/">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheckIcon className="size-4" />
                </span>
                <span className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Uiwave Admin</span>
                  <span className="text-xs text-muted-foreground">
                    Panel de administración
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    "exact" in item && item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                          {"comingSoon" in item && item.comingSoon && (
                            <Badge
                              variant="secondary"
                              className="ml-auto h-4 px-1 text-[0.6rem] group-data-[collapsible=icon]:hidden"
                            >
                              Pronto
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        {user && (
          <div className="flex items-center gap-2 rounded-md p-1.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[0.65rem] font-semibold text-primary-foreground">
              {getInitials(user.fullName, user.email)}
            </span>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-xs font-medium">{user.fullName}</span>
              <span className="truncate text-[0.65rem] text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              tooltip="Cerrar sesión"
            >
              {isLoggingOut ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <LogOutIcon />
              )}
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
