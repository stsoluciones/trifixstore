import { Suspense } from 'react'
import Link from 'next/link'
import ProductCard from '@/features/productos/components/ProductCard'
import ProductFilters from '@/features/productos/components/ProductFilters'
import { PRODUCTOS_MOCK, CATEGORIAS_MOCK } from '@/shared/lib/mock-data'
import type { ProductoInterno } from '@/features/productos/types/producto.types'

interface Props {
  searchParams: Promise<{ orden?: string; categoria?: string; stock?: string }>
}

function ordenarProductos(lista: ProductoInterno[], orden: string) {
  switch (orden) {
    case 'precio-asc':
      return [...lista].sort((a, b) => a.precio - b.precio)
    case 'precio-desc':
      return [...lista].sort((a, b) => b.precio - a.precio)
    case 'descuento':
      return [...lista].sort((a, b) => {
        const da = a.precioOriginal ? (1 - a.precio / a.precioOriginal) : 0
        const db = b.precioOriginal ? (1 - b.precio / b.precioOriginal) : 0
        return db - da
      })
    default:
      return lista
  }
}

export const metadata = { title: 'Productos — Trifixstore' }

export default async function ProductosPage({ searchParams }: Props) {
  const { orden = 'relevancia', categoria, stock } = await searchParams

  let productos = PRODUCTOS_MOCK.filter(p => p.activo)
  if (categoria) {
    const cat = CATEGORIAS_MOCK.find(c => c.slug === categoria)
    if (cat) productos = productos.filter(p => p.categoriaId === cat.id)
  }
  if (stock === '1') productos = productos.filter(p => p.stock > 0)
  productos = ordenarProductos(productos, orden)

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-xs text-[#666] mb-4 flex items-center gap-1">
        <Link href="/" className="hover:text-[#E8640B]">Inicio</Link>
        <span>/</span>
        <span className="text-[#333] font-medium">Productos</span>
      </nav>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="hidden md:block w-52 shrink-0">
          <Suspense>
            <ProductFilters />
          </Suspense>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#666]">
              <span className="font-semibold text-[#333]">{productos.length}</span> productos encontrados
            </p>
          </div>

          {productos.length === 0 ? (
            <div className="bg-white rounded-sm border border-[#EBEBEB] p-12 text-center">
              <p className="text-[#666]">No hay productos que coincidan con los filtros.</p>
              <Link href="/productos" className="text-[#2968C8] text-sm mt-2 inline-block hover:underline">
                Ver todos los productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {productos.map(p => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
