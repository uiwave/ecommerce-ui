"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  Loader2Icon,
  LogOutIcon,
  MenuIcon,
  UserRoundIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { formatRole, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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

  const initials = user ? getInitials(user.fullName, user.email) : "";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4">
        <Brand />
        <nav className="ml-2 hidden items-center gap-1 md:flex">
          <NavLink href="/" active={pathname === "/"}>
            Inicio
          </NavLink>
          {isAuthenticated && (
            <NavLink href="/cuenta" active={pathname.startsWith("/cuenta")}>
              Mi cuenta
            </NavLink>
          )}
          {user?.role === "ADMIN" && (
            <NavLink href="/dashboard" active={pathname.startsWith("/dashboard")}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Abrir menú de navegación"
              >
                <MenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 md:hidden">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/">Inicio</Link>
                </DropdownMenuItem>
                {isAuthenticated && (
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta">Mi cuenta</Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              {!isAuthenticated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Iniciar sesión</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Crear cuenta</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full sm:w-32" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pr-2 pl-1.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[0.65rem] font-semibold text-primary-foreground">
                    {initials}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                    {user.fullName}
                  </span>
                  <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{user.fullName}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                    className="mt-1.5 w-fit"
                  >
                    {formatRole(user.role)}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/cuenta">
                      <UserRoundIcon /> Mi cuenta
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboardIcon /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isLoggingOut}
                  onSelect={() => void handleLogout()}
                >
                  {isLoggingOut ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <LogOutIcon />
                  )}
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Crear cuenta</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
