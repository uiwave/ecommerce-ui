export type Role = "USER" | "ADMIN";

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
  imageUrl?: string;
  enabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: Record<string, string>;
}

export interface AdminHelloResponse {
  message: string;
  username: string;
  timestamp: string;
}

// ---------------------------------------------------------------- catálogo

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  sku?: string | null;
  categoryId: number;
  categoryName: string;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
}

// ------------------------------------------------------------------ carrito

export interface CartItemResponse {
  id: number;
  productId: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  subtotal: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  totalItems: number;
  total: number;
}

// ------------------------------------------------------------------ pedidos

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  total: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  userEmail: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderStatsResponse {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  salesByDay: DailySalesResponse[];
  lowStock: LowStockProductResponse[];
}

export interface DailySalesResponse {
  date: string;
  orders: number;
  revenue: number;
}

export interface LowStockProductResponse {
  id: number;
  name: string;
  stock: number;
}
