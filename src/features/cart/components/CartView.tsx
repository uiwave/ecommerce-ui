"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRightIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cartApi } from "@/lib/api/cart.api";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/format";
import type { CartResponse } from "@/lib/types";

export function CartView() {
  const queryClient = useQueryClient();

  const cart = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.get,
  });

  const updateItem = useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => cartApi.updateItem(itemId, quantity),
    onSuccess: (data: CartResponse) => queryClient.setQueryData(["cart"], data),
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No se pudo actualizar el carrito",
      ),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: number) => cartApi.removeItem(itemId),
    onSuccess: (data: CartResponse) => queryClient.setQueryData(["cart"], data),
    onError: () => toast.error("No se pudo quitar el producto"),
  });

  const clearCart = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      queryClient.setQueryData<CartResponse>(["cart"], {
        items: [],
        totalItems: 0,
        total: 0,
      });
      toast.success("Carrito vaciado");
    },
    onError: () => toast.error("No se pudo vaciar el carrito"),
  });

  if (cart.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (cart.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudo cargar el carrito</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          {cart.error instanceof ApiError
            ? cart.error.message
            : "Ocurrió un error inesperado."}
          <Button size="sm" variant="outline" onClick={() => void cart.refetch()}>
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const data = cart.data;

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
        <ShoppingCartIcon className="size-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">Tu carrito está vacío</p>
          <p className="text-sm text-muted-foreground">
            Agrega productos del catálogo para comenzar.
          </p>
        </div>
        <Button asChild>
          <Link href="/productos">
            Ver productos <ArrowRightIcon />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Carrito ({data.totalItems})
          </h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={clearCart.isPending}>
                <Trash2Icon /> Vaciar carrito
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Vaciar el carrito?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se quitarán todos los productos. Esta acción no se puede
                  deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => clearCart.mutate()}>
                  Vaciar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {data.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-center gap-4">
              <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <PackageIcon className="size-6" />
                  </div>
                )}
              </div>

              <div className="min-w-40 flex-1">
                <Link
                  href={`/productos/${item.slug}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.unitPrice)} c/u
                </p>
              </div>

              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar una unidad"
                  disabled={item.quantity <= 1 || updateItem.isPending}
                  onClick={() =>
                    updateItem.mutate({
                      itemId: item.id,
                      quantity: item.quantity - 1,
                    })
                  }
                >
                  <MinusIcon />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Agregar una unidad"
                  disabled={
                    item.quantity >= item.stock || updateItem.isPending
                  }
                  onClick={() =>
                    updateItem.mutate({
                      itemId: item.id,
                      quantity: item.quantity + 1,
                    })
                  }
                >
                  <PlusIcon />
                </Button>
              </div>

              <div className="w-24 text-right font-semibold">
                {formatCurrency(item.subtotal)}
              </div>

              <Button
                variant="ghost"
                size="icon"
                aria-label={`Quitar ${item.name}`}
                disabled={removeItem.isPending}
                onClick={() => removeItem.mutate(item.id)}
              >
                <Trash2Icon />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>
            {data.totalItems} producto{data.totalItems === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span className="text-muted-foreground">Por coordinar</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" disabled={data.items.length === 0}>
            <Link href="/checkout">
              Continuar al checkout <ArrowRightIcon />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
