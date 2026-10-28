"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlertIcon, RefreshCwIcon, ShieldCheckIcon } from "lucide-react";

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
import { ApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/format";
import type { AdminHelloResponse } from "@/lib/types";

function getErrorMessage(caught: unknown): string {
  return caught instanceof ApiError
    ? caught.message
    : "No se pudo consultar el endpoint.";
}

export function AdminView() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [data, setData] = useState<AdminHelloResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHello = useCallback(
    (): Promise<AdminHelloResponse> => authApi.adminHello(),
    [],
  );

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    fetchHello()
      .then((response) => {
        if (cancelled) return;
        setData(response);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setData(null);
        setError(getErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, fetchHello]);

  async function handleRefresh() {
    setIsRefreshing(true);

    try {
      setData(await fetchHello());
      setError(null);
    } catch (caught) {
      setData(null);
      setError(getErrorMessage(caught));
    } finally {
      setIsRefreshing(false);
    }
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

  const isBusy = isLoading || isRefreshing;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consumo de endpoints protegidos por rol ADMIN.
          </p>
        </div>
        <Badge className="gap-1">
          <ShieldCheckIcon /> ADMIN
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-sm">
            GET /api/admin/hello
          </CardTitle>
          <CardDescription>
            Endpoint de prueba exclusivo para administradores, protegido por
            Spring Security.
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={isBusy}
            >
              <RefreshCwIcon className={isBusy ? "animate-spin" : undefined} />
              Volver a consultar
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" aria-label="Cargando respuesta">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>Error al consultar el endpoint</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : data ? (
            <>
              <Alert>
                <ShieldCheckIcon />
                <AlertTitle>{data.message}</AlertTitle>
                <AlertDescription>
                  Respuesta recibida correctamente desde la API.
                </AlertDescription>
              </Alert>
              <Separator className="my-4" />
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Mensaje</dt>
                  <dd className="mt-0.5 text-sm font-medium">{data.message}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Usuario</dt>
                  <dd className="mt-0.5 text-sm font-medium">{data.username}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Timestamp</dt>
                  <dd className="mt-0.5 text-sm font-medium">
                    {formatDateTime(data.timestamp)}
                  </dd>
                </div>
              </dl>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
