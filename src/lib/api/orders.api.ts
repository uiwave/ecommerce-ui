import { apiRequest } from "./client";
import type { OrderResponse, PageResponse } from "@/lib/types";

export interface CheckoutPayload {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export const ordersApi = {
  checkout(payload: CheckoutPayload): Promise<OrderResponse> {
    return apiRequest<OrderResponse>("/api/orders", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  mine(page = 0, size = 10): Promise<PageResponse<OrderResponse>> {
    return apiRequest<PageResponse<OrderResponse>>(
      `/api/orders?page=${page}&size=${size}`,
      { auth: true },
    );
  },

  get(id: number): Promise<OrderResponse> {
    return apiRequest<OrderResponse>(`/api/orders/${id}`, { auth: true });
  },
};
