"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/useAuth";
import { cartApi } from "@/lib/api/cart.api";

export function CartButton() {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.get,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  const count = data?.totalItems ?? 0;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={`Carrito (${count} productos)`}
    >
      <Link href="/carrito">
        <ShoppingCartIcon />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
