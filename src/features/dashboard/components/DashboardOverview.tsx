"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  DollarSignIcon,
  PackageIcon,
  ShoppingCartIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/useAuth";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { adminApi } from "@/lib/api/admin.api";
import { formatCurrency, formatDateTime, formatRole } from "@/lib/format";

const weekdayFormatter = new Intl.DateTimeFormat("es", { weekday: "short" });

const QUICK_LINKS = [
  {
    title: "Productos",
    description: "Catálogo, precios y stock",
    href: "/dashboard/productos",
    icon: PackageIcon,
  },
  {
    title: "Pedidos",
    description: "Pagos, envíos y estados",
    href: "/dashboard/pedidos",
    icon: ShoppingCartIcon,
  },
  {
    title: "Clientes",
    description: "Usuarios y roles",
    href: "/dashboard/clientes",
    icon: UsersIcon,
  },
];

export function DashboardOverview() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.stats,
    enabled: isAdmin,
  });

  const recentOrders = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: () => adminApi.orders("ALL", "", 0, 5),
    enabled: isAdmin,
  });

  if (!user) return null;

  const cards = [
    {
      label: "Ingresos",
      value: stats.data ? formatCurrency(stats.data.totalRevenue) : null,
      hint: "Pedidos no cancelados",
      icon: DollarSignIcon,
    },
    {
      label: "Pedidos",
      value: stats.data ? String(stats.data.totalOrders) : null,
      hint: `${stats.data?.pendingOrders ?? 0} pendientes`,
      icon: ShoppingCartIcon,
    },
    {
      label: "Productos",
      value: stats.data ? String(stats.data.totalProducts) : null,
      hint: "Activos en catálogo",
      icon: PackageIcon,
    },
    {
      label: "Usuarios",
      value: stats.data ? String(stats.data.totalUsers) : null,
      hint: "Registrados",
      icon: UsersIcon,
    },
  ];

  const sales = stats.data?.salesByDay ?? [];
  const maxRevenue = Math.max(
    ...sales.map((day) => Number(day.revenue)),
    0,
  );
  const lowStock = stats.data?.lowStock ?? [];
  const orders = recentOrders.data?.content ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {user.fullName.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen general de Uiwave Commerce.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Icon className="size-4" /> {label}
              </CardDescription>
              <CardTitle className="text-2xl">
                {value ?? <Skeleton className="h-7 w-24" />}
              </CardTitle>
              <CardDescription className="text-xs">{hint}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventas de los últimos 7 días</CardTitle>
            <CardDescription>
              Ingresos por día de pedidos no cancelados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.isPending ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="flex h-40 items-end gap-2">
                {sales.map((day) => {
                  const revenue = Number(day.revenue);
                  const height =
                    maxRevenue === 0
                      ? 3
                      : Math.max(3, Math.round((revenue / maxRevenue) * 100));

                  return (
                    <div
                      key={day.date}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div
                        className="w-full rounded-t-md bg-primary/70 transition-colors group-hover:bg-primary"
                        style={{ height: `${height}%` }}
                        title={`${day.date}: ${formatCurrency(revenue)} · ${day.orders} pedidos`}
                      />
                      <span className="text-[0.65rem] text-muted-foreground capitalize">
                        {weekdayFormatter.format(
                          new Date(`${day.date}T00:00:00`),
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlertIcon className="size-4" /> Stock bajo
            </CardTitle>
            <CardDescription>Productos con 5 unidades o menos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.isPending && <Skeleton className="h-24 w-full" />}
            {!stats.isPending && lowStock.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todo el stock está en orden.
              </p>
            )}
            {lowStock.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="min-w-0 truncate">{product.name}</span>
                <Badge
                  variant={product.stock === 0 ? "destructive" : "secondary"}
                >
                  {product.stock}
                </Badge>
              </div>
            ))}
            <Link
              href="/dashboard/productos"
              className="flex items-center gap-1 pt-1 text-sm font-medium text-primary hover:underline"
            >
              Gestionar catálogo <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pedidos recientes</CardTitle>
            <CardDescription>Últimos 5 pedidos registrados.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.isPending ? (
              <Skeleton className="h-40 w-full" />
            ) : orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Todavía no hay pedidos.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          #{order.id}
                        </TableCell>
                        <TableCell className="max-w-40 truncate text-sm">
                          {order.userEmail}
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <Link
              href="/dashboard/pedidos"
              className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver todos los pedidos <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="size-4" /> Tu cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{user.fullName}</p>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Miembro desde {formatDateTime(user.createdAt)}
              </p>
              <Badge className="mt-2">{formatRole(user.role)}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accesos rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QUICK_LINKS.map(({ title, description, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {description}
                    </span>
                  </span>
                  <ArrowRightIcon className="ml-auto size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
