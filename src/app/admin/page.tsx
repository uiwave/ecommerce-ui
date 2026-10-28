import { redirect } from "next/navigation";

/**
 * Ruta heredada del panel admin anterior: ahora todo vive en /dashboard.
 */
export default function LegacyAdminPage() {
  redirect("/dashboard");
}
