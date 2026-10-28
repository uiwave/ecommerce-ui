import { KeyRoundIcon, PlugZapIcon, ShieldCheckIcon } from "lucide-react";

import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: KeyRoundIcon,
    title: "Tokens JWT con rotación",
    description:
      "El access token se renueva automáticamente con el refresh token y la petición original se reintenta sin interrumpir al usuario.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Roles y permisos",
    description:
      "Los clientes acceden a su cuenta y los administradores, además, al panel protegido con Spring Security.",
  },
  {
    icon: PlugZapIcon,
    title: "Conectado a la API real",
    description:
      "Consumo directo de la API Spring Boot con PostgreSQL: sin datos simulados ni endpoints inventados.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight">
          Una experiencia segura de extremo a extremo
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          La autenticación, la sesión y los permisos se gestionan contra el
          backend, con una capa de acceso tipada en el frontend.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="size-4" />
              </span>
              <CardTitle>{title}</CardTitle>
              <CardDescription className="leading-relaxed">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </section>
  );
}
