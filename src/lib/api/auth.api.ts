import type { AdminHelloResponse, AuthResponse, UserResponse } from "@/lib/types";
import { apiRequest, tokenStorage } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Única puerta de entrada a los endpoints de autenticación y administración.
 * El refresh de tokens se gestiona de forma transparente en `client.ts`.
 */
export const authApi = {
  register(payload: RegisterPayload): Promise<UserResponse> {
    return apiRequest<UserResponse>("/api/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  login(payload: LoginPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  me(): Promise<UserResponse> {
    return apiRequest<UserResponse>("/api/auth/me", { auth: true });
  },

  logout(): Promise<void> {
    return apiRequest<void>("/api/auth/logout", {
      method: "POST",
      auth: true,
      // Se recalcula al reintentar para revocar el refresh token vigente tras una rotación.
      getBody: () => ({ refreshToken: tokenStorage.getRefreshToken() }),
    });
  },

  adminHello(): Promise<AdminHelloResponse> {
    return apiRequest<AdminHelloResponse>("/api/admin/hello", { auth: true });
  },
};
