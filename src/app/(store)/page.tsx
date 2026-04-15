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
          className="bg-white text-[#E8640B] font-semibold px-6 py-2 rounded-sm hover:bg-orange-50 transition-colors text-sm"
        >
          Ver catálogo completo
        </Link>
      </div>

      {/* Categorías */}
      <section>
        <h2 className="text-lg font-semibold text-[#333] mb-4">Comprar por categoría</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIAS_MOCK.map(cat => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="bg-white rounded-sm p-4 text-center hover:shadow-md transition-shadow group border border-[#EBEBEB]"
            >
              <p className="text-sm text-[#333] font-medium group-hover:text-[#E8640B] transition-colors">{cat.nombre}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Ofertas destacadas — solo si hay productos con descuento */}
      {destacados.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#333]">Ofertas del día</h2>
            <Link href="/productos" className="text-sm text-[#2968C8] hover:underline">Ver todas</Link>
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
          <Link href="/productos" className="text-sm text-[#2968C8] hover:underline">Ver catálogo</Link>
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
