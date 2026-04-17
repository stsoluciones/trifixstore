import type { ProductoInterno } from '@/features/productos/types/producto.types'

export interface CarritoItem {
  producto: ProductoInterno
  cantidad: number
}
