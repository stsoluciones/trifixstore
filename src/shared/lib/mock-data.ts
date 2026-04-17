import { adaptarProductoCeven } from '@/features/productos/adapters/proveedor.adapter'
import categoriasJson from './ceven-categorias.json'
import productosJson from './ceven-productos.json'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Subcategoria {
  id: string
  nombre: string
  slug: string
  categoriaId: string
  nivel?: number
  urlfragment?: string
  subcategorias?: Subcategoria[]
}

export interface Categoria {
  id: string
  nombre: string
  slug: string
  urlfragment?: string
  subcategorias: Subcategoria[]
}

// ─── Categorías (desde ceven-categorias.json) ────────────────────────────────
// Fuente: https://www.ceven.com/catalogo — IDs verificados desde la API de Ceven

export const CATEGORIAS_MOCK: Categoria[] = categoriasJson.categorias as Categoria[]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Devuelve todas las subcategorías de nivel 2 (aplanadas) */
export function getTodasSubcategorias(): Subcategoria[] {
  return CATEGORIAS_MOCK.flatMap(c => c.subcategorias)
}

/** Busca categoría raíz por slug */
export function getCategoriaBySlug(slug: string): Categoria | undefined {
  return CATEGORIAS_MOCK.find(c => c.slug === slug)
}

/** Busca subcategoría de nivel 2 por slug */
export function getSubcategoriaBySlug(slug: string): Subcategoria | undefined {
  return getTodasSubcategorias().find(s => s.slug === slug)
}

// ─── Productos (desde ceven-productos.json) ───────────────────────────────────
// Generado por: node scripts/fetch-ceven.mjs
// Para actualizar: volvé a correr el script

export const PRODUCTOS_MOCK = (productosJson.items as unknown[]).map(item =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adaptarProductoCeven(item as any, 'computacion')
)
