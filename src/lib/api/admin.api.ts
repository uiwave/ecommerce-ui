import { apiRequest } from "./client";
import type {
  CategoryResponse,
  OrderResponse,
  OrderStatsResponse,
  OrderStatus,
  PageResponse,
  ProductResponse,
  Role,
  UserResponse,
} from "@/lib/types";

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  sku?: string | null;
  categoryId: number;
  imageUrl?: string | null;
  active: boolean;
}

export interface CategoryPayload {
  name: string;
  description?: string | null;
}

export interface AdminProductFilters {
  q?: string;
  category?: string;
  active?: "all" | "true" | "false";
  page?: number;
  size?: number;
}

export interface AdminUserFilters {
  q?: string;
  role?: Role | "ALL";
  page?: number;
  size?: number;
}

export interface UpdateUserPayload {
  role?: Role;
  enabled?: boolean;
}

export const adminApi = {
  // Catálogo
  products({
    q,
    category,
    active = "all",
    page = 0,
    size = 20,
  }: AdminProductFilters = {}): Promise<PageResponse<ProductResponse>> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (active !== "all") params.set("active", active);
    params.set("page", String(page));
    params.set("size", String(size));

    return apiRequest<PageResponse<ProductResponse>>(
      `/api/admin/products?${params.toString()}`,
      { auth: true },
    );
  },

  createProduct(payload: ProductPayload): Promise<ProductResponse> {
    return apiRequest<ProductResponse>("/api/admin/products", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  updateProduct(id: number, payload: ProductPayload): Promise<ProductResponse> {
    return apiRequest<ProductResponse>(`/api/admin/products/${id}`, {
      method: "PUT",
      auth: true,
      body: payload,
    });
  },

  deleteProduct(id: number): Promise<void> {
    return apiRequest<void>(`/api/admin/products/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  categories(): Promise<CategoryResponse[]> {
    return apiRequest<CategoryResponse[]>("/api/admin/categories", {
      auth: true,
    });
  },

  createCategory(payload: CategoryPayload): Promise<CategoryResponse> {
    return apiRequest<CategoryResponse>("/api/admin/categories", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  updateCategory(
    id: number,
    payload: CategoryPayload,
  ): Promise<CategoryResponse> {
    return apiRequest<CategoryResponse>(`/api/admin/categories/${id}`, {
      method: "PUT",
      auth: true,
      body: payload,
    });
  },

  deleteCategory(id: number): Promise<void> {
    return apiRequest<void>(`/api/admin/categories/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  // Usuarios
  users({
    q,
    role = "ALL",
    page = 0,
    size = 20,
  }: AdminUserFilters = {}): Promise<PageResponse<UserResponse>> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role !== "ALL") params.set("role", role);
    params.set("page", String(page));
    params.set("size", String(size));

    return apiRequest<PageResponse<UserResponse>>(
      `/api/admin/users?${params.toString()}`,
      { auth: true },
    );
  },

  updateUser(id: number, payload: UpdateUserPayload): Promise<UserResponse> {
    return apiRequest<UserResponse>(`/api/admin/users/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  // Pedidos
  orders(
    status: OrderStatus | "ALL" = "ALL",
    q = "",
    page = 0,
    size = 20,
  ): Promise<PageResponse<OrderResponse>> {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (q) params.set("q", q);
    params.set("page", String(page));
    params.set("size", String(size));

    return apiRequest<PageResponse<OrderResponse>>(
      `/api/admin/orders?${params.toString()}`,
      { auth: true },
    );
  },

  updateOrderStatus(
    id: number,
    status: OrderStatus,
  ): Promise<OrderResponse> {
    return apiRequest<OrderResponse>(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      auth: true,
      body: { status },
    });
  },

  stats(): Promise<OrderStatsResponse> {
    return apiRequest<OrderStatsResponse>("/api/admin/stats", { auth: true });
  },
};
