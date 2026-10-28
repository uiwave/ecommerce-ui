import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Página no encontrada
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        La ruta que buscas no existe o fue movida. Vuelve al inicio para
        continuar navegando.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
