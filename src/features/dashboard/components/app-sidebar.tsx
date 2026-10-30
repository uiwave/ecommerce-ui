"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Command,
  LayoutDashboard,
  Package,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/useAuth";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [{ title: "General", url: "/dashboard" }],
    },
    {
      title: "Catálogo",
      url: "/dashboard/productos",
      icon: Package,
      items: [
        { title: "Productos", url: "/dashboard/productos" },
        { title: "Inventario", url: "/dashboard/inventario" },
      ],
    },
    {
      title: "Operaciones",
      url: "/dashboard/pedidos",
      icon: ShoppingCart,
      items: [{ title: "Pedidos", url: "/dashboard/pedidos" }],
    },
    {
      title: "Clientes",
      url: "/dashboard/clientes",
      icon: Users,
      items: [{ title: "Clientes", url: "/dashboard/clientes" }],
    },
    {
      title: "Configuración",
      url: "/dashboard/configuracion",
      icon: Settings,
      items: [{ title: "General", url: "/dashboard/configuracion" }],
    },
    {
      title: "Administración",
      url: "/dashboard/sistema",
      icon: ShieldAlert,
      items: [{ title: "Sistema", url: "/dashboard/sistema" }],
    },
  ],
};

export function AppSidebar() {
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

  const currentUser = {
    name: user?.fullName ?? "Invitado",
    email: user?.email ?? "sin-correo@example.com",
    avatar: user?.imageUrl ?? "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Uiwave Admin</span>
                  <span className="truncate text-xs">Panel de administración</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={currentUser}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
