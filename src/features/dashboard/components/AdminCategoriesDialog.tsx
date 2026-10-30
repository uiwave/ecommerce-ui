"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api/admin.api";
import { ApiError } from "@/lib/api/errors";
import type { CategoryResponse } from "@/lib/types";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(80, "Máximo 80 caracteres"),
  description: z.string().trim().max(2000, "Máximo 2000 caracteres"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const EMPTY_VALUES: CategoryFormValues = { name: "", description: "" };

interface AdminCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCategoriesDialog({
  open,
  onOpenChange,
}: AdminCategoriesDialogProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryResponse | null>(null);

  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: adminApi.categories,
    enabled: open,
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: EMPTY_VALUES,
  });

  const saveCategory = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      const payload = {
        name: values.name,
        description: values.description.trim() === "" ? null : values.description,
      };
      return editing
        ? adminApi.updateCategory(editing.id, payload)
        : adminApi.createCategory(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(editing ? "Categoría actualizada" : "Categoría creada");
      setFormOpen(false);
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No se pudo guardar la categoría",
      ),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoría eliminada");
      setCategoryToDelete(null);
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No se pudo eliminar la categoría",
      ),
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setFormOpen(true);
  }

  function openEdit(category: CategoryResponse) {
    setEditing(category);
    form.reset({
      name: category.name,
      description: category.description ?? "",
    });
    setFormOpen(true);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Categorías</DialogTitle>
            <DialogDescription>
              Organiza el catálogo. No se puede eliminar una categoría con
              productos asociados.
            </DialogDescription>
          </DialogHeader>

          <Button onClick={openCreate} className="w-full">
            <PlusIcon /> Nueva categoría
          </Button>

          <Separator />

          {categories.isPending && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          <div className="space-y-2">
            {categories.data?.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No hay categorías todavía.
              </p>
            )}

            {categories.data?.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {category.name}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    /{category.slug}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar ${category.name}`}
                    onClick={() => openEdit(category)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Eliminar ${category.name}`}
                    onClick={() => setCategoryToDelete(category)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulario crear / editar */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
          </DialogHeader>

          <form
            id="category-form"
            onSubmit={form.handleSubmit((values) =>
              saveCategory.mutate(values),
            )}
            noValidate
          >
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.name)}>
                <FieldLabel htmlFor="category-name">Nombre</FieldLabel>
                <Input
                  id="category-name"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="category-description">
                  Descripción (opcional)
                </FieldLabel>
                <Textarea
                  id="category-description"
                  rows={2}
                  {...form.register("description")}
                />
                <FieldError errors={[form.formState.errors.description]} />
              </Field>
            </FieldGroup>
          </form>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saveCategory.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="category-form"
              disabled={saveCategory.isPending}
            >
              {saveCategory.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              {editing ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminación */}
      <AlertDialog
        open={categoryToDelete !== null}
        onOpenChange={(next) => {
          if (!next) setCategoryToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete?.name} se eliminará permanentemente. Solo es
              posible si no tiene productos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                categoryToDelete && deleteCategory.mutate(categoryToDelete.id)
              }
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
