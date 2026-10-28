"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/useAuth";
import {
  registerSchema,
  type RegisterValues,
} from "@/features/auth/schemas";
import { ApiError } from "@/lib/api/errors";

const FIELD_NAMES = ["fullName", "email", "password"] as const;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setServerError(null);

    try {
      await registerUser(values);
      toast.success("Cuenta creada. ¡Bienvenido a Uiwave!");
      router.replace("/");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        let hasFieldError = false;

        if (error.details) {
          for (const field of FIELD_NAMES) {
            const message = error.details[field];
            if (message) {
              form.setError(field, { type: "server", message });
              hasFieldError = true;
            }
          }
        }

        if (!hasFieldError) {
          setServerError(
            error.status === 409
              ? "Ya existe una cuenta registrada con ese email."
              : error.message,
          );
        }
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
        <CardTitle className="text-xl">Crear cuenta</CardTitle>
        <CardDescription>
          Regístrate para acceder al área de cliente.
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

            <Field data-invalid={Boolean(errors.fullName)}>
              <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
              <Input
                id="fullName"
                type="text"
                placeholder="Nombre y apellidos"
                autoComplete="name"
                autoFocus
                aria-invalid={Boolean(errors.fullName)}
                {...form.register("fullName")}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <PasswordInput
                id="password"
                placeholder="Crea una contraseña"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...form.register("password")}
              />
              <FieldDescription>
                Debe tener entre 8 y 72 caracteres.
              </FieldDescription>
              <FieldError errors={[errors.password]} />
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2Icon className="animate-spin" />
              ) : null}
              Crear cuenta
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?
        <Link
          href="/login"
          className="ml-1 font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Iniciar sesión
        </Link>
      </CardFooter>
    </Card>
  );
}
