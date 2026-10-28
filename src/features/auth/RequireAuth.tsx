"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "./useAuth";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Guarda de rutas privadas: espera la restauración de la sesión y redirige
 * a /login (conservando el destino) cuando no hay usuario autenticado.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-6 h-72 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
