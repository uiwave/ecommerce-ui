"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type ProductPayload } from "@/lib/api/admin.api";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/format";
import type { ProductResponse } from "@/lib/types";
import { AdminCategoriesDialog } from "./AdminCategoriesDialog";

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "Máximo 120 caracteres"),
  description: z.string().trim().min(1, "La descripción es obligatoria"),
  price: z
    .string()
    .trim()
    .min(1, "El precio es obligatorio")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "Precio inválido",
    }),
  comparePrice: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (!Number.isNaN(Number(value)) && Number(value) >= 0),
      { message: "Precio inválido" },
    ),
  stock: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), { message: "Stock inválido" }),
  sku: z.string().trim().max(40, "Máximo 40 caracteres"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  imageUrl: z.string().trim().max(500, "Máximo 500 caracteres"),
  active: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "0",
  sku: "",
  categoryId: "",
  imageUrl: "",
  active: true,
};

export function AdminProductsView() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">(
    "all",
  );
  const [page, setPage] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [productToDelete, setProductToDelete] =
    useState<ProductResponse | null>(null);

  const products = useQuery({
    queryKey: [
      "admin-products",
      { query, categoryFilter, activeFilter, page },
    ],
    queryFn: () =>
      adminApi.products({
        q: query || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        active: activeFilter,
        page,
      }),
  });

  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: adminApi.categories,
  });

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedCategoryId = useWatch({
    control: productForm.control,
    name: "categoryId",
  });

  const saveProduct = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const payload: ProductPayload = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        comparePrice:
          values.comparePrice === "" ? null : Number(values.comparePrice),
        stock: Number(values.stock),
        sku: values.sku.trim() === "" ? null : values.sku,
        categoryId: Number(values.categoryId),
        imageUrl: values.imageUrl.trim() === "" ? null : values.imageUrl,
        active: values.active,
      };

      return editing
        ? adminApi.updateProduct(editing.id, payload)
        : adminApi.createProduct(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(editing ? "Producto actualizado" : "Producto creado");
      setDialogOpen(false);
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError ? error.message : "No se pudo guardar",
      ),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto dado de baja");
      setProductToDelete(null);
    },
    onError: () => toast.error("No se pudo dar de baja el producto"),
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

  function changeActiveFilter(value: "all" | "true" | "false") {
    setPage(0);
    setActiveFilter(value);
  }

  function openCreate() {
    setEditing(null);
    productForm.reset(EMPTY_VALUES);
    setDialogOpen(true);
  }

  function openEdit(product: ProductResponse) {
    setEditing(product);
    productForm.reset({
      name: product.name,
      description: product.description,
      price: String(product.price),
      comparePrice:
        product.comparePrice == null ? "" : String(product.comparePrice),
      stock: String(product.stock),
      sku: product.sku ?? "",
      categoryId: String(product.categoryId),
      imageUrl: product.imageUrl ?? "",
      active: product.active,
    });
    setDialogOpen(true);
  }

  const data = products.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona el catálogo, precios y stock.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
            Categorías
          </Button>
          <Button onClick={openCreate}>
            <PlusIcon /> Nuevo producto
          </Button>
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

        <Select
          value={activeFilter}
          onValueChange={(value) =>
            changeActiveFilter(value as "all" | "true" | "false")
          }
        >
          <SelectTrigger className="w-36" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {products.isPending && <Skeleton className="h-72 w-full" />}

      {products.isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el catálogo</AlertTitle>
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
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="size-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {product.sku ?? "Sin SKU"} · #{product.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {product.categoryName}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="font-medium">
                          {formatCurrency(product.price)}
                        </p>
                        {product.comparePrice != null && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.comparePrice)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.active ? "default" : "secondary"}
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Editar ${product.name}`}
                          onClick={() => openEdit(product)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Dar de baja ${product.name}`}
                          disabled={!product.active}
                          onClick={() => setProductToDelete(product)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
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

      {/* ------------------------------------------------ diálogo producto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
            <DialogDescription>
              Los cambios se reflejan de inmediato en la tienda.
            </DialogDescription>
          </DialogHeader>

          <form
            id="product-form"
            onSubmit={productForm.handleSubmit((values) =>
              saveProduct.mutate(values),
            )}
            noValidate
          >
            <FieldGroup>
              <Field data-invalid={Boolean(productForm.formState.errors.name)}>
                <FieldLabel htmlFor="product-name">Nombre</FieldLabel>
                <Input
                  id="product-name"
                  aria-invalid={Boolean(productForm.formState.errors.name)}
                  {...productForm.register("name")}
                />
                <FieldError errors={[productForm.formState.errors.name]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="product-description">
                  Descripción
                </FieldLabel>
                <Textarea
                  id="product-description"
                  rows={3}
                  aria-invalid={Boolean(
                    productForm.formState.errors.description,
                  )}
                  {...productForm.register("description")}
                />
                <FieldError
                  errors={[productForm.formState.errors.description]}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="product-price">Precio (PEN)</FieldLabel>
                  <Input
                    id="product-price"
                    inputMode="decimal"
                    aria-invalid={Boolean(productForm.formState.errors.price)}
                    {...productForm.register("price")}
                  />
                  <FieldError errors={[productForm.formState.errors.price]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="product-compare">
                    Precio anterior (opcional)
                  </FieldLabel>
                  <Input
                    id="product-compare"
                    inputMode="decimal"
                    {...productForm.register("comparePrice")}
                  />
                  <FieldError
                    errors={[productForm.formState.errors.comparePrice]}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="product-stock">Stock</FieldLabel>
                  <Input
                    id="product-stock"
                    inputMode="numeric"
                    aria-invalid={Boolean(productForm.formState.errors.stock)}
                    {...productForm.register("stock")}
                  />
                  <FieldError errors={[productForm.formState.errors.stock]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="product-sku">SKU (opcional)</FieldLabel>
                  <Input
                    id="product-sku"
                    placeholder="SKU-001"
                    {...productForm.register("sku")}
                  />
                  <FieldError errors={[productForm.formState.errors.sku]} />
                </Field>
              </div>

              <Field>
                <FieldLabel>Categoría</FieldLabel>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(value) =>
                    productForm.setValue("categoryId", value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger aria-label="Categoría">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.data?.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError
                  errors={[productForm.formState.errors.categoryId]}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="product-image">URL de imagen</FieldLabel>
                <Input
                  id="product-image"
                  placeholder="https://…"
                  {...productForm.register("imageUrl")}
                />
                <FieldError errors={[productForm.formState.errors.imageUrl]} />
              </Field>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  {...productForm.register("active")}
                />
                Producto activo (visible en la tienda)
              </label>
            </FieldGroup>
          </form>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saveProduct.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="product-form"
              disabled={saveProduct.isPending}
            >
              {saveProduct.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              {editing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminCategoriesDialog
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
      />

      {/* --------------------------------------------- confirmar baja */}
      <AlertDialog
        open={productToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete?.name} dejará de verse en la tienda. El historial
              de pedidos se conserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                productToDelete && deleteProduct.mutate(productToDelete.id)
              }
            >
              Dar de baja
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
