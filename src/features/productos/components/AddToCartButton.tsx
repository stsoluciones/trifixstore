'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ProductoInterno } from '../types/producto.types'
import { useCarritoStore } from '@/features/carrito/store/carrito.store'

interface Props {
  producto: ProductoInterno
}

export default function AddToCartButton({ producto }: Props) {
  const [agregado, setAgregado] = useState(false)
  const agregarItem = useCarritoStore(s => s.agregarItem)

  function handleAgregar() {
    agregarItem(producto, 1)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  if (producto.stock === 0) {
    return (
      <div className="flex flex-col gap-2 pt-2">
        <button disabled className="w-full bg-[#ccc] cursor-not-allowed text-white font-semibold py-3 rounded-sm">
          Sin stock
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 pt-2">
      <button
        onClick={handleAgregar}
        className="w-full bg-[#E8640B] hover:bg-[#b34700] text-white font-semibold py-3 rounded-sm transition-colors cursor-pointer"
      >
        {agregado ? 'Agregado al carrito' : 'Agregar al carrito'}
      </button>
      <Link
        href="/carrito"
        onClick={handleAgregar}
        className="w-full text-center bg-[#2968C8] hover:bg-[#1a4f9e] text-white font-semibold py-3 rounded-sm transition-colors block cursor-pointer"
      >
        Comprar ahora
      </Link>
    </div>
  )
}
