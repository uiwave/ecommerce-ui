import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "Máximo 120 caracteres"),
  phone: z
    .string()
    .trim()
    .min(1, "El teléfono es obligatorio")
    .max(30, "Máximo 30 caracteres"),
  address: z
    .string()
    .trim()
    .min(1, "La dirección es obligatoria")
    .max(200, "Máximo 200 caracteres"),
  city: z
    .string()
    .trim()
    .min(1, "La ciudad es obligatoria")
    .max(80, "Máximo 80 caracteres"),
  postalCode: z
    .string()
    .trim()
    .min(1, "El código postal es obligatorio")
    .max(12, "Máximo 12 caracteres"),
  country: z
    .string()
    .trim()
    .min(1, "El país es obligatorio")
    .max(60, "Máximo 60 caracteres"),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
