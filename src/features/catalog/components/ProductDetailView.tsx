"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  ShoppingBagIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart } from "@/features/cart/useAddToCart";
import { catalogApi } from "@/lib/api/catalog.api";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/format";

export function ProductDetailView({ slug }: { slug: string }) {
  const [quantity, setQuantity] = useState(1);
  const { add, isPending } = useAddToCart();

  const product = useQuery({
    queryKey: ["product", slug],
    queryFn: () => catalogApi.product(slug),
  });

  if (product.isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  if (product.isError || !product.data) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Producto no disponible</AlertTitle>
          <AlertDescription>
            {product.error instanceof ApiError
              ? product.error.message
              : "No se pudo cargar el producto."}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/productos">
            <ArrowLeftIcon /> Volver al catálogo
          </Link>
        </Button>
      </div>
    );
  }

  const item = product.data;
  const hasOffer = item.comparePrice != null && item.comparePrice > item.price;
  const isOutOfStock = item.stock === 0;
  const maxQuantity = Math.max(item.stock, 1);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link href="/productos">
          <ArrowLeftIcon /> Volver al catálogo
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <PackageIcon className="size-16" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.categoryName}</Badge>
            {hasOffer && <Badge>Oferta</Badge>}
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            {item.name}
          </h1>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold">
              {formatCurrency(item.price)}
            </span>
            {hasOffer && (
              <span className="pb-1 text-base text-muted-foreground line-through">
                {formatCurrency(item.comparePrice as number)}
              </span>
            )}
          </div>

          <p className="leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          <p className="text-sm">
            {isOutOfStock ? (
              <span className="font-medium text-destructive">Agotado</span>
            ) : (
              <span className="text-muted-foreground">
                {item.stock} unidades disponibles
              </span>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar una unidad"
                disabled={quantity <= 1}
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <MinusIcon />
              </Button>
              <span className="w-8 text-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Agregar una unidad"
                disabled={quantity >= maxQuantity}
                onClick={() =>
                  setQuantity((current) => Math.min(maxQuantity, current + 1))
                }
              >
                <PlusIcon />
              </Button>
            </div>

            <Button
              size="lg"
              disabled={isOutOfStock || isPending}
              onClick={() => add(item.id, quantity)}
            >
              <ShoppingBagIcon />
              {isOutOfStock ? "Agotado" : "Agregar al carrito"}
            </Button>
          </div>

          {item.sku && (
            <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
          )}
        </div>
      </div>
    </div>
  );
}
