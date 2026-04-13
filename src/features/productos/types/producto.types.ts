export interface ProductoInterno {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioOriginal?: number
  imagenes: string[]
  categoriaId: string
  stock: number
  slug: string
  activo: boolean
  metadatos?: Record<string, unknown>
}
