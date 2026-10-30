import { apiRequest } from "./client";
import type { CartResponse } from "@/lib/types";

export const cartApi = {
  get(): Promise<CartResponse> {
    return apiRequest<CartResponse>("/api/cart", { auth: true });
  },

  addItem(productId: number, quantity = 1): Promise<CartResponse> {
    return apiRequest<CartResponse>("/api/cart/items", {
      method: "POST",
      auth: true,
      body: { productId, quantity },
    });
  },

  updateItem(itemId: number, quantity: number): Promise<CartResponse> {
    return apiRequest<CartResponse>(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      auth: true,
      body: { quantity },
    });
  },

  removeItem(itemId: number): Promise<CartResponse> {
    return apiRequest<CartResponse>(`/api/cart/items/${itemId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  clear(): Promise<void> {
    return apiRequest<void>("/api/cart", { method: "DELETE", auth: true });
  },
};
