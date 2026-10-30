"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon, Loader2Icon, LockIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { checkoutSchema, type CheckoutValues } from "@/features/checkout/schema";
import { cartApi } from "@/lib/api/cart.api";
import { ApiError } from "@/lib/api/errors";
import { ordersApi } from "@/lib/api/orders.api";
import { formatCurrency } from "@/lib/format";
import type { CartResponse, OrderResponse } from "@/lib/types";

export function CheckoutView() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const cart = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.get,
  });

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Perú",
    },
  });

  const checkout = useMutation({
    mutationFn: (values: CheckoutValues) => ordersApi.checkout(values),
    onSuccess: (order: OrderResponse) => {
      queryClient.setQueryData<CartResponse>(["cart"], {
        items: [],
        totalItems: 0,
        total: 0,
      });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`Pedido #${order.id} creado correctamente`);
      router.push(`/pedidos/${order.id}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No se pudo crear el pedido",
      );
    },
  });

  if (cart.isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-125 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!cart.data || cart.data.items.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="text-muted-foreground">
          Tu carrito está vacío. Agrega productos antes de continuar.
        </p>
        <Button asChild>
          <Link href="/productos">Ver productos</Link>
        </Button>
      </div>
    );
  }

  const data = cart.data;
  const {
    formState: { errors, isSubmitting },
  } = form;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/carrito">
            <ArrowLeftIcon /> Volver al carrito
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            Completa los datos de envío para confirmar tu pedido.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos de envío</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              id="checkout-form"
              onSubmit={form.handleSubmit((values) => checkout.mutate(values))}
              noValidate
            >
              <FieldGroup>
                <Field data-invalid={Boolean(errors.fullName)}>
                  <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
                  <Input
                    id="fullName"
                    placeholder="Quién recibe el pedido"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.fullName)}
                    {...form.register("fullName")}
                  />
                  <FieldError errors={[errors.fullName]} />
                </Field>

                <Field data-invalid={Boolean(errors.phone)}>
                  <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                  <Input
                    id="phone"
                    placeholder="+51 999 999 999"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                    {...form.register("phone")}
                  />
                  <FieldError errors={[errors.phone]} />
                </Field>

                <Field data-invalid={Boolean(errors.address)}>
                  <FieldLabel htmlFor="address">Dirección</FieldLabel>
                  <Input
                    id="address"
                    placeholder="Av. Ejemplo 123, Dpto. 4"
                    autoComplete="street-address"
                    aria-invalid={Boolean(errors.address)}
                    {...form.register("address")}
                  />
                  <FieldError errors={[errors.address]} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.city)}>
                    <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                    <Input
                      id="city"
                      placeholder="Cusco"
                      autoComplete="address-level2"
                      aria-invalid={Boolean(errors.city)}
                      {...form.register("city")}
                    />
                    <FieldError errors={[errors.city]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.postalCode)}>
                    <FieldLabel htmlFor="postalCode">Código postal</FieldLabel>
                    <Input
                      id="postalCode"
                      placeholder="08000"
                      autoComplete="postal-code"
                      aria-invalid={Boolean(errors.postalCode)}
                      {...form.register("postalCode")}
                    />
                    <FieldError errors={[errors.postalCode]} />
                  </Field>
                </div>

                <Field data-invalid={Boolean(errors.country)}>
                  <FieldLabel htmlFor="country">País</FieldLabel>
                  <Input
                    id="country"
                    autoComplete="country-name"
                    aria-invalid={Boolean(errors.country)}
                    {...form.register("country")}
                  />
                  <FieldError errors={[errors.country]} />
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              form="checkout-form"
              className="w-full"
              disabled={isSubmitting || checkout.isPending}
            >
              {checkout.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <LockIcon />
              )}
              Confirmar pedido · {formatCurrency(data.total)}
            </Button>
          </CardFooter>
        </Card>

        <Alert>
          <AlertTitle>Pago simulado</AlertTitle>
          <AlertDescription>
            Este proyecto no procesa pagos reales. El pedido se crea como
            <strong> pendiente</strong> y un administrador lo marca como pagado.
          </AlertDescription>
        </Alert>
      </div>

      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Tu pedido</CardTitle>
          <CardDescription>
            {data.totalItems} producto{data.totalItems === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="line-clamp-1 font-medium">{item.name}</span>
                <span className="text-muted-foreground"> × {item.quantity}</span>
              </span>
              <span className="shrink-0">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
