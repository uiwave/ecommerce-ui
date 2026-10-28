export type Role = "USER" | "ADMIN";

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
  imageUrl?: string
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
