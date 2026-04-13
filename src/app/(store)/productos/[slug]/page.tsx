import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PRODUCTOS_MOCK, CATEGORIAS_MOCK } from '@/shared/lib/mock-data'
import { formatPrice } from '@/shared/utils/formatPrice'
import ProductImages from '@/features/productos/components/ProductImages'
import ProductCard from '@/features/productos/components/ProductCard'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const producto = PRODUCTOS_MOCK.find(p => p.slug === slug)
  if (!producto) return {}
  return { title: `${producto.nombre} — Trifixstore` }
}

export default async function ProductoDetallePage({ params }: Props) {
  const { slug } = await params
  const producto = PRODUCTOS_MOCK.find(p => p.slug === slug && p.activo)
  if (!producto) notFound()

  const categoria = CATEGORIAS_MOCK.find(c => c.id === producto.categoriaId)
  const descuento = producto.precioOriginal
    ? Math.round((1 - producto.precio / producto.precioOriginal) * 100)
    : null

  const relacionados = PRODUCTOS_MOCK.filter(
    p => p.categoriaId === producto.categoriaId && p.id !== producto.id && p.activo
  ).slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#666] flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-[#E8640B]">Inicio</Link>
        <span>/</span>
        {categoria && (
          <>
            <Link href={`/categorias/${categoria.slug}`} className="hover:text-[#E8640B]">
              {categoria.nombre}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#333] font-medium line-clamp-1">{producto.nombre}</span>
      </nav>

      {/* Layout principal */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Imágenes — 55% */}
        <div className="md:w-[55%]">
          <ProductImages imagenes={producto.imagenes} nombre={producto.nombre} />
        </div>

        {/* Info — 45% */}
        <div className="md:w-[45%] flex flex-col gap-4">
          {/* Categoría */}
          {categoria && (
            <Link
              href={`/categorias/${categoria.slug}`}
              className="text-xs text-[#2968C8] hover:underline font-medium uppercase tracking-wide"
            >
              {categoria.nombre}
            </Link>
          )}

          {/* Nombre */}
          <h1 className="text-xl font-semibold text-[#333] leading-snug">{producto.nombre}</h1>

          {/* Precio */}
          <div className="bg-white rounded-sm border border-[#EBEBEB] p-4 space-y-1">
            {producto.precioOriginal && (
              <p className="text-sm text-[#999] line-through">{formatPrice(producto.precioOriginal)}</p>
            )}
            <p className="text-3xl font-bold text-[#333]">{formatPrice(producto.precio)}</p>
            {descuento && (
              <span className="inline-block bg-[#00A650] text-white text-xs font-semibold px-2 py-0.5 rounded-sm">
                {descuento}% OFF
              </span>
            )}
            <p className="text-sm text-[#00A650] font-semibold pt-1">Envío gratis</p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {producto.stock > 0 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#00A650] inline-block" />
                <span className="text-sm text-[#333]">
                  {producto.stock > 10 ? 'Disponible' : `Solo ${producto.stock} en stock`}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#F23D4F] inline-block" />
                <span className="text-sm text-[#F23D4F] font-medium">Sin stock</span>
              </>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              disabled={producto.stock === 0}
              className="w-full bg-[#E8640B] hover:bg-[#b34700] disabled:bg-[#ccc] disabled:cursor-not-allowed text-white font-semibold py-3 rounded-sm transition-colors"
            >
              Agregar al carrito
            </button>
            <button
              disabled={producto.stock === 0}
              className="w-full bg-[#2968C8] hover:bg-[#1a4f9e] disabled:bg-[#ccc] disabled:cursor-not-allowed text-white font-semibold py-3 rounded-sm transition-colors"
            >
              Comprar ahora
            </button>
          </div>

          {/* Info extra */}
          <div className="border border-[#EBEBEB] rounded-sm divide-y divide-[#EBEBEB]">
            <div className="flex items-center gap-3 px-4 py-3">
              <ShippingIcon />
              <div>
                <p className="text-sm font-medium text-[#333]">Envío gratis</p>
                <p className="text-xs text-[#666]">A todo el país</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <ShieldIcon />
              <div>
                <p className="text-sm font-medium text-[#333]">Compra protegida</p>
                <p className="text-xs text-[#666]">Tu dinero está seguro</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-white rounded-sm border border-[#EBEBEB] p-6">
        <h2 className="text-base font-semibold text-[#333] mb-3">Descripción del producto</h2>
        <p className="text-sm text-[#555] leading-relaxed">{producto.descripcion}</p>
      </div>

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#333] mb-4">Productos relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {relacionados.map(p => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ShippingIcon() {
  return (
    <svg className="w-5 h-5 text-[#00A650] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 10a2 2 0 002 2h8a2 2 0 002-2l1-10M10 12l2 2 4-4" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5 text-[#2968C8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
