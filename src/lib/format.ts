import type { Role } from "@/lib/types";

const dateTimeFormatter = new Intl.DateTimeFormat("es", {
  dateStyle: "long",
  timeStyle: "short",
});

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

export function formatRole(role: Role): string {
  return role === "ADMIN" ? "Administrador" : "Cliente";
}

export function getInitials(fullName: string, fallback = "?"): string {
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || fallback.charAt(0).toUpperCase();
}
