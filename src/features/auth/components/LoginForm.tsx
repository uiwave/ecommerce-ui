"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CircleAlertIcon, Loader2Icon } from "lucide-react";

import { PasswordInput } from "@/components/auth/PasswordInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/useAuth";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { ApiError } from "@/lib/api/errors";

export function LoginForm() {
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Accede con tu cuenta para gestionar tu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {serverError && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

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
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <PasswordInput
                id="password"
                placeholder="Tu contraseña"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2Icon className="animate-spin" />
              ) : null}
              Iniciar sesión
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        ¿No tienes cuenta?
        <Link
          href="/register"
          className="ml-1 font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Crear una
        </Link>
      </CardFooter>
    </Card>
  );
}
