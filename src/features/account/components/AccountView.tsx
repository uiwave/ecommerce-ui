"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarDaysIcon,
  Loader2Icon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/features/auth/useAuth";
import { formatDateTime, formatRole, getInitials } from "@/lib/format";

export function AccountView() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Datos de tu perfil obtenidos desde{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            GET /api/auth/me
          </code>
          .
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {getInitials(user.fullName, user.email)}
            </span>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">{user.fullName}</CardTitle>
              <CardDescription className="truncate">
                {user.email}
              </CardDescription>
              <Badge
                variant={user.role === "ADMIN" ? "default" : "secondary"}
                className="mt-1.5"
              >
                {formatRole(user.role)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <dl className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <UserRoundIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Nombre completo</dt>
                <dd className="truncate text-sm font-medium">{user.fullName}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="truncate text-sm font-medium">{user.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Rol</dt>
                <dd className="text-sm font-medium">{formatRole(user.role)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Miembro desde</dt>
                <dd className="text-sm font-medium">
                  {formatDateTime(user.createdAt)}
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Sesión verificada mediante JWT
          </p>
          <Button
            variant="destructive"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <LogOutIcon />
            )}
            Cerrar sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
