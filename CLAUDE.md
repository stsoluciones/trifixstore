# CLAUDE.md — Trifixstore Ecommerce

## Visión del Proyecto

Ecommerce de modelo **dropshipping**: el dueño administra el catálogo y los pedidos, pero el stock, el cobro final y el envío los gestiona la empresa proveedora. El cliente navega la tienda, arma su carrito y compra. Al confirmar la compra el sistema envía el pedido automáticamente al proveedor vía su API.

El dueño nunca tiene stock propio. No hay vendedores independientes que publiquen productos. El admin controla todo el catálogo y delega operaciones de soporte a sus vendedores contratados.

Stack: Next.js 15 App Router, Tailwind CSS v4, TypeScript estricto, Firebase Auth, MongoDB (driver nativo).

---

## Modelo de Negocio — Dropshipping

### Flujo completo de una compra

```
Cliente → Catálogo → Carrito → Checkout → Pago (MercadoPago)
                                               ↓
                                ConfirmaciónPago (webhook MP)
                                               ↓
                             proveedor-pedido.service.ts
                                               ↓
                                API del Proveedor (POST pedido)
                                               ↓
                           Proveedor cobra y envía al cliente
```

### Responsabilidades del sistema

| Responsabilidad | Quién la tiene |
|---|---|
| Mostrar catálogo | La app (datos desde API proveedor via adapter) |
| Gestionar carrito | La app (Zustand + localStorage) |
| Procesar pago | MercadoPago |
| Enviar pedido al proveedor | `proveedor-pedido.service.ts` (disparado por webhook de MP) |
| Cobrar al cliente | MercadoPago |
| Despachar al cliente | Empresa proveedora |
| Administrar catálogo | Admin a través de `/dashboard/admin` |

### El admin NO gestiona stock

Los productos vienen de la API del proveedor. La DB local solo cachea el catálogo para evitar llamadas constantes al proveedor. El admin puede activar/desactivar productos visibles en la tienda, pero no crea productos desde cero.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5 (strict mode) |
| Estilos | Tailwind CSS v4 |
| Estado global | Zustand |
| Formularios | React Hook Form + Zod |
| Base de datos | MongoDB Atlas — driver nativo (`mongodb` npm) |
| Auth | Firebase Authentication (client) + Firebase Admin SDK (server) |
| Imágenes | Next/Image + Cloudinary |
| Pagos | MercadoPago SDK |
| Testing | Vitest + Testing Library |
| Linter | ESLint + Prettier |

---

## Estructura de Carpetas (Feature-Based)

```
src/
├── middleware.ts                 # Next.js middleware — protección de rutas por rol
│
├── app/                          # Next.js App Router — solo rutas y layouts
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (store)/
│   │   ├── layout.tsx            # Layout principal con header/footer
│   │   ├── page.tsx              # Home — listado destacado
│   │   ├── productos/
│   │   │   ├── page.tsx          # Listado con filtros
│   │   │   └── [slug]/page.tsx   # Detalle de producto
│   │   ├── categorias/
│   │   │   └── [categoria]/page.tsx
│   │   ├── buscar/page.tsx       # Resultados de búsqueda
│   │   ├── carrito/page.tsx
│   │   └── checkout/
│   │       ├── page.tsx
│   │       └── confirmacion/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Layout compartido: sidebar, nav por rol
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Resumen general del negocio
│   │   │   ├── productos/page.tsx
│   │   │   ├── pedidos/page.tsx
│   │   │   └── usuarios/page.tsx
│   │   ├── vendedor/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Resumen de pedidos del día
│   │   │   └── pedidos/page.tsx
│   │   └── cliente/
│   │       ├── layout.tsx
│   │       ├── page.tsx          # Historial de pedidos
│   │       └── perfil/page.tsx
│   └── api/
│       ├── auth/
│       │   └── verify/route.ts   # POST: verifica Firebase idToken, retorna rol
│       ├── productos/route.ts
│       ├── categorias/route.ts
│       ├── carrito/route.ts
│       ├── ordenes/route.ts
│       └── pagos/
│           ├── crear/route.ts
│           └── webhook/route.ts
│
├── features/                     # Lógica de negocio por feature
│   ├── productos/
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── ProductImages.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   └── ProductBreadcrumb.tsx
│   │   ├── hooks/
│   │   │   ├── useProductos.ts
│   │   │   └── useProductoDetalle.ts
│   │   ├── adapters/
│   │   │   └── proveedor.adapter.ts   # Normaliza respuesta raw de API → ProductoInterno
│   │   ├── schemas/
│   │   │   └── producto.schema.ts
│   │   ├── services/
│   │   │   └── producto.service.ts    # Llama API proveedor, usa adapter
│   │   └── types/
│   │       └── producto.types.ts      # Contiene ProductoInterno
│   │
│   ├── carrito/
│   │   ├── components/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── hooks/
│   │   │   └── useCarrito.ts
│   │   ├── store/
│   │   │   └── carrito.store.ts   # Zustand store con persist middleware
│   │   └── types/
│   │       └── carrito.types.ts
│   │
│   ├── checkout/
│   │   ├── components/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── DireccionForm.tsx
│   │   │   └── ResumenOrden.tsx
│   │   ├── hooks/
│   │   │   └── useCheckout.ts
│   │   └── services/
│   │       └── checkout.service.ts
│   │
│   ├── ordenes/
│   │   ├── components/
│   │   │   └── OrdenDetalle.tsx
│   │   ├── services/
│   │   │   ├── orden.service.ts
│   │   │   └── proveedor-pedido.service.ts  # Envía pedido confirmado al proveedor
│   │   └── types/
│   │       └── orden.types.ts
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── hooks/
│   │       └── useAuth.ts
│   │
│   ├── busqueda/
│   │   ├── components/
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchResults.tsx
│   │   └── hooks/
│   │       └── useBusqueda.ts
│   │
│   ├── dashboard-admin/
│   │   ├── components/
│   │   │   ├── ProductoForm.tsx
│   │   │   ├── PedidosTable.tsx
│   │   │   └── UsuariosTable.tsx
│   │   └── hooks/
│   │       └── useAdminDashboard.ts
│   │
│   ├── dashboard-vendedor/
│   │   ├── components/
│   │   │   └── PedidosVendedor.tsx
│   │   └── hooks/
│   │       └── useVendedorDashboard.ts
│   │
│   └── dashboard-cliente/
│       ├── components/
│       │   ├── HistorialPedidos.tsx
│       │   └── PerfilCliente.tsx
│       └── hooks/
│           └── useClienteDashboard.ts
│
├── shared/                       # Código compartido entre features
│   ├── components/
│   │   ├── ui/                   # Primitivos reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Rating.tsx
│   │   │   └── Tooltip.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── Sidebar.tsx
│   │       └── MobileNav.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   ├── lib/
│   │   ├── prisma.ts             # Singleton Prisma client
│   │   ├── firebase.ts           # Firebase client SDK — solo browser
│   │   ├── firebase-admin.ts     # Firebase Admin SDK — solo server, NUNCA importar en client
│   │   ├── cloudinary.ts
│   │   └── mercadopago.ts
│   └── utils/
│       ├── formatPrice.ts
│       ├── formatDate.ts
│       └── cn.ts                 # clsx + tailwind-merge helper
│
├── styles/
│   └── globals.css               # Tailwind base + variables CSS
│
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## Capa Adapter — API del Proveedor

El formato exacto de la API del proveedor es desconocido hasta el momento de integración. El sistema usa el **patrón Adapter** para desacoplar el formato externo del modelo interno.

### Interfaz interna (invariante)

```typescript
// src/features/productos/types/producto.types.ts

export interface ProductoInterno {
  id: string
  nombre: string
  descripcion: string
  precio: number              // en pesos ARS
  precioOriginal?: number     // precio sin descuento, si aplica
  imagenes: string[]          // URLs de imágenes
  categoriaId: string
  stock: number               // 0 = sin stock
  slug: string
  activo: boolean
  metadatos?: Record<string, unknown>  // datos extra del proveedor sin mapear
}
```

### Adapter

```typescript
// src/features/productos/adapters/proveedor.adapter.ts

export function adaptarProducto(raw: unknown): ProductoInterno {
  // raw es la respuesta cruda de la API del proveedor (formato desconocido)
  // Cuando se integre la API real, esta función se completa.
  // Por ahora trabaja contra un contrato `unknown` para no asumir nada.
  const data = raw as Record<string, unknown>

  return {
    id: String(data.id ?? data.sku ?? data.codigo ?? ''),
    nombre: String(data.nombre ?? data.name ?? data.title ?? ''),
    descripcion: String(data.descripcion ?? data.description ?? ''),
    precio: Number(data.precio ?? data.price ?? 0),
    precioOriginal: data.precioOriginal != null ? Number(data.precioOriginal) : undefined,
    imagenes: Array.isArray(data.imagenes)
      ? (data.imagenes as string[])
      : Array.isArray(data.images)
        ? (data.images as string[])
        : [],
    categoriaId: String(data.categoriaId ?? data.category ?? ''),
    stock: Number(data.stock ?? data.quantity ?? 0),
    slug: String(data.slug ?? data.id ?? ''),
    activo: Boolean(data.activo ?? data.active ?? true),
    metadatos: data,
  }
}
```

### Uso en el service

```typescript
// src/features/productos/services/producto.service.ts

import { adaptarProducto } from '../adapters/proveedor.adapter'
import type { ProductoInterno } from '../types/producto.types'

export async function obtenerProductos(): Promise<ProductoInterno[]> {
  const res = await fetch(process.env.PROVEEDOR_API_URL + '/productos', {
    headers: { 'x-api-key': process.env.PROVEEDOR_API_KEY! },
    next: { revalidate: 3600 },  // cache ISR 1 hora
  })
  const raw: unknown[] = await res.json()
  return raw.map(adaptarProducto)
}
```

### Regla crítica

Nunca usar el formato crudo del proveedor fuera de `adapters/`. Todo el resto de la app trabaja contra `ProductoInterno`. Si el proveedor cambia su API, solo hay que modificar `proveedor.adapter.ts`.

---

## Autenticación — Firebase

### Arquitectura

```
Browser                       Next.js Server
──────────────────────        ──────────────────────────────────
firebase.ts (client SDK)  →   API Route /api/auth/verify
  signInWithEmail()              firebase-admin.ts
  getIdToken()           →       admin.auth().verifyIdToken(token)
  token en cookie        →       retorna { uid, email, rol }
```

### firebase.ts (client — solo browser)

```typescript
// src/shared/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
```

### firebase-admin.ts (server only — NUNCA importar en Client Components)

```typescript
// src/shared/lib/firebase-admin.ts
import admin from 'firebase-admin'

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
}

export default admin
```

### Verificación de token en API Route

```typescript
// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import admin from '@/shared/lib/firebase-admin'
import { prisma } from '@/shared/lib/prisma'

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    const usuario = await prisma.usuario.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { rol: true, nombre: true },
    })

    return NextResponse.json({
      uid: decoded.uid,
      email: decoded.email,
      rol: usuario?.rol ?? 'CLIENTE',
    })
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
}
```

### Flujo de login completo

```
1. Usuario ingresa email/password en LoginForm
2. signInWithEmailAndPassword(auth, email, password)
3. Firebase retorna User con idToken
4. POST /api/auth/verify con el idToken
5. Server verifica con Admin SDK y retorna { uid, email, rol }
6. Rol se guarda en Zustand store (usuario.store.ts)
7. idToken se guarda en cookie `firebase-token` (httpOnly)
8. Redirect según rol:
   ADMIN     → /dashboard/admin
   VENDEDOR  → /dashboard/vendedor
   CLIENTE   → /dashboard/cliente
```

---

## Sistema de Roles y Dashboards

### Enum de roles

```prisma
// En prisma/schema.prisma
enum Rol {
  ADMIN     // Dueño — acceso total
  VENDEDOR  // Soporte/operaciones — solo pedidos
  CLIENTE   // Comprador — solo su historial
}
```

El rol se guarda en la tabla `Usuario` de PostgreSQL (no en Firebase Custom Claims). El campo `firebaseUid` conecta el registro de Firebase con el registro de Prisma.

**Por qué Prisma y no Custom Claims:** Firebase Custom Claims tienen un TTL de sincronización de hasta 1 hora. Si el admin cambia el rol de un usuario, la sesión activa del usuario seguiría teniendo el rol viejo por hasta 1 hora. Con el rol en Prisma, el middleware verifica en cada request y el cambio es inmediato.

### Rutas de dashboard y permisos

| Ruta | Rol requerido | Acceso a |
|---|---|---|
| `/dashboard/admin` | `ADMIN` | Todo: productos, pedidos, usuarios |
| `/dashboard/vendedor` | `VENDEDOR` o `ADMIN` | Pedidos, soporte |
| `/dashboard/cliente` | `CLIENTE`, `VENDEDOR`, `ADMIN` | Historial propio |

### Middleware Next.js (src/middleware.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'

const RUTAS_PROTEGIDAS: Record<string, string[]> = {
  '/dashboard/admin':    ['ADMIN'],
  '/dashboard/vendedor': ['ADMIN', 'VENDEDOR'],
  '/dashboard/cliente':  ['ADMIN', 'VENDEDOR', 'CLIENTE'],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const rutaRequerida = Object.keys(RUTAS_PROTEGIDAS).find(r => pathname.startsWith(r))
  if (!rutaRequerida) return NextResponse.next()

  const token = req.cookies.get('firebase-token')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  const res = await fetch(new URL('/api/auth/verify', req.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  if (!res.ok) return NextResponse.redirect(new URL('/login', req.url))

  const { rol } = await res.json()
  const rolesPermitidos = RUTAS_PROTEGIDAS[rutaRequerida]

  if (!rolesPermitidos.includes(rol)) {
    return NextResponse.redirect(new URL('/dashboard/cliente', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

**Nota de rendimiento:** En producción, considerar cachear el rol en una cookie firmada de TTL corto (`rol-cache`, 5 min) para evitar una DB query en cada navegación de página.

---

## Flujo Dropshipping — Servicio de Pedidos al Proveedor

### Cuándo se dispara

El webhook de MercadoPago (`POST /api/pagos/webhook`) confirma el pago. En ese momento se llama a `proveedor-pedido.service.ts`.

### Interfaz del pedido al proveedor

```typescript
// src/features/ordenes/types/orden.types.ts

export interface PedidoProveedor {
  pedidoExternoId: string      // ID de la orden en nuestra DB
  cliente: {
    nombre: string
    email: string
    telefono?: string
  }
  direccionEnvio: {
    calle: string
    ciudad: string
    provincia: string
    codigoPostal: string
    pais: string
  }
  items: Array<{
    productoId: string          // ID del producto en el sistema del proveedor
    cantidad: number
    precioUnitario: number
  }>
}

export type EstadoOrden =
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'ENVIADO_A_PROVEEDOR'
  | 'ERROR_PROVEEDOR'
  | 'EN_CAMINO'
  | 'ENTREGADO'
```

### Service

```typescript
// src/features/ordenes/services/proveedor-pedido.service.ts

import type { PedidoProveedor } from '../types/orden.types'

export async function enviarPedidoAlProveedor(pedido: PedidoProveedor): Promise<void> {
  const res = await fetch(`${process.env.PROVEEDOR_API_URL}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.PROVEEDOR_API_KEY!,
    },
    body: JSON.stringify(pedido),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Proveedor rechazó el pedido ${pedido.pedidoExternoId}: ${error}`)
  }
}
```

### Manejo de errores crítico

```
webhook MP confirma pago
    ↓
Actualizar orden en DB: estado = "PAGADO"
    ↓
try enviarPedidoAlProveedor()
    ↓ éxito                        ↓ fallo
estado = "ENVIADO_A_PROVEEDOR"    estado = "ERROR_PROVEEDOR"
                                   Alertar al admin (dashboard)
```

Si el proveedor rechaza o no responde, la orden NUNCA queda como "completada". El webhook de MP debe verificar si la orden ya fue procesada antes de reenviar al proveedor (protección contra webhooks duplicados — idempotencia).

---

## Paleta de Colores

```css
/* En globals.css */
:root {
  --color-primary: #E8640B;      /* Naranja principal */
  --color-primary-dark: #b34700;
  --color-secondary: #2968C8;    /* Azul */
  --color-secondary-dark: #1a4f9e;
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-border: #EBEBEB;
  --color-bg: #EDEDEE;           /* Gris fondo */
  --color-surface: #FFFFFF;
  --color-success: #00A650;
  --color-danger: #F23D4F;
}
```

---

## Convenciones de Código

### Componentes
- Siempre `'use client'` explícito cuando el componente usa hooks, eventos o estado
- Server Components por defecto para todo lo que no necesita interactividad
- Props tipadas con `interface`, no `type` para componentes
- Un componente = un archivo; nombre del archivo = nombre del componente (PascalCase)

### Rutas API
- Usar `NextResponse.json()` para todas las respuestas
- Manejar errores con try/catch y retornar status codes correctos (400, 401, 404, 500)
- Validar body/params con Zod antes de procesar

### Estilos
- Solo Tailwind CSS — sin CSS modules ni styled-components
- Usar el helper `cn()` (clsx + tailwind-merge) para clases condicionales
- Variantes de componentes con `cva` (class-variance-authority)
- Mobile-first: `sm:`, `md:`, `lg:` breakpoints

### Estado
- Zustand para estado global (carrito, usuario)
- `useState`/`useReducer` para estado local de componentes
- React Query / SWR para data fetching y cache del servidor

### Naming
- Componentes: PascalCase (`ProductCard.tsx`)
- Hooks: camelCase con prefijo `use` (`useCarrito.ts`)
- Stores: camelCase con sufijo `store` (`carrito.store.ts`)
- Servicios: camelCase con sufijo `service` (`producto.service.ts`)
- Archivos de tipos: sufijo `types` (`producto.types.ts`)
- Rutas API: kebab-case en URL, camelCase en handlers

---

## Modelo de Datos (MongoDB — driver nativo)

No se usa Prisma ORM. La capa de datos está en `src/shared/lib/db/`.

### Colecciones y sus tipos TypeScript

```
src/shared/lib/db/types.ts        ← interfaces de documentos
src/shared/lib/db/collections.ts  ← getters tipados + crearIndices()
src/shared/lib/mongodb.ts         ← singleton MongoClient
```

| Colección    | Tipo TS         | Descripción                                   |
|---|---|---|
| `usuarios`   | `UsuarioDoc`    | Creado automáticamente en login/register      |
| `categorias` | `CategoriaDoc`  | Cargado por `scripts/seed-mongodb.mjs`        |
| `productos`  | `ProductoDoc`   | Cache del catálogo del proveedor              |
| `ordenes`    | `OrdenDoc`      | Creada al confirmar checkout                  |

### Acceso a datos — patrón de uso

```typescript
// ✅ Correcto — usar el getter tipado de collections.ts
import { getProductos } from '@/shared/lib/db/collections'
const col = await getProductos()
const producto = await col.findOne({ slug })

// ❌ Incorrecto — no usar getDb() directamente en features
import { getDb } from '@/shared/lib/mongodb'
const db = await getDb()  // solo usar en collections.ts
```

### Roles

```typescript
type Rol = 'ADMIN' | 'VENDEDOR' | 'CLIENTE'
// Se guarda en la colección `usuarios`, campo `rol`
// El rol se verifica en el middleware via JWT
```

### Seed y scripts

```bash
node scripts/seed-mongodb.mjs   # Carga categorías y productos a MongoDB
```

---

## Features Principales (orden de implementación)

1. **Setup inicial** — Next.js + Tailwind + MongoDB (driver nativo) + ESLint/Prettier + Firebase SDK
2. **Firebase Auth** — Login/Register con Firebase, verificación de token en server (firebase-admin), middleware de rutas
3. **Roles y Dashboards** — Roles en MongoDB (`usuarios.rol`), middleware Next.js protegiendo `/dashboard/*`, 3 layouts de dashboard
4. **Adapter de API Proveedor** — Interfaz `ProductoInterno`, función `adaptarProducto()`, integración en `producto.service.ts`
5. **Layout base** — Header, footer, sidebar de dashboards
6. **Catálogo** — Listado de productos con filtros, datos desde adapter
7. **Detalle de producto** — Imágenes, precio, stock, botón agregar al carrito
8. **Búsqueda** — Barra con sugerencias y página de resultados
9. **Carrito** — Drawer lateral, gestión de cantidades, persistencia localStorage
10. **Checkout + envío al proveedor** — Formulario + MercadoPago + `proveedor-pedido.service.ts`
11. **Órdenes** — Historial de compras del cliente, vista de pedidos para admin/vendedor
12. **Dashboards** — CRUD de productos (admin), gestión de pedidos (admin/vendedor), historial (cliente)

---

## Diseño UI

### Header
- Fondo naranja (`#E8640B`) en navbar principal
- Logo a la izquierda
- SearchBar centrado y prominente (borde redondeado, ancho 60%)
- Iconos de carrito y usuario a la derecha
- Segunda barra con links de categorías en fondo blanco

### ProductCard
- Fondo blanco, sombra sutil, border-radius 8px
- Imagen cuadrada con object-cover
- Precio en tipografía grande y bold
- Badge "Envío gratis" en verde (`#00A650`)
- Rating con estrellas y cantidad de reseñas
- Sin botón visible en el card (se agrega desde el detalle)

### Página de Listado
- Sidebar izquierdo con filtros (categoría, precio, condición, ubicación)
- Grid responsivo: 1 col mobile, 2 col tablet, 3-4 col desktop
- Ordenamiento por relevancia, precio, más vendidos
- Paginación al pie

### Página de Detalle
- Breadcrumb superior
- Layout 60/40: imágenes izquierda, info + CTA derecha
- Precio con descuento (precio tachado + precio final + % ahorro)
- Descripción del producto en sección inferior

---

## Scripts NPM

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "format": "prettier --write .",
  "db:seed": "node scripts/seed-mongodb.mjs"
}
```

---

## Variables de Entorno (.env.local)

```env
# Base de datos
DATABASE_URL=

# Firebase Client (público — va al bundle del browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (privado — solo server-side)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=          # Pegar la clave privada con \n literales

# API del Proveedor (dropshipping)
PROVEEDOR_API_URL=
PROVEEDOR_API_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# MercadoPago
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
MP_WEBHOOK_SECRET=
```

---

## Reglas para Claude

- Ante cualquier duda de estructura, respetar la organización feature-based definida arriba
- No crear CSS custom si Tailwind puede resolverlo
- Todos los Server Actions y API Routes deben validar con Zod
- Los componentes de UI en `shared/components/ui/` deben ser genéricos y reutilizables, sin lógica de negocio
- La lógica de negocio vive en `features/[feature]/services/`
- Preferir Server Components sobre Client Components cuando no haya interactividad
- Siempre verificar si un componente o util ya existe antes de crearlo
- El carrito debe persistir en localStorage (Zustand persist middleware)
- Las imágenes siempre a través de `next/image` con tamaños explícitos
- **Adapter obligatorio**: Los datos de la API del proveedor SOLO se acceden a través de `proveedor.adapter.ts`. Nunca usar el formato raw fuera de esa carpeta
- **Firebase Admin solo en server**: `firebase-admin.ts` nunca se importa en Client Components ni en archivos con `'use client'`
- **Roles siempre desde MongoDB**: El rol del usuario viene de la colección `usuarios` en MongoDB, no de Firebase Custom Claims. El `firebaseUid` es solo el puente de identificación. El middleware lo verifica vía JWT (sin hit a DB en cada request)
- **Acceso a MongoDB solo via collections.ts**: Usar los getters tipados `getProductos()`, `getOrdenes()`, etc. de `src/shared/lib/db/collections.ts`. Nunca llamar `getDb()` directamente desde los servicios de features
- **Estados de orden explícitos**: Al actualizar el estado de una orden, siempre usar los valores del tipo `EstadoOrden` definido en `orden.types.ts`. Nunca strings ad-hoc
- **Webhook idempotente**: El handler del webhook de MercadoPago debe verificar si la orden ya fue procesada antes de volver a enviarla al proveedor (protección contra webhooks duplicados)
