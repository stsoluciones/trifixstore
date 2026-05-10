import { NextRequest, NextResponse } from 'next/server'
import { obtenerProductoPorSlug } from '@/features/productos/services/producto.service'

// GET /api/productos/:slug
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const producto = await obtenerProductoPorSlug(slug)

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(producto)
  } catch (err) {
    console.error('[api/productos/[slug]] GET error:', err)
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}
