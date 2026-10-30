import { apiRequest } from "./client";
import type {
  CategoryResponse,
  PageResponse,
  ProductResponse,
} from "@/lib/types";

export interface ProductQuery {
  q?: string;
  category?: string;
  page?: number;
  size?: number;
}

export const catalogApi = {
  categories(): Promise<CategoryResponse[]> {
    return apiRequest<CategoryResponse[]>("/api/categories");
  },

  products({ q, category, page = 0, size = 12 }: ProductQuery = {}): Promise<
    PageResponse<ProductResponse>
  > {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("page", String(page));
    params.set("size", String(size));

    return apiRequest<PageResponse<ProductResponse>>(
      `/api/products?${params.toString()}`,
    );
  },

  product(slug: string): Promise<ProductResponse> {
    return apiRequest<ProductResponse>(
      `/api/products/${encodeURIComponent(slug)}`,
    );
  },
};
