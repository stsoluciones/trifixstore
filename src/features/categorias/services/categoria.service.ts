import { getCategorias } from '@/shared/lib/db/collections'
import type { CategoriaDoc } from '@/shared/lib/db/types'

// ─── Leer todas las categorías ────────────────────────────────────────────────

export async function listarCategorias(): Promise<CategoriaDoc[]> {
  const col = await getCategorias()
  return col.find({}).sort({ nombre: 1 }).toArray()
}

// ─── Buscar por slug ──────────────────────────────────────────────────────────

export async function obtenerCategoriaPorSlug(slug: string): Promise<CategoriaDoc | null> {
  const col = await getCategorias()
  return col.findOne({ slug })
}

// ─── Upsert (usado en seed) ───────────────────────────────────────────────────

export async function upsertCategoria(
  data: Omit<CategoriaDoc, '_id'>
): Promise<void> {
  const col = await getCategorias()
  await col.updateOne(
    { slug: data.slug },
    { $set: data },
    { upsert: true }
  )
}
