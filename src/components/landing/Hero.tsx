"use client";

import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { formatRole, getInitials } from "@/lib/format";

export function Hero() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:py-28">
        <Badge variant="outline" className="mb-5 gap-1.5">
          <ShieldCheckIcon /> Autenticación JWT + roles
        </Badge>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Compra y gestiona tu cuenta con total seguridad
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Interfaz conectada a la API de ecommerce: inicia sesión, revisa tu
          perfil y accede al panel de administración según tu rol.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-36" />
            </>
          ) : isAuthenticated && user ? (
            <>
              <Button asChild size="lg" className="h-10 px-4">
                <Link href="/cuenta">
                  Ir a mi cuenta <ArrowRightIcon />
                </Link>
              </Button>
              {user.role === "ADMIN" && (
                <Button asChild variant="outline" size="lg" className="h-10 px-4">
                  <Link href="/admin">Panel de administración</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button asChild size="lg" className="h-10 px-4">
                <Link href="/register">
                  Crear cuenta <ArrowRightIcon />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-10 px-4">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            </>
          )}
        </div>

        {isAuthenticated && user && (
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {getInitials(user.fullName, user.email)}
            </span>
            <span>
              Sesión iniciada como{" "}
              <span className="font-medium text-foreground">{user.email}</span>
            </span>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
              {formatRole(user.role)}
            </Badge>
          </div>
        )}
      </div>
    </section>
  );
}
