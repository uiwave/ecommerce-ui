"use client";

import Link from "next/link";
import { PackageIcon, ShoppingBagIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddToCart } from "@/features/cart/useAddToCart";
import { formatCurrency } from "@/lib/format";
import type { ProductResponse } from "@/lib/types";

export function ProductCard({ product }: { product: ProductResponse }) {
  const { add, isPending } = useAddToCart();
  const hasOffer =
    product.comparePrice != null && product.comparePrice > product.price;

  return (
    <Card className="group flex flex-col overflow-hidden pt-0">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <PackageIcon className="size-10" />
          </div>
        )}
        {hasOffer && (
          <Badge className="absolute top-2 left-2">Oferta</Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Agotado
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-1.5">
        <span className="text-xs tracking-wide text-muted-foreground uppercase">
          {product.categoryName}
        </span>
        <Link
          href={`/productos/${product.slug}`}
          className="line-clamp-2 font-medium hover:underline"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-lg font-semibold">
              {formatCurrency(product.price)}
            </p>
            {hasOffer && (
              <p className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.comparePrice as number)}
              </p>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => add(product.id)}
            disabled={product.stock === 0 || isPending}
          >
            <ShoppingBagIcon />
            Agregar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
