"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/useAuth";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { ApiError } from "@/lib/api/errors";
import { cn } from "cn";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const nextParam = searchParams.get("next");
  const redirectTo =
    nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  async function onSubmit(values: LoginValues) {
    setServerError(null);

    try {
      await login(values);
      toast.success("Bienvenido de nuevo");
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(
          error.status === 401
            ? "Credenciales inválidas. Revisa tu email y contraseña."
            : error.message,
        );
      } else {
        setServerError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    }
  }

  const {
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            autoFocus
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" placeholder="Tu contraseña" autoComplete="current-password" aria-invalid={Boolean(errors.password)}
            {...form.register("password")} />
        </Field>
        <Field>
          {serverError ? (
            <Alert variant="destructive" className="mb-2">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando…" : "Iniciar sesión"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
