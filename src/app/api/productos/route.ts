import { NextRequest, NextResponse } from 'next/server'
import { listarProductos, buscarProductos } from '@/features/productos/services/producto.service'

// GET /api/productos
// Query params:
//   categoriaSlug, subcategoriaSlug, busqueda, precioMin, precioMax, page, limit
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    const busqueda = searchParams.get('busqueda') ?? undefined
    const categoriaSlug = searchParams.get('categoriaSlug') ?? undefined
    const subcategoriaSlug = searchParams.get('subcategoriaSlug') ?? undefined
    const precioMin = searchParams.get('precioMin') ? Number(searchParams.get('precioMin')) : undefined
    const precioMax = searchParams.get('precioMax') ? Number(searchParams.get('precioMax')) : undefined
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 24

    // Búsqueda full-text directa
    if (busqueda && !categoriaSlug && !subcategoriaSlug) {
      const items = await buscarProductos(busqueda, limit)
      return NextResponse.json({ items, total: items.length, page: 1, totalPages: 1 })
    }

    const resultado = await listarProductos({
      categoriaSlug,
      subcategoriaSlug,
      busqueda,
      precioMin,
      precioMax,
      page,
      limit,
    })

    return NextResponse.json(resultado)
  } catch (err) {
    console.error('[api/productos] GET error:', err)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}
