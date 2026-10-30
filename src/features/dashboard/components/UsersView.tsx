"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/features/auth/useAuth";
import { adminApi } from "@/lib/api/admin.api";
import { ApiError } from "@/lib/api/errors";
import { formatDateTime, formatRole, getInitials } from "@/lib/format";
import type { Role } from "@/lib/types";

const ROLE_FILTERS: Array<{ value: Role | "ALL"; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "USER", label: "Clientes" },
  { value: "ADMIN", label: "Administradores" },
];

/**
 * Gestión de usuarios (solo ADMIN): búsqueda, filtro por rol, cambio de rol y
 * activación/desactivación de cuentas.
 */
export function UsersView() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const users = useQuery({
    queryKey: ["admin-users", { query, role, page }],
    queryFn: () =>
      adminApi.users({ q: query || undefined, role, page }),
  });

  const updateUser = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { role?: Role; enabled?: boolean };
    }) => adminApi.updateUser(id, payload),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(
        `${updated.fullName}: ${formatRole(updated.role)}${
          updated.enabled ? "" : " · cuenta desactivada"
        }`,
      );
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No se pudo actualizar el usuario",
      ),
  });

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setQuery(searchInput.trim());
  }

  function handleRoleFilter(value: Role | "ALL") {
    setRole(value);
    setPage(0);
  }

  const data = users.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Usuarios registrados en la plataforma.
          </p>
        </div>
        <Select
          value={role}
          onValueChange={(value) => handleRoleFilter(value as Role | "ALL")}
        >
          <SelectTrigger className="w-44" aria-label="Filtrar por rol">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por nombre o email…"
          aria-label="Buscar usuarios"
        />
        <Button type="submit" variant="secondary">
          <SearchIcon /> Buscar
        </Button>
      </form>

      {users.isPending && <Skeleton className="h-72 w-full" />}

      {users.isError && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar los usuarios</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {users.error instanceof ApiError
              ? users.error.message
              : "Ocurrió un error inesperado."}
            <Button
              size="sm"
              variant="outline"
              onClick={() => void users.refetch()}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {data && (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Registrado
                  </TableHead>
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No hay usuarios para esta búsqueda.
                    </TableCell>
                  </TableRow>
                )}

                {data.content.map((user) => {
                  const isSelf =
                    currentUser?.id === user.id ||
                    currentUser?.email === user.email;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            {getInitials(user.fullName, user.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 truncate font-medium">
                              {user.fullName}
                              {isSelf && (
                                <Badge variant="outline" className="text-[0.6rem]">
                                  Tú
                                </Badge>
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={user.role}
                          disabled={isSelf || updateUser.isPending}
                          onValueChange={(value) =>
                            updateUser.mutate({
                              id: user.id,
                              payload: { role: value as Role },
                            })
                          }
                        >
                          <SelectTrigger
                            className="w-40"
                            aria-label={`Rol de ${user.fullName}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">
                              <UserIcon /> Cliente
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              <ShieldCheckIcon /> Administrador
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={user.enabled ? "default" : "destructive"}
                          >
                            {user.enabled ? "Activo" : "Inactivo"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isSelf || updateUser.isPending}
                            onClick={() =>
                              updateUser.mutate({
                                id: user.id,
                                payload: { enabled: !user.enabled },
                              })
                            }
                          >
                            {user.enabled ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {formatDateTime(user.createdAt)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        #{user.id}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {data.totalElements} usuario{data.totalElements === 1 ? "" : "s"}
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
    </div>
  );
}
