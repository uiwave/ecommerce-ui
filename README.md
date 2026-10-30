# Uiwave Commerce — UI

Interfaz web del e-commerce de Uiwave, construida con **Next.js 16 (App Router)** y conectada a la API REST [`ecommerce-api`](../ecommerce-api/ecommerce-api) (Spring Boot 4 + PostgreSQL).

## Funcionalidades

- **Autenticación completa**: registro, login, refresh con rotación, logout y perfil (`/api/auth/*`).
- **Catálogo público**: listado paginado con buscador y filtro por categoría, y detalle por slug (`/productos`, `/productos/[slug]`).
- **Carrito persistente en servidor**: agregar, actualizar cantidades, quitar y vaciar (`/api/cart`), con contador en el navbar.
- **Checkout transaccional**: crea el pedido, valida y descuenta stock, y vacía el carrito (`POST /api/orders`).
- **Mis pedidos**: historial y detalle con estado (`/pedidos`, `/pedidos/[id]`).
- **Panel de administración** (rol `ADMIN`) con sidebar:
  - **General**: métricas (ingresos, pedidos, productos, usuarios), gráfico de ventas de 7 días, stock bajo y pedidos recientes.
  - **Productos**: CRUD completo, baja lógica, búsqueda y filtros por categoría/estado, y gestión de categorías (crear/editar/eliminar).
  - **Pedidos**: búsqueda por cliente, filtro por estado y transiciones `PENDING → PAID → SHIPPED → DELIVERED` (o `CANCELLED`).
  - **Clientes**: búsqueda, filtro por rol, cambio de rol y activación/desactivación de cuentas.
  - **Sistema**: estado de la API.
- **Modo oscuro** con `next-themes`, estados de carga/error/vacío y toasts con Sonner.
- **Estado del servidor con TanStack Query** (caché, reintentos e invalidación tras mutaciones).

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
├── (shop)/                 Tienda: Inicio, Productos, Carrito, Checkout, Pedidos y Cuenta
├── dashboard/              Panel admin con sidebar: General, Productos, Pedidos, Clientes y Sistema
├── admin/page.tsx          Redirección heredada a /dashboard
├── layout.tsx              Providers (tema + React Query + auth), fuentes, Toaster
├── error.tsx               Error boundary global
├── loading.tsx             Skeleton de carga
└── not-found.tsx           404

src/components/
├── ui/                     Primitivos shadcn/ui (Radix, Tailwind v4)
├── providers/              QueryProvider (TanStack Query)
├── layout/                 Navbar, Brand, ThemeProvider, ThemeToggle
├── auth/                   PasswordInput
└── landing/                Hero, FeatureGrid, EndpointList  (el Hero es client)

src/features/
├── auth/                   AuthProvider, useAuth, RequireAuth, schemas zod, formularios
├── account/                Vista de perfil
├── catalog/                Grid de productos, buscador, filtros y detalle
├── cart/                   Hook add-to-cart, botón con contador y vista del carrito
├── checkout/               Formulario de envío (zod) y creación del pedido
├── orders/                 Mis pedidos, detalle y badge de estado
└── dashboard/              Guard ADMIN, sidebar, shell, métricas, productos, pedidos y clientes

src/lib/
├── api/client.ts           Cliente HTTP único: Bearer, refresh con rotación, 401
├── api/auth.api.ts         Endpoints de autenticación/administración
├── api/catalog.api.ts      Categorías y productos (público)
├── api/cart.api.ts         Carrito del usuario
├── api/orders.api.ts       Checkout y pedidos propios
├── api/admin.api.ts        CRUD admin, pedidos y estadísticas
├── api/errors.ts           ApiError tipado desde el ErrorResponse del backend
├── config.ts               NEXT_PUBLIC_API_URL
├── format.ts               Fechas, moneda, roles e iniciales
└── types.ts                Contratos de la API
```

### Decisiones clave

- **Una sola puerta al API**: las vistas nunca llaman `fetch`; usan `authApi` a través del cliente tipado.
- **Refresh con rotación**: si varias peticiones reciben `401` a la vez, se comparte una única promesa de refresh para no invalidar el refresh token por rotaciones paralelas.
- **Sesión en localStorage**: los tokens se gestionan en `lib/api/client.ts`; el resto de la app solo consume `useAuth()`.
- **Rutas protegidas en cliente**: `RequireAuth` restaura la sesión con `/api/auth/me` antes de renderizar y redirige a `/login?next=...` conservando el destino.
- **Validación con zod** alineada con `LoginRequest` / `RegisterRequest` de Jakarta Validation; los errores por campo que devuelve el backend se muestran junto a cada input.
