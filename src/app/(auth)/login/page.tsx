import { Suspense } from "react";
import type { Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[26rem] w-full max-w-md" />}>
      <LoginForm />
    </Suspense>
  );
}
