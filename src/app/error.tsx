"use client";

import { useEffect } from "react";
import { CircleAlertIcon, RefreshCwIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <Alert variant="destructive" className="max-w-md">
        <CircleAlertIcon />
        <AlertTitle>Algo salió mal</AlertTitle>
        <AlertDescription>
          Ocurrió un error inesperado al renderizar la página. Puedes
          intentarlo de nuevo.
        </AlertDescription>
      </Alert>
      <Button onClick={reset}>
        <RefreshCwIcon /> Reintentar
      </Button>
    </div>
  );
}
