"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBagIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { ordersApi } from "@/lib/api/orders.api";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency, formatDateTime } from "@/lib/format";

export function OrdersView() {
  const [page, setPage] = useState(0);

  const orders = useQuery({
    queryKey: ["orders", page],
    queryFn: () => ordersApi.mine(page),
  });

  if (orders.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (orders.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudieron cargar tus pedidos</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          {orders.error instanceof ApiError
            ? orders.error.message
            : "Ocurrió un error inesperado."}
          <Button size="sm" variant="outline" onClick={() => void orders.refetch()}>
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const data = orders.data;
  if (!data) return null;

  if (data.content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
        <ShoppingBagIcon className="size-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">Todavía no tienes pedidos</p>
          <p className="text-sm text-muted-foreground">
            Cuando compres algo, aparecerá aquí.
          </p>
        </div>
        <Button asChild>
          <Link href="/productos">Explorar productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mis pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Historial de tus compras en Uiwave.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden sm:table-cell">Ítems</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.content.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(order.createdAt)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {order.items.length}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/pedidos/${order.id}`}>Ver detalle</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {data.page + 1} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.page + 1 >= data.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
