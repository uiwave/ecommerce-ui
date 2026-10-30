"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { ORDER_STATUS_LABELS } from "@/features/orders/order-status";
import { adminApi } from "@/lib/api/admin.api";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { OrderResponse, OrderStatus } from "@/lib/types";

const STATUS_FILTERS: Array<{ value: OrderStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "PAID", label: "Pagados" },
  { value: "SHIPPED", label: "Enviados" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
];

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function AdminOrdersView() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<OrderResponse | null>(null);

  const orders = useQuery({
    queryKey: ["admin-orders", { status, query, page }],
    queryFn: () => adminApi.orders(status, query, page),
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      nextStatus,
    }: {
      id: number;
      nextStatus: OrderStatus;
    }) => adminApi.updateOrderStatus(id, nextStatus),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(
        `Pedido #${updated.id}: ${ORDER_STATUS_LABELS[updated.status]}`,
      );
      setDetail((current) =>
        current && current.id === updated.id ? updated : current,
      );
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No se pudo cambiar el estado",
      ),
  });

  if (orders.isPending) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (orders.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No se pudieron cargar los pedidos</AlertTitle>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los pedidos y su estado de pago y envío.
          </p>
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as OrderStatus | "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-44" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPage(0);
          setQuery(searchInput.trim());
        }}
        className="flex max-w-md gap-2"
      >
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por email o nombre…"
          aria-label="Buscar pedidos"
        />
        <Button type="submit" variant="secondary">
          <SearchIcon /> Buscar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.content.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No hay pedidos para este filtro.
                </TableCell>
              </TableRow>
            )}

            {data.content.map((order) => {
              const nextStatuses = NEXT_STATUSES[order.status];
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    #{order.id}
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-sm">
                    {order.userEmail}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {nextStatuses.length > 0 ? (
                        <Select
                          value=""
                          onValueChange={(value) =>
                            updateStatus.mutate({
                              id: order.id,
                              nextStatus: value as OrderStatus,
                            })
                          }
                        >
                          <SelectTrigger
                            className="w-36"
                            aria-label={`Cambiar estado del pedido ${order.id}`}
                            disabled={updateStatus.isPending}
                          >
                            <SelectValue placeholder="Cambiar a…" />
                          </SelectTrigger>
                          <SelectContent>
                            {nextStatuses.map((next) => (
                              <SelectItem key={next} value={next}>
                                {ORDER_STATUS_LABELS[next]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Estado final
                        </span>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Ver pedido ${order.id}`}
                        onClick={() => setDetail(order)}
                      >
                        <EyeIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {updateStatus.isPending && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> Actualizando estado…
        </p>
      )}

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

      <Dialog
        open={detail !== null}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>Pedido #{detail.id}</DialogTitle>
                <DialogDescription>
                  {formatDateTime(detail.createdAt)} · {detail.userEmail}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center justify-between">
                <OrderStatusBadge status={detail.status} />
                <span className="font-semibold">
                  {formatCurrency(detail.total)}
                </span>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                {detail.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <span>
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="shrink-0">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Envío
                </p>
                <p className="font-medium">{detail.fullName}</p>
                <p className="text-muted-foreground">{detail.phone}</p>
                <p className="text-muted-foreground">{detail.address}</p>
                <p className="text-muted-foreground">
                  {detail.city}, {detail.postalCode} · {detail.country}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
