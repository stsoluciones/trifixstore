'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCarritoStore } from '@/features/carrito/store/carrito.store'
import { formatPrice } from '@/shared/utils/formatPrice'

export default function CarritoPage() {
  const items = useCarritoStore(s => s.items)
  const eliminarItem = useCarritoStore(s => s.eliminarItem)
  const actualizarCantidad = useCarritoStore(s => s.actualizarCantidad)
  const totalItems = useCarritoStore(s => s.totalItems)
  const totalPrecio = useCarritoStore(s => s.totalPrecio)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h1 className="text-xl font-semibold text-[#333]">Tu carrito está vacío</h1>
        <p className="text-sm text-[#666]">Descubrí los mejores productos</p>
        <Link
          href="/"
          className="bg-[#E8640B] hover:bg-[#b34700] text-white font-semibold px-6 py-2.5 rounded-sm transition-colors text-sm"
        >
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-[#333]">
        Carrito ({totalItems()} {totalItems() === 1 ? 'producto' : 'productos'})
      </h1>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Lista de items */}
        <div className="flex-1 space-y-3">
          {items.map(({ producto, cantidad }) => (
            <div key={producto.id} className="bg-white rounded-sm border border-[#EBEBEB] p-4 flex gap-4">
              {/* Imagen */}
              <Link href={`/productos/${producto.slug}`} className="relative w-20 h-20 shrink-0">
                <Image
                  src={producto.imagenes[0] ?? 'https://placehold.co/80x80/ebebeb/999?text=...'}
                  alt={producto.nombre}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/productos/${producto.slug}`}
                  className="text-sm text-[#333] hover:text-[#E8640B] line-clamp-2 leading-snug"
                >
                  {producto.nombre}
                </Link>

                <div className="flex items-center gap-3 mt-2">
                  {/* Selector cantidad */}
                  <select
                    value={cantidad}
                    onChange={e => actualizarCantidad(producto.id, Number(e.target.value))}
                    className="border border-[#EBEBEB] rounded-sm px-2 py-1 text-sm text-[#333]"
                  >
                    {Array.from({ length: Math.min(producto.stock || 10, 10) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>

                  {/* Eliminar */}
                  <button
                    onClick={() => eliminarItem(producto.id)}
                    className="text-xs text-[#2968C8] hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Precio */}
              <div className="text-right shrink-0">
                <p className="text-base font-semibold text-[#333]">{formatPrice(producto.precio * cantidad)}</p>
                {cantidad > 1 && (
                  <p className="text-xs text-[#999]">{formatPrice(producto.precio)} c/u</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-sm border border-[#EBEBEB] p-4 space-y-3 sticky top-24">
            <h2 className="text-base font-semibold text-[#333]">Resumen de compra</h2>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Productos ({totalItems()})</span>
              <span className="text-[#333]">{formatPrice(totalPrecio())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Envío</span>
              <span className="text-[#00A650] font-semibold">Gratis</span>
            </div>
            <div className="border-t border-[#EBEBEB] pt-3 flex justify-between">
              <span className="font-semibold text-[#333]">Total</span>
              <span className="font-bold text-lg text-[#333]">{formatPrice(totalPrecio())}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full text-center bg-[#2968C8] hover:bg-[#1a4f9e] text-white font-semibold py-3 rounded-sm transition-colors text-sm"
            >
              Continuar compra
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
