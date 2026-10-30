"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { CircleAlertIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi, type SiteSettingPayload } from "@/lib/api/admin.api";
import { ApiError } from "@/lib/api/errors";
import type { SiteSettingResponse } from "@/lib/types";

const CURRENCIES = ["PEN", "USD", "EUR"] as const;

const settingsSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(1, "El nombre del sitio es obligatorio")
    .max(120, "Máximo 120 caracteres"),
  logoUrl: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .refine(
      (value) =>
        value === "" ||
        (z.url().safeParse(value).success && /^https?:\/\//i.test(value)),
      "La URL del logo debe ser http(s) válida",
    ),
  contactEmail: z
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "El email no tiene un formato válido",
    ),
  contactPhone: z.string().trim().max(30, "Máximo 30 caracteres"),
  currency: z.enum(CURRENCIES),
  lowStockThreshold: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), {
      message: "Indica un entero mayor o igual a 0",
    }),
  freeShippingThreshold: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (!Number.isNaN(Number(value)) && Number(value) >= 0),
      { message: "Importe inválido" },
    ),
  taxRate: z
    .string()
    .trim()
    .min(1, "La tasa de impuesto es obligatoria")
    .refine(
      (value) =>
        !Number.isNaN(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= 100,
      { message: "Debe estar entre 0 y 100" },
    ),
  shippingFlatRate: z
    .string()
    .trim()
    .min(1, "La tarifa de envío es obligatoria")
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) >= 0,
      { message: "Importe inválido" },
    ),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const FIELD_NAMES = [
  "siteName",
  "logoUrl",
  "contactEmail",
  "contactPhone",
  "currency",
  "lowStockThreshold",
  "freeShippingThreshold",
  "taxRate",
  "shippingFlatRate",
] as const;

function toFormValues(setting: SiteSettingResponse): SettingsFormValues {
  return {
    siteName: setting.siteName,
    logoUrl: setting.logoUrl ?? "",
    contactEmail: setting.contactEmail ?? "",
    contactPhone: setting.contactPhone ?? "",
    currency: (CURRENCIES as readonly string[]).includes(setting.currency)
      ? (setting.currency as SettingsFormValues["currency"])
      : "PEN",
    lowStockThreshold: String(setting.lowStockThreshold),
    freeShippingThreshold:
      setting.freeShippingThreshold == null
        ? ""
        : String(setting.freeShippingThreshold),
    taxRate: String(setting.taxRate),
    shippingFlatRate: String(setting.shippingFlatRate),
  };
}

export function SettingsView() {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const settings = useQuery({
    queryKey: ["admin-settings"],
    queryFn: adminApi.settings,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "",
      logoUrl: "",
      contactEmail: "",
      contactPhone: "",
      currency: "PEN",
      lowStockThreshold: "5",
      freeShippingThreshold: "",
      taxRate: "0",
      shippingFlatRate: "0",
    },
  });

  const currency = useWatch({ control: form.control, name: "currency" });

  useEffect(() => {
    if (settings.data) {
      form.reset(toFormValues(settings.data));
    }
  }, [settings.data, form]);

  const saveSettings = useMutation({
    mutationFn: (values: SettingsFormValues) => {
      const payload: SiteSettingPayload = {
        siteName: values.siteName,
        logoUrl: values.logoUrl === "" ? null : values.logoUrl,
        contactEmail: values.contactEmail === "" ? null : values.contactEmail,
        contactPhone: values.contactPhone === "" ? null : values.contactPhone,
        currency: values.currency,
        lowStockThreshold: Number(values.lowStockThreshold),
        freeShippingThreshold:
          values.freeShippingThreshold === ""
            ? null
            : Number(values.freeShippingThreshold),
        taxRate: Number(values.taxRate),
        shippingFlatRate: Number(values.shippingFlatRate),
      };

      return adminApi.updateSettings(payload);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin-settings"], updated);
      form.reset(toFormValues(updated));
      setServerError(null);
      toast.success("Configuración guardada correctamente");
    },
    onError: (error) => {
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
    },
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  if (settings.isPending) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Configuración
          </h1>
          <p className="text-sm text-muted-foreground">
            Ajustes generales del sitio.
          </p>
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (settings.isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Configuración
          </h1>
          <p className="text-sm text-muted-foreground">
            Ajustes generales del sitio.
          </p>
        </div>
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>
            {settings.error instanceof ApiError
              ? settings.error.message
              : "No se pudo cargar la configuración."}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void settings.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Ajustes generales del sitio, moneda, envíos e impuestos.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit((values) => saveSettings.mutate(values))}
        noValidate
        className="space-y-6"
      >
        {serverError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identidad del sitio</CardTitle>
            <CardDescription>
              Nombre, logo y datos de contacto que representan a la tienda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.siteName)}>
                <FieldLabel htmlFor="site-name">Nombre del sitio</FieldLabel>
                <Input
                  id="site-name"
                  aria-invalid={Boolean(errors.siteName)}
                  {...form.register("siteName")}
                />
                <FieldError errors={[errors.siteName]} />
              </Field>

              <Field data-invalid={Boolean(errors.logoUrl)}>
                <FieldLabel htmlFor="logo-url">URL del logo</FieldLabel>
                <Input
                  id="logo-url"
                  placeholder="https://…"
                  aria-invalid={Boolean(errors.logoUrl)}
                  {...form.register("logoUrl")}
                />
                <FieldDescription>
                  Opcional. Debe ser una URL http(s) válida.
                </FieldDescription>
                <FieldError errors={[errors.logoUrl]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.contactEmail)}>
                  <FieldLabel htmlFor="contact-email">
                    Email de contacto
                  </FieldLabel>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="hola@tienda.com"
                    aria-invalid={Boolean(errors.contactEmail)}
                    {...form.register("contactEmail")}
                  />
                  <FieldError errors={[errors.contactEmail]} />
                </Field>

                <Field data-invalid={Boolean(errors.contactPhone)}>
                  <FieldLabel htmlFor="contact-phone">
                    Teléfono de contacto
                  </FieldLabel>
                  <Input
                    id="contact-phone"
                    placeholder="+51 999 999 999"
                    aria-invalid={Boolean(errors.contactPhone)}
                    {...form.register("contactPhone")}
                  />
                  <FieldError errors={[errors.contactPhone]} />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Moneda y umbrales</CardTitle>
            <CardDescription>
              Moneda de la tienda y umbral para alertas de stock bajo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.currency)}>
                  <FieldLabel>Moneda</FieldLabel>
                  <Select
                    value={currency}
                    onValueChange={(value) =>
                      form.setValue(
                        "currency",
                        value as SettingsFormValues["currency"],
                        { shouldValidate: true },
                      )
                    }
                  >
                    <SelectTrigger aria-label="Moneda">
                      <SelectValue placeholder="Moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PEN">PEN · Sol peruano</SelectItem>
                      <SelectItem value="USD">USD · Dólar</SelectItem>
                      <SelectItem value="EUR">EUR · Euro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.currency]} />
                </Field>

                <Field data-invalid={Boolean(errors.lowStockThreshold)}>
                  <FieldLabel htmlFor="low-stock-threshold">
                    Umbral de stock bajo
                  </FieldLabel>
                  <Input
                    id="low-stock-threshold"
                    inputMode="numeric"
                    aria-invalid={Boolean(errors.lowStockThreshold)}
                    {...form.register("lowStockThreshold")}
                  />
                  <FieldDescription>
                    Productos con stock igual o menor se marcan como bajos.
                  </FieldDescription>
                  <FieldError errors={[errors.lowStockThreshold]} />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Envío e impuestos</CardTitle>
            <CardDescription>
              Tarifas aplicadas a los pedidos de la tienda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  data-invalid={Boolean(errors.freeShippingThreshold)}
                >
                  <FieldLabel htmlFor="free-shipping-threshold">
                    Envío gratis desde
                  </FieldLabel>
                  <Input
                    id="free-shipping-threshold"
                    inputMode="decimal"
                    placeholder="Opcional"
                    aria-invalid={Boolean(errors.freeShippingThreshold)}
                    {...form.register("freeShippingThreshold")}
                  />
                  <FieldError errors={[errors.freeShippingThreshold]} />
                </Field>

                <Field data-invalid={Boolean(errors.taxRate)}>
                  <FieldLabel htmlFor="tax-rate">Impuesto (%)</FieldLabel>
                  <Input
                    id="tax-rate"
                    inputMode="decimal"
                    aria-invalid={Boolean(errors.taxRate)}
                    {...form.register("taxRate")}
                  />
                  <FieldError errors={[errors.taxRate]} />
                </Field>

                <Field data-invalid={Boolean(errors.shippingFlatRate)}>
                  <FieldLabel htmlFor="shipping-flat-rate">
                    Tarifa de envío
                  </FieldLabel>
                  <Input
                    id="shipping-flat-rate"
                    inputMode="decimal"
                    aria-invalid={Boolean(errors.shippingFlatRate)}
                    {...form.register("shippingFlatRate")}
                  />
                  <FieldError errors={[errors.shippingFlatRate]} />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SaveIcon />
            )}
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
