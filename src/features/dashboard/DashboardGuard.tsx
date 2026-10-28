"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { useAuth } from "@/features/auth/useAuth";

function AdminOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== "ADMIN") {
      toast.error("Acceso restringido: se requiere rol administrador");
      router.replace("/cuenta");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-[60vh] flex-col gap-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Protege todo el panel: exige sesión iniciada y rol ADMIN.
 * - Sin sesión → RequireAuth redirige a /login?next=...
 * - Con rol USER → redirige a /cuenta
 */
export function DashboardGuard({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AdminOnly>{children}</AdminOnly>
    </RequireAuth>
  );
}
