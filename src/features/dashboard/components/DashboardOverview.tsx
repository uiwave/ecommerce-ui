"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  PackageIcon,
  ServerIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/useAuth";
import { API_URL } from "@/lib/config";
import { formatDateTime, formatRole, getInitials } from "@/lib/format";

const MODULES = [
  {
    title: "Productos",
    icon: PackageIcon,
    description: "Gestión del catálogo, precios y stock.",
  },
  {
    title: "Pedidos",
    icon: ShoppingCartIcon,
    description: "Seguimiento de órdenes y estados de envío.",
  },
  {
    title: "Clientes",
    icon: UsersIcon,
    description: "Consulta de usuarios registrados y sus roles.",
  },
];

export function DashboardOverview() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {user.fullName.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Este es el panel de administración de Uiwave Commerce.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                {getInitials(user.fullName, user.email)}
              </span>
              <div className="min-w-0">
                <CardTitle className="truncate">{user.fullName}</CardTitle>
                <CardDescription className="truncate">
                  {user.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">Rol</dt>
                <dd className="mt-1">
                  <Badge>{formatRole(user.role)}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Miembro desde</dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDateTime(user.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">ID de usuario</dt>
                <dd className="mt-1 font-mono text-sm font-medium">#{user.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ServerIcon className="size-4" /> Estado del sistema
            </CardTitle>
            <CardDescription>
              Conexión con el backend de Spring Boot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">API</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="size-2 rounded-full bg-emerald-500" />
                Operativa
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Endpoint</span>
              <code className="max-w-[60%] truncate rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {API_URL}
              </code>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Sesión</span>
              <span className="font-medium">JWT válido</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/dashboard/sistema">
                Ver panel del sistema <ArrowRightIcon />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Módulos del e-commerce
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ title, icon: Icon, description }) => (
            <Card key={title}>
              <CardHeader>
                <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4" />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                <CardAction>
                  <Badge variant="secondary">Próximamente</Badge>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
