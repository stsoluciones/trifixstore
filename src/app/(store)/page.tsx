import ProductCard from '@/features/productos/components/ProductCard'
import { PRODUCTOS_MOCK, CATEGORIAS_MOCK } from '@/shared/lib/mock-data'
import Link from 'next/link'

export default function HomePage() {
  const destacados = PRODUCTOS_MOCK.filter(p => p.precioOriginal)
  const recientes = PRODUCTOS_MOCK.slice(0, 8)

  return (
    <div className="space-y-8">
      {/* Banner hero */}
      <div className="bg-[#E8640B] rounded-sm p-8 text-white flex flex-col items-start gap-3">
        <h1 className="text-3xl font-bold">Bienvenido a Trifixstore</h1>
        <p className="text-white/90 text-lg">Los mejores productos con envío gratis</p>
        <Link
          href="/productos"
          className="bg-white text-[#E8640B] font-semibold px-6 py-2 rounded-sm hover:bg-orange-50 transition-colors text-sm cursor-pointer"
        >
          Ver catálogo completo
        </Link>
      </div>

      {/* Categorías principales con subcategorías */}
      <section>
        <h2 className="text-lg font-semibold text-[#333] mb-4">Explorar categorías</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORIAS_MOCK.map(cat => (
            <div key={cat.id} className="bg-white rounded-sm border border-[#EBEBEB] p-4">
              <Link
                href={`/categorias/${cat.slug}`}
                className="text-sm font-semibold text-[#333] hover:text-[#E8640B] transition-colors cursor-pointer"
              >
                {cat.nombre}
              </Link>
              <ul className="mt-2 space-y-1">
                {cat.subcategorias.slice(0, 5).map(sub => (
                  <li key={sub.id}>
                    <Link
                      href={`/categorias/${cat.slug}?sub=${sub.slug}`}
                      className="text-xs text-[#666] hover:text-[#E8640B] transition-colors cursor-pointer"
                    >
                      {sub.nombre}
                    </Link>
                  </li>
                ))}
                {cat.subcategorias.length > 5 && (
                  <li>
                    <Link
                      href={`/categorias/${cat.slug}`}
                      className="text-xs text-[#2968C8] hover:underline cursor-pointer"
                    >
                      Ver todas ({cat.subcategorias.length})
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Ofertas destacadas */}
      {destacados.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#333]">Ofertas del día</h2>
            <Link href="/productos" className="text-sm text-[#2968C8] hover:underline cursor-pointer">Ver todas</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {destacados.slice(0, 8).map(producto => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}

      {/* Productos recientes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#333]">Productos destacados</h2>
          <Link href="/productos" className="text-sm text-[#2968C8] hover:underline cursor-pointer">Ver catálogo</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {recientes.map(producto => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      </section>
    </div>
  )
}
