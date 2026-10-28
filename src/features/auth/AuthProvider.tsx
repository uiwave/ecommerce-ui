"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { authApi, type LoginPayload, type RegisterPayload } from "@/lib/api/auth.api";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  tokenStorage,
} from "@/lib/api/client";
import type { AuthResponse, UserResponse } from "@/lib/types";

export interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restaura la sesión al cargar la aplicación.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.me();
        if (!cancelled) setUser(currentUser);
      } catch {
        tokenStorage.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Reacciona cuando el cliente API no puede renovar la sesión.
  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      toast.error("Tu sesión expiró. Inicia sesión de nuevo.");

      if (!pathname.startsWith("/login") && !pathname.startsWith("/register")) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
      }
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [pathname, router]);

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await authApi.register(payload);
      // Inicio de sesión automático tras crear la cuenta.
      const response = await authApi.login({
        email: payload.email,
        password: payload.password,
      });
      applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(async () => {
    try {
      if (tokenStorage.getRefreshToken()) {
        await authApi.logout();
      }
    } catch {
      // Aunque el backend no responda, la sesión local se cierra igualmente.
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
