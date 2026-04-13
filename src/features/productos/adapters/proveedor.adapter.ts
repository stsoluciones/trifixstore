import type { ProductoInterno } from '../types/producto.types'

export function adaptarProducto(raw: unknown): ProductoInterno {
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
