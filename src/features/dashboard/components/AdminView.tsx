"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  BoxesIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  PackageIcon,
  RefreshCwIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { authApi } from "@/lib/api/auth.api";
import { adminApi } from "@/lib/api/admin.api";
import { ApiError } from "@/lib/api/errors";
import { API_URL } from "@/lib/config";
import { formatCurrency, formatDateTime } from "@/lib/format";

const QUICK_LINKS = [
  {
    title: "Productos",
    description: "Gestiona el catálogo, precios y stock.",
    href: "/dashboard/productos",
    icon: PackageIcon,
  },
  {
    title: "Inventario",
    description: "Ajusta las existencias de cada producto.",
    href: "/dashboard/inventario",
    icon: BoxesIcon,
  },
  {
    title: "Pedidos",
    description: "Revisa y actualiza el estado de los pedidos.",
    href: "/dashboard/pedidos",
    icon: ShoppingCartIcon,
  },
  {
    title: "Clientes",
    description: "Administra roles y cuentas de usuario.",
    href: "/dashboard/clientes",
    icon: UsersIcon,
  },
  {
    title: "Configuración",
    description: "Identidad del sitio, moneda, envíos e impuestos.",
    href: "/dashboard/configuracion",
    icon: SettingsIcon,
  },
];

export function AdminView() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const hello = useQuery({
    queryKey: ["admin-hello"],
    queryFn: authApi.adminHello,
    enabled: isAdmin,
  });

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.stats,
    enabled: isAdmin,
  });

  function refresh() {
    void hello.refetch();
    void stats.refetch();
  }

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Acceso restringido</AlertTitle>
        <AlertDescription>
          Este panel solo está disponible para usuarios con rol ADMIN.{" "}
          <Link
            href="/cuenta"
            className="font-medium underline underline-offset-4"
          >
            Volver a mi cuenta
          </Link>
          .
        </AlertDescription>
      </Alert>
    );
  }

  const isBusy = hello.isFetching || stats.isFetching;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sistema</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Estado de la API, métricas generales y accesos del panel.
          </p>
        </div>
        <Badge className="gap-1">
          <ShieldCheckIcon /> ADMIN
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">Estado de la API</CardTitle>
            {hello.isSuccess ? (
              <Badge variant="default" className="gap-1">
                <CircleCheckIcon /> Conectada
              </Badge>
            ) : hello.isError ? (
              <Badge variant="destructive" className="gap-1">
                <CircleAlertIcon /> Con error
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            Verificación del endpoint administrativo protegido por Spring
            Security.
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isBusy}
            >
              <RefreshCwIcon className={isBusy ? "animate-spin" : undefined} />
              Volver a consultar
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {hello.isPending ? (
            <div className="space-y-3" aria-label="Cargando respuesta">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : hello.isError ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>Error al consultar la API</AlertTitle>
              <AlertDescription>
                {hello.error instanceof ApiError
                  ? hello.error.message
                  : "No se pudo consultar el endpoint."}
              </AlertDescription>
            </Alert>
          ) : hello.data ? (
            <>
              <Alert>
                <ShieldCheckIcon />
                <AlertTitle>{hello.data.message}</AlertTitle>
                <AlertDescription>
                  Respuesta recibida correctamente desde la API.
                </AlertDescription>
              </Alert>
              <Separator className="my-4" />
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Mensaje</dt>
                  <dd className="mt-0.5 text-sm font-medium">
                    {hello.data.message}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Usuario</dt>
                  <dd className="mt-0.5 text-sm font-medium">
                    {hello.data.username}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">API</dt>
                  <dd className="mt-0.5 truncate font-mono text-sm">
                    {API_URL}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Timestamp</dt>
                  <dd className="mt-0.5 text-sm font-medium">
                    {formatDateTime(hello.data.timestamp)}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <UsersIcon className="size-4" /> Usuarios
            </CardDescription>
            <CardTitle className="text-2xl">
              {stats.isPending ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                (stats.data?.totalUsers ?? "—")
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <PackageIcon className="size-4" /> Productos activos
            </CardDescription>
            <CardTitle className="text-2xl">
              {stats.isPending ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                (stats.data?.totalProducts ?? "—")
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <ShoppingCartIcon className="size-4" /> Pedidos
            </CardDescription>
            <CardTitle className="text-2xl">
              {stats.isPending ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                (stats.data?.totalOrders ?? "—")
              )}
            </CardTitle>
            {!stats.isPending && stats.data ? (
              <p className="text-xs text-muted-foreground">
                {stats.data.pendingOrders} pendiente
                {stats.data.pendingOrders === 1 ? "" : "s"}
              </p>
            ) : null}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <CircleCheckIcon className="size-4" /> Ingresos
            </CardDescription>
            <CardTitle className="text-2xl">
              {stats.isPending ? (
                <Skeleton className="h-7 w-24" />
              ) : stats.data ? (
                formatCurrency(stats.data.totalRevenue)
              ) : (
                "—"
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accesos rápidos</CardTitle>
          <CardDescription>
            Atajos a las secciones principales del panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <link.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{link.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </div>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
