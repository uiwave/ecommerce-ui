/**
 * URL base de la API. Se configura con NEXT_PUBLIC_API_URL en `.env.local`.
 * Por defecto apunta al backend local de Spring Boot.
 */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");
