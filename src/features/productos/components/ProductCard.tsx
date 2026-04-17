import Link from 'next/link'
import Image from 'next/image'
import type { ProductoInterno } from '../types/producto.types'
import { formatPrice } from '@/shared/utils/formatPrice'

interface Props {
  producto: ProductoInterno
}

export default function ProductCard({ producto }: Props) {
  const descuento = producto.precioOriginal
    ? Math.round((1 - producto.precio / producto.precioOriginal) * 100)
    : null

  return (
    <Link
      href={`/productos/${producto.slug}`}
      className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group cursor-pointer"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
        <Image
          src={producto.imagenes[0] ?? 'https://placehold.co/400x400/ebebeb/999?text=Sin+imagen'}
          alt={producto.nombre}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {descuento && (
          <span className="absolute top-2 left-2 bg-[#00A650] text-white text-xs font-semibold px-2 py-0.5 rounded-sm">
            -{descuento}%
          </span>
        )}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-semibold text-[#666]">Sin stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {/* Precio */}
        <div>
          {producto.precioOriginal && (
            <p className="text-xs text-[#999] line-through">{formatPrice(producto.precioOriginal)}</p>
          )}
          <p className="text-lg font-semibold text-[#333]">{formatPrice(producto.precio)}</p>
          {descuento && (
            <p className="text-xs text-[#00A650] font-semibold">{descuento}% OFF</p>
          )}
        </div>

        {/* Nombre */}
        <p className="text-sm text-[#333] leading-snug line-clamp-2 mt-1">{producto.nombre}</p>

        {/* Envío gratis */}
        <p className="text-xs text-[#00A650] font-semibold mt-auto pt-2">Envío gratis</p>
      </div>
    </Link>
  )
}
