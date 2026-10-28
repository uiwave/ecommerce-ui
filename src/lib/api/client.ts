import { API_URL } from "@/lib/config";
import type { AuthResponse } from "@/lib/types";
import { ApiError } from "./errors";

const ACCESS_TOKEN_KEY = "uiwave.access-token";
const REFRESH_TOKEN_KEY = "uiwave.refresh-token";

/** Evento emitido cuando la sesión ya no se puede renovar. */
export const AUTH_SESSION_EXPIRED_EVENT = "uiwave:session-expired";

const isBrowser = typeof window !== "undefined";

export const tokenStorage = {
  getAccessToken(): string | null {
    return isBrowser ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  },
  getRefreshToken(): string | null {
    return isBrowser ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  },
  setTokens(accessToken: string, refreshToken: string): void {
    if (!isBrowser) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear(): void {
    if (!isBrowser) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

let refreshInFlight: Promise<boolean> | null = null;

async function requestTokenRefresh(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = (await response.json()) as AuthResponse;
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

/**
 * Renueva el access token una única vez para todas las peticiones concurrentes
 * (evita rotaciones de refresh token en paralelo).
 */
function refreshAccessToken(): Promise<boolean> {
  refreshInFlight ??= requestTokenRefresh().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Permite recalcular el cuerpo al reintentar (útil para enviar el refresh token rotado). */
  getBody?: () => unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

/**
 * Cliente HTTP único de la aplicación: añade el Bearer token, renueva la sesión
 * ante un 401 y normaliza los errores del backend como `ApiError`.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    body,
    getBody,
    auth = false,
    retryOnUnauthorized = true,
    headers,
    ...rest
  } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  const rawBody = getBody ? getBody() : body;
  if (rawBody !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: rawBody !== undefined ? JSON.stringify(rawBody) : undefined,
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que la API esté en ejecución.",
      0,
    );
  }

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }

    tokenStorage.clear();
    if (isBrowser) {
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }
  }

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
