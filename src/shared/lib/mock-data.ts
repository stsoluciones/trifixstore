import { adaptarProductoCeven } from '@/features/productos/adapters/proveedor.adapter'
import productosJson from './productos-mock.json'

// Categorías basadas en catalogo-mock.json de Ceven
export const CATEGORIAS_MOCK = [
  { id: '10073', nombre: 'Tecnología',       slug: 'tecnologia' },
  { id: '10074', nombre: 'TV y Audio',        slug: 'tv-y-audio' },
  { id: '10071', nombre: 'Electrodomésticos', slug: 'electrodomesticos' },
  { id: '10072', nombre: 'Hogar',             slug: 'hogar' },
]

// Todos los productos del JSON son de TECNOLOGÍA (MacBooks / Computación)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PRODUCTOS_MOCK = (productosJson.items as any[]).map(item =>
  adaptarProductoCeven(item, '10073')
)
