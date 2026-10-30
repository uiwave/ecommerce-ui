"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { OrderStatusBadge } from "./OrderStatusBadge";
import { ordersApi } from "@/lib/api/orders.api";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency, formatDateTime } from "@/lib/format";

export function OrderDetailView({ orderId }: { orderId: number }) {
  const order = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.get(orderId),
  });

  if (order.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (order.isError || !order.data) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Pedido no encontrado</AlertTitle>
          <AlertDescription>
            {order.error instanceof ApiError
              ? order.error.message
              : "No se pudo cargar el pedido."}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/pedidos">
            <ArrowLeftIcon /> Volver a mis pedidos
          </Link>
        </Button>
      </div>
    );
  }

  const data = order.data;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link href="/pedidos">
          <ArrowLeftIcon /> Volver a mis pedidos
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pedido #{data.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(data.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={data.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>{data.items.length} ítems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cant.</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Envío</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{data.fullName}</p>
            <p className="text-muted-foreground">{data.phone}</p>
            <p className="text-muted-foreground">{data.address}</p>
            <p className="text-muted-foreground">
              {data.city}, {data.postalCode}
            </p>
            <p className="text-muted-foreground">{data.country}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
