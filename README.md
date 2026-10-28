# Uiwave Commerce — UI

Interfaz web del e-commerce de Uiwave, construida con **Next.js 16 (App Router)** y conectada a la API REST [`ecommerce-api`](../ecommerce-api/ecommerce-api) (Spring Boot 4 + PostgreSQL).

## Funcionalidades

- **Registro** de usuarios (`POST /api/auth/register`) con validación espejo de las reglas del backend.
- **Inicio de sesión** (`POST /api/auth/login`) con access token + refresh token.
- **Sesión persistente** con renovación automática del access token (`POST /api/auth/refresh`) y reintento de la petición original ante un `401`.
- **Cierre de sesión** con revocación del refresh token (`POST /api/auth/logout`).
- **Mi cuenta**: perfil del usuario autenticado (`GET /api/auth/me`).
- **Panel de administración**: acceso exclusivo para rol `ADMIN` (`GET /api/admin/hello`).
- **Modo oscuro** con `next-themes` (sistema/claro/oscuro, sin parpadeo).
- Manejo tipado de errores del backend (`400`, `401`, `403`, `409`, `500`) y toasts con Sonner.

## Requisitos

- Node.js 20.9+
- pnpm 12+
- La API en ejecución (por defecto en `http://localhost:8080`)

## Configuración

1. Instala dependencias:

   ```bash
   pnpm install
   ```

2. Configura la URL de la API en `.env.local` (hay un `.env.example` de referencia):

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. Arranca el servidor de desarrollo:

   ```bash
   pnpm dev
   ```

   App: http://localhost:3000

> El backend ya permite CORS desde `http://localhost:3000` (`CORS_ALLOWED_ORIGINS` en `ecommerce-api/.env`).

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Build de producción con verificación de TypeScript |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | ESLint |

## Arquitectura

```
src/app/                    Rutas (Server Components por defecto)
├── (auth)/                 Login y registro con layout centrado
├── (shop)/                 Inicio, Mi cuenta y Admin con Navbar
├── layout.tsx              Providers (tema + auth), fuentes, Toaster
├── error.tsx               Error boundary global
├── loading.tsx             Skeleton de carga
└── not-found.tsx           404

src/components/
├── ui/                     Primitivos shadcn/ui (Radix, Tailwind v4)
├── layout/                 Navbar, Brand, ThemeProvider, ThemeToggle
├── auth/                   PasswordInput
└── landing/                Hero, FeatureGrid, EndpointList  (el Hero es client)

src/features/
├── auth/                   AuthProvider, useAuth, RequireAuth, schemas zod, formularios
├── account/                Vista de perfil
└── admin/                  Panel de administración

src/lib/
├── api/client.ts           Cliente HTTP único: Bearer, refresh con rotación, 401
├── api/auth.api.ts         Endpoints de autenticación/administración
├── api/errors.ts           ApiError tipado desde el ErrorResponse del backend
├── config.ts               NEXT_PUBLIC_API_URL
├── format.ts               Fechas, roles e iniciales
└── types.ts                Contratos de la API
```

### Decisiones clave

- **Una sola puerta al API**: las vistas nunca llaman `fetch`; usan `authApi` a través del cliente tipado.
- **Refresh con rotación**: si varias peticiones reciben `401` a la vez, se comparte una única promesa de refresh para no invalidar el refresh token por rotaciones paralelas.
- **Sesión en localStorage**: los tokens se gestionan en `lib/api/client.ts`; el resto de la app solo consume `useAuth()`.
- **Rutas protegidas en cliente**: `RequireAuth` restaura la sesión con `/api/auth/me` antes de renderizar y redirige a `/login?next=...` conservando el destino.
- **Validación con zod** alineada con `LoginRequest` / `RegisterRequest` de Jakarta Validation; los errores por campo que devuelve el backend se muestran junto a cada input.
