import { ObjectId } from 'mongodb'

// ─── Usuarios ─────────────────────────────────────────────────────────────────

export type Rol = 'ADMIN' | 'VENDEDOR' | 'CLIENTE'

export interface UsuarioDoc {
  _id?: ObjectId
  firebaseUid: string
  email: string
  nombre: string | null
  telefono?: string
  rol: Rol
  creadoEn: Date
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export interface SubcategoriaDoc {
  id: string
  nombre: string
  slug: string
  nivel?: number
  urlfragment?: string
}

export interface CategoriaDoc {
  _id?: ObjectId
  nombre: string
  slug: string
  urlfragment?: string
  subcategorias: SubcategoriaDoc[]
}

// ─── Productos ────────────────────────────────────────────────────────────────

export interface ProductoDoc {
  _id?: ObjectId
  proveedorId: string          // ID del producto en el sistema del proveedor
  nombre: string
  descripcion: string
  slug: string
  precio: number
  precioOriginal?: number
  imagenes: string[]
  stock: number
  activo: boolean
  categoriaSlug: string        // slug de la categoría padre
  subcategoriaSlug?: string    // slug de la subcategoría, si aplica
  metadatos?: Record<string, unknown>
  creadoEn: Date
  actualizadoEn: Date
}

// ─── Órdenes ──────────────────────────────────────────────────────────────────

export type EstadoOrden =
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'ENVIADO_A_PROVEEDOR'
  | 'ERROR_PROVEEDOR'
  | 'EN_CAMINO'
  | 'ENTREGADO'

export interface ItemOrdenDoc {
  productoId: string           // proveedorId del producto
  nombre: string               // snapshot del nombre al momento de la compra
  imagen?: string
  cantidad: number
  precioUnitario: number
}

export interface DireccionDoc {
  calle: string
  ciudad: string
  provincia: string
  codigoPostal: string
  pais: string
}

export interface OrdenDoc {
  _id?: ObjectId
  usuarioId: string            // firebaseUid del cliente
  usuarioEmail: string
  estado: EstadoOrden
  total: number
  mpPagoId?: string
  items: ItemOrdenDoc[]
  direccionEnvio?: DireccionDoc
  creadoEn: Date
  actualizadoEn: Date
}
