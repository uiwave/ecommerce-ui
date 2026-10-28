import { z } from "zod";

/**
 * Reflejan las reglas de validación de `LoginRequest` y `RegisterRequest`
 * del backend (Spring Boot + Jakarta Validation).
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .max(150, "El email no puede superar los 150 caracteres")
    .pipe(z.email("El email no tiene un formato válido")),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .max(150, "El email no puede superar los 150 caracteres")
    .pipe(z.email("El email no tiene un formato válido")),
  password: z
    .string()
    .min(8, "La contraseña debe tener entre 8 y 72 caracteres")
    .max(72, "La contraseña debe tener entre 8 y 72 caracteres"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
