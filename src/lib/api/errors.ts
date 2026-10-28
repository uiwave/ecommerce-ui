import type { ErrorResponse } from "@/lib/types";

const FALLBACK_MESSAGES: Record<number, string> = {
  0: "No se pudo conectar con el servidor.",
  400: "La solicitud contiene datos inválidos.",
  401: "No estás autenticado o tu sesión expiró.",
  403: "No tienes permisos para realizar esta acción.",
  404: "El recurso solicitado no existe.",
  409: "Ya existe un recurso con estos datos.",
  422: "Los datos enviados no son válidos.",
  429: "Demasiadas solicitudes. Inténtalo de nuevo en unos segundos.",
  500: "Ocurrió un error interno en el servidor.",
};

/**
 * Error tipado que reproduce el `ErrorResponse` del backend de Spring Boot.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: Record<string, string>;
  readonly path?: string;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string>,
    path?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.path = path;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let payload: Partial<ErrorResponse> | null = null;

    try {
      payload = (await response.json()) as Partial<ErrorResponse>;
    } catch {
      payload = null;
    }

    const message =
      typeof payload?.message === "string" && payload.message.trim().length > 0
        ? payload.message
        : (FALLBACK_MESSAGES[response.status] ??
          `La solicitud falló con el estado ${response.status}.`);

    return new ApiError(message, response.status, payload?.details, payload?.path);
  }
}
