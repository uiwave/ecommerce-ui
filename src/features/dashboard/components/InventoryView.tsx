"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BoxesIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api/admin.api";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/format";
import type { ProductResponse } from "@/lib/types";

const stockSchema = z.object({
  newStock: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), {
      message: "Indica un stock válido (entero mayor o igual a 0)",
    }),
});

type StockFormValues = z.infer<typeof stockSchema>;

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function InventoryView() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [adjusting, setAdjusting] = useState<ProductResponse | null>(null);

  const products = useQuery({
    queryKey: ["admin-products", { query, categoryFilter, page }],
    queryFn: () =>
      adminApi.products({
        q: query || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        active: "all",
        page,
      }),
  });

  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: adminApi.categories,
  });

  const settings = useQuery({
    queryKey: ["admin-settings"],
    queryFn: adminApi.settings,
  });

  const lowStockThreshold =
    settings.data?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

  const stockForm = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: { newStock: "0" },
  });

  const adjustStock = useMutation({
    mutationFn: ({ id, newStock }: { id: number; newStock: number }) =>
      adminApi.adjustStock(id, newStock),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(`Stock de ${updated.name} actualizado a ${updated.stock}`);
      setAdjusting(null);
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No se pudo ajustar el stock",
      ),
  });

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setQuery(searchInput.trim());
  }

  function changeCategoryFilter(value: string) {
    setPage(0);
    setCategoryFilter(value);
  }

  function openAdjust(product: ProductResponse) {
    setAdjusting(product);
    stockForm.reset({ newStock: String(product.stock) });
  }

  function stockBadge(stock: number) {
    if (stock === 0) {
      return <Badge variant="destructive">Agotado</Badge>;
    }
    if (stock <= lowStockThreshold) {
      return <Badge variant="destructive">{stock} · Bajo</Badge>;
    }
    return <Badge variant="secondary">{stock}</Badge>;
  }

  const data = products.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Consulta y ajusta el stock disponible de cada producto.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
          <BoxesIcon className="size-4" />
          Umbral de stock bajo:{" "}
          <span className="font-medium text-foreground">{lowStockThreshold}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm gap-2">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar producto…"
            aria-label="Buscar productos"
          />
          <Button type="submit" variant="secondary">
            <SearchIcon />
          </Button>
        </form>

        <Select value={categoryFilter} onValueChange={changeCategoryFilter}>
          <SelectTrigger className="w-44" aria-label="Filtrar por categoría">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.data?.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {products.isPending && <Skeleton className="h-72 w-full" />}

      {products.isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el inventario</AlertTitle>
          <AlertDescription>
            {products.error instanceof ApiError
              ? products.error.message
              : "Ocurrió un error inesperado."}
          </AlertDescription>
        </Alert>
      )}

      {data && (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
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
                      No hay productos para estos filtros.
                    </TableCell>
                  </TableRow>
                )}
                {data.content.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {product.sku ?? "Sin SKU"} · #{product.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {product.categoryName}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      {stockBadge(product.stock)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.active ? "default" : "secondary"}
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAdjust(product)}
                      >
                        Ajustar stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {data.totalElements} producto{data.totalElements === 1 ? "" : "s"}
            </span>
            {data.totalPages > 1 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                >
                  Anterior
                </Button>
                <span>
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
        </>
      )}

      <Dialog
        open={adjusting !== null}
        onOpenChange={(open) => {
          if (!open) setAdjusting(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar stock</DialogTitle>
            <DialogDescription>
              {adjusting?.name} · stock actual:{" "}
              <span className="font-medium text-foreground">
                {adjusting?.stock}
              </span>
            </DialogDescription>
          </DialogHeader>

          <form
            id="stock-form"
            onSubmit={stockForm.handleSubmit((values) =>
              adjusting &&
              adjustStock.mutate({
                id: adjusting.id,
                newStock: Number(values.newStock),
              }),
            )}
            noValidate
          >
            <FieldGroup>
              <Field
                data-invalid={Boolean(stockForm.formState.errors.newStock)}
              >
                <FieldLabel htmlFor="new-stock">Nuevo stock</FieldLabel>
                <Input
                  id="new-stock"
                  inputMode="numeric"
                  autoFocus
                  aria-invalid={Boolean(stockForm.formState.errors.newStock)}
                  {...stockForm.register("newStock")}
                />
                <FieldDescription>
                  Introduce la cantidad total disponible. No puede ser negativa.
                </FieldDescription>
                <FieldError errors={[stockForm.formState.errors.newStock]} />
              </Field>
            </FieldGroup>
          </form>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjusting(null)}
              disabled={adjustStock.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="stock-form"
              disabled={adjustStock.isPending}
            >
              {adjustStock.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              Guardar stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
