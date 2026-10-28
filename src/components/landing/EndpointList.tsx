import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const ENDPOINTS = [
  { method: "POST", path: "/api/auth/register", access: "Público" },
  { method: "POST", path: "/api/auth/login", access: "Público" },
  { method: "POST", path: "/api/auth/refresh", access: "Público" },
  { method: "POST", path: "/api/auth/logout", access: "Autenticado" },
  { method: "GET", path: "/api/auth/me", access: "Autenticado" },
  { method: "GET", path: "/api/admin/hello", access: "ADMIN" },
] as const;

export function EndpointList() {
  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {ENDPOINTS.map((endpoint) => (
            <li
              key={`${endpoint.method}-${endpoint.path}`}
              className="flex flex-wrap items-center gap-3 px-4 py-3 first:pt-4 last:pb-4"
            >
              <Badge
                variant={endpoint.method === "GET" ? "secondary" : "outline"}
                className="w-14 justify-center font-mono"
              >
                {endpoint.method}
              </Badge>
              <code className="font-mono text-sm">{endpoint.path}</code>
              <span className="ml-auto text-xs text-muted-foreground">
                {endpoint.access}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
