import { NextResponse } from 'next/server'
import { listarCategorias } from '@/features/categorias/services/categoria.service'

// GET /api/categorias
export async function GET() {
  try {
    const categorias = await listarCategorias()
    return NextResponse.json(categorias)
  } catch (err) {
    console.error('[api/categorias] GET error:', err)
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
  }
}
