"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PackageSearchIcon, SearchIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./ProductCard";
import { catalogApi } from "@/lib/api/catalog.api";
import { ApiError } from "@/lib/api/errors";

const PAGE_SIZE = 12;

export function ProductsView() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: catalogApi.categories,
  });

  const products = useQuery({
    queryKey: ["products", { q: query, category, page }],
    queryFn: () =>
      catalogApi.products({
        q: query || undefined,
        category,
        page,
        size: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setQuery(searchInput.trim());
  }

  function selectCategory(slug: string | undefined) {
    setPage(0);
    setCategory(slug);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Productos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explora nuestro catálogo de belleza y cuidado personal.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar productos…"
          aria-label="Buscar productos"
        />
        <Button type="submit" variant="secondary">
          <SearchIcon /> Buscar
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={category === undefined ? "default" : "outline"}
          onClick={() => selectCategory(undefined)}
        >
          Todas
        </Button>
        {categories.data?.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={category === item.slug ? "default" : "outline"}
            onClick={() => selectCategory(item.slug)}
          >
            {item.name}
          </Button>
        ))}
      </div>

      {products.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {products.isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar el catálogo</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {products.error instanceof ApiError
              ? products.error.message
              : "Ocurrió un error inesperado."}
            <Button
              size="sm"
              variant="outline"
              onClick={() => void products.refetch()}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {products.data && products.data.content.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <PackageSearchIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">No encontramos productos</p>
          <p className="text-sm text-muted-foreground">
            Prueba con otra búsqueda o categoría.
          </p>
        </div>
      )}

      {products.data && products.data.content.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.data.content.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.data.totalPages > 1 && (
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
                Página {products.data.page + 1} de {products.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={products.data.page + 1 >= products.data.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
