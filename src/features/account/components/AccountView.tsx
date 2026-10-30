"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  CalendarDaysIcon,
  CircleAlertIcon,
  Loader2Icon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  updateProfileSchema,
  type UpdateProfileValues,
} from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/lib/api/errors";
import { formatDateTime, formatRole, getInitials } from "@/lib/format";

const FIELD_NAMES = ["fullName", "imageUrl"] as const;

export function AccountView() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      imageUrl: user?.imageUrl ?? "",
    },
  });

  const imagePreview = useWatch({ control: form.control, name: "imageUrl" });

  if (!user) return null;

  const initials = getInitials(user.fullName, user.email);

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

  async function onSubmit(values: UpdateProfileValues) {
    setServerError(null);

    try {
      await updateProfile({
        fullName: values.fullName,
        imageUrl: values.imageUrl ?? "",
      });
      toast.success("Perfil actualizado correctamente");
      form.reset({ fullName: values.fullName, imageUrl: values.imageUrl ?? "" });
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
          setServerError(error.message);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tus datos de perfil.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user.imageUrl || undefined} alt={user.fullName} />
              <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Editar perfil</CardTitle>
          <CardDescription>
            Actualiza tu nombre y la imagen que se muestra en tu cuenta.
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

              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarImage
                    src={imagePreview || undefined}
                    alt="Vista previa del avatar"
                  />
                  <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Field data-invalid={Boolean(errors.imageUrl)}>
                    <FieldLabel htmlFor="imageUrl">URL de la imagen</FieldLabel>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://ejemplo.com/avatar.jpg"
                      autoComplete="url"
                      aria-invalid={Boolean(errors.imageUrl)}
                      {...form.register("imageUrl")}
                    />
                    <FieldDescription>
                      Opcional. Debe ser una URL http(s) válida.
                    </FieldDescription>
                    <FieldError errors={[errors.imageUrl]} />
                  </Field>
                </div>
              </div>

              <Field data-invalid={Boolean(errors.fullName)}>
                <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nombre y apellidos"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                  {...form.register("fullName")}
                />
                <FieldError errors={[errors.fullName]} />
              </Field>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2Icon className="animate-spin" />
                ) : null}
                Guardar cambios
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
