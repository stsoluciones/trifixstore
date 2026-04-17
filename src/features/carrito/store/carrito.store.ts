import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductoInterno } from '@/features/productos/types/producto.types'
import type { CarritoItem } from '../types/carrito.types'

interface CarritoState {
  items: CarritoItem[]
  agregarItem: (producto: ProductoInterno, cantidad?: number) => void
  eliminarItem: (productoId: string) => void
  actualizarCantidad: (productoId: string, cantidad: number) => void
  vaciarCarrito: () => void
  totalItems: () => number
  totalPrecio: () => number
}

export const useCarritoStore = create<CarritoState>()(
  persist(
    (set, get) => ({
      items: [],

      agregarItem: (producto, cantidad = 1) => {
        const items = get().items
        const existente = items.find(i => i.producto.id === producto.id)

        if (existente) {
          set({
            items: items.map(i =>
              i.producto.id === producto.id
                ? { ...i, cantidad: i.cantidad + cantidad }
                : i
            ),
          })
        } else {
          set({ items: [...items, { producto, cantidad }] })
        }
      },

      eliminarItem: (productoId) => {
        set({ items: get().items.filter(i => i.producto.id !== productoId) })
      },

      actualizarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().eliminarItem(productoId)
          return
        }
        set({
          items: get().items.map(i =>
            i.producto.id === productoId ? { ...i, cantidad } : i
          ),
        })
      },

      vaciarCarrito: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),

      totalPrecio: () =>
        get().items.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0),
    }),
    {
      name: 'trifixstore-carrito',
    }
  )
)
