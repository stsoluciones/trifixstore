import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CATEGORIAS_MOCK, PRODUCTOS_MOCK } from '@/shared/lib/mock-data'
import ProductCard from '@/features/productos/components/ProductCard'
import ProductFilters from '@/features/productos/components/ProductFilters'
import type { ProductoInterno } from '@/features/productos/types/producto.types'

interface Props {
  params: Promise<{ categoria: string }>
  searchParams: Promise<{ orden?: string; stock?: string; sub?: string }>
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

export async function generateMetadata({ params }: Props) {
  const { categoria: slug } = await params
  const cat = CATEGORIAS_MOCK.find(c => c.slug === slug)
  if (!cat) return {}
  return { title: `${cat.nombre} — Trifixstore` }
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { categoria: slug } = await params
  const { orden = 'relevancia', stock, sub } = await searchParams

  const categoria = CATEGORIAS_MOCK.find(c => c.slug === slug)
  if (!categoria) notFound()

  // Filtrar por subcategoría si se seleccionó
  let productos = PRODUCTOS_MOCK.filter(p => {
    if (!p.activo) return false
    if (sub) return p.categoriaId === sub
    // Mostrar productos de todas las subcategorías de esta categoría
    const subcatIds = categoria.subcategorias.map(s => s.id)
    return subcatIds.includes(p.categoriaId)
  })

  if (stock === '1') productos = productos.filter(p => p.stock > 0)
  productos = ordenarProductos(productos, orden)

  const subcategoriaActiva = sub ? categoria.subcategorias.find(s => s.slug === sub) : null

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-xs text-[#666] mb-4 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-[#E8640B] cursor-pointer">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-[#E8640B] cursor-pointer">Productos</Link>
        <span>/</span>
        {subcategoriaActiva ? (
          <>
            <Link href={`/categorias/${categoria.slug}`} className="hover:text-[#E8640B] cursor-pointer">
              {categoria.nombre}
            </Link>
            <span>/</span>
            <span className="text-[#333] font-medium">{subcategoriaActiva.nombre}</span>
          </>
        ) : (
          <span className="text-[#333] font-medium">{categoria.nombre}</span>
        )}
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#333]">
          {subcategoriaActiva ? subcategoriaActiva.nombre : categoria.nombre}
        </h1>
        <p className="text-sm text-[#666] mt-1">{productos.length} productos</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="hidden md:block w-52 shrink-0">
          {/* Subcategorías */}
          <div className="bg-white rounded-sm border border-[#EBEBEB] p-4 mb-3">
            <h3 className="text-sm font-semibold text-[#333] mb-3">Subcategorías</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href={`/categorias/${categoria.slug}`}
                  className={`text-sm block py-1 transition-colors cursor-pointer ${
                    !sub ? 'text-[#E8640B] font-semibold' : 'text-[#333] hover:text-[#E8640B]'
                  }`}
                >
                  Todas
                </Link>
              </li>
              {categoria.subcategorias.map(subcat => (
                <li key={subcat.id}>
                  <Link
                    href={`/categorias/${categoria.slug}?sub=${subcat.slug}`}
                    className={`text-sm block py-1 transition-colors cursor-pointer ${
                      sub === subcat.slug ? 'text-[#E8640B] font-semibold' : 'text-[#333] hover:text-[#E8640B]'
                    }`}
                  >
                    {subcat.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Suspense>
            <ProductFilters categoriaActiva={slug} />
          </Suspense>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {productos.length === 0 ? (
            <div className="bg-white rounded-sm border border-[#EBEBEB] p-12 text-center">
              <p className="text-[#666]">No hay productos disponibles en esta categoría.</p>
              <Link href="/productos" className="text-[#2968C8] text-sm mt-2 inline-block hover:underline cursor-pointer">
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
