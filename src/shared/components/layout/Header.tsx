'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CATEGORIAS_MOCK } from '@/shared/lib/mock-data'
import { useCarritoStore } from '@/features/carrito/store/carrito.store'

export default function Header() {
  const [busqueda, setBusqueda] = useState('')
  const totalItems = useCarritoStore(s => s.totalItems)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const cantidadCarrito = mounted ? totalItems() : 0

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    if (busqueda.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(busqueda.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Barra principal naranja */}
      <div className="bg-[#E8640B]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="text-white font-bold text-xl shrink-0 tracking-tight cursor-pointer">
            trifixstore
          </Link>

          {/* Buscador */}
          <form onSubmit={handleBuscar} className="flex-1 max-w-2xl">
            <div className="flex">
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full px-4 py-2 text-sm rounded-l-sm outline-none text-[#333] bg-white"
              />
              <button
                type="submit"
                className="bg-[#b34700] hover:bg-[#8f3800] text-white px-5 py-2 rounded-r-sm transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Acciones */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/login" className="text-white text-sm hover:underline hidden sm:block cursor-pointer">
              Ingresá
            </Link>
            <Link href="/register" className="text-white text-sm hover:underline hidden sm:block cursor-pointer">
              Creá tu cuenta
            </Link>
            <Link href="/carrito" className="relative text-white cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cantidadCarrito > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#E8640B] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cantidadCarrito > 99 ? '99+' : cantidadCarrito}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Barra de categorías */}
      <div className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-6 overflow-x-auto scrollbar-hide">
            {CATEGORIAS_MOCK.map(cat => (
              <Link
                key={cat.id}
                href={`/categorias/${cat.slug}`}
                className="text-sm text-[#333] hover:text-[#E8640B] py-2.5 whitespace-nowrap border-b-2 border-transparent hover:border-[#E8640B] transition-colors cursor-pointer"
              >
                {cat.nombre}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
