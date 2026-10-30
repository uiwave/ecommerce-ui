"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/useAuth";
import { cartApi } from "@/lib/api/cart.api";
import { ApiError } from "@/lib/api/errors";
import type { CartResponse } from "@/lib/types";

/** Agrega productos al carrito del servidor; si no hay sesión, manda al login. */
export function useAddToCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => cartApi.addItem(productId, quantity),
    onSuccess: (cart: CartResponse) => {
      queryClient.setQueryData(["cart"], cart);
      toast.success("Producto agregado al carrito");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No se pudo agregar el producto al carrito",
      );
    },
  });

  function add(productId: number, quantity = 1) {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para agregar productos al carrito");
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    mutation.mutate({ productId, quantity });
  }

  return { add, isPending: mutation.isPending };
}
