import { ObjectId } from 'mongodb'
import { getProductos } from '@/shared/lib/db/collections'
import type { ProductoDoc } from '@/shared/lib/db/types'

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

export interface FiltrosProductos {
  categoriaSlug?: string
  subcategoriaSlug?: string
  activo?: boolean
  precioMin?: number
  precioMax?: number
  busqueda?: string
  page?: number
  limit?: number
}

export interface PaginadoProductos {
  items: ProductoDoc[]
  total: number
  page: number
  totalPages: number
}

// ─── Listar con filtros y paginación ─────────────────────────────────────────

export async function listarProductos(
  filtros: FiltrosProductos = {}
): Promise<PaginadoProductos> {
  const col = await getProductos()
  const {
    categoriaSlug,
    subcategoriaSlug,
    activo = true,
    precioMin,
    precioMax,
    busqueda,
    page = 1,
    limit = 24,
  } = filtros

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = { activo }

  if (categoriaSlug) query.categoriaSlug = categoriaSlug
  if (subcategoriaSlug) query.subcategoriaSlug = subcategoriaSlug
  if (precioMin !== undefined || precioMax !== undefined) {
    query.precio = {}
    if (precioMin !== undefined) query.precio.$gte = precioMin
    if (precioMax !== undefined) query.precio.$lte = precioMax
  }
  if (busqueda) {
    query.$text = { $search: busqueda }
  }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    col.find(query).skip(skip).limit(limit).toArray(),
    col.countDocuments(query),
  ])

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

// ─── Obtener por slug ─────────────────────────────────────────────────────────

export async function obtenerProductoPorSlug(slug: string): Promise<ProductoDoc | null> {
  const col = await getProductos()
  return col.findOne({ slug, activo: true })
}

// ─── Obtener por ID interno ───────────────────────────────────────────────────

export async function obtenerProductoPorId(id: string): Promise<ProductoDoc | null> {
  const col = await getProductos()
  if (!ObjectId.isValid(id)) return null
  return col.findOne({ _id: new ObjectId(id) })
}

// ─── Obtener por proveedorId ──────────────────────────────────────────────────

export async function obtenerProductoPorProveedorId(proveedorId: string): Promise<ProductoDoc | null> {
  const col = await getProductos()
  return col.findOne({ proveedorId })
}

// ─── Upsert (usado en sync con API del proveedor y en seed) ──────────────────

export async function upsertProducto(
  data: Omit<ProductoDoc, '_id'>
): Promise<void> {
  const col = await getProductos()
  await col.updateOne(
    { proveedorId: data.proveedorId },
    { $set: { ...data, actualizadoEn: new Date() } },
    { upsert: true }
  )
}

// ─── Activar / desactivar (admin) ─────────────────────────────────────────────

export async function toggleActivoProducto(id: string, activo: boolean): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false
  const col = await getProductos()
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { activo, actualizadoEn: new Date() } }
  )
  return result.modifiedCount === 1
}

// ─── Búsqueda full-text ───────────────────────────────────────────────────────

export async function buscarProductos(termino: string, limit = 10): Promise<ProductoDoc[]> {
  const col = await getProductos()
  return col
    .find({ $text: { $search: termino }, activo: true })
    .limit(limit)
    .toArray()
}

// ─── Destacados (con precioOriginal > precio) ────────────────────────────────

export async function obtenerDestacados(limit = 8): Promise<ProductoDoc[]> {
  const col = await getProductos()
  return col
    .find({ activo: true, precioOriginal: { $exists: true, $gt: 0 } })
    .limit(limit)
    .toArray()
}

// ─── Recientes ────────────────────────────────────────────────────────────────

export async function obtenerRecientes(limit = 8): Promise<ProductoDoc[]> {
  const col = await getProductos()
  return col
    .find({ activo: true })
    .sort({ creadoEn: -1 })
    .limit(limit)
    .toArray()
}
