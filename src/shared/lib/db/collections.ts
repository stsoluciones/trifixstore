import { Collection } from 'mongodb'
import { getDb } from '@/shared/lib/mongodb'
import type {
  UsuarioDoc,
  CategoriaDoc,
  ProductoDoc,
  OrdenDoc,
} from './types'

// ─── Getters de colecciones tipadas ───────────────────────────────────────────
// Uso: const col = await getUsuarios()

export async function getUsuarios(): Promise<Collection<UsuarioDoc>> {
  const db = await getDb()
  return db.collection<UsuarioDoc>('usuarios')
}

export async function getCategorias(): Promise<Collection<CategoriaDoc>> {
  const db = await getDb()
  return db.collection<CategoriaDoc>('categorias')
}

export async function getProductos(): Promise<Collection<ProductoDoc>> {
  const db = await getDb()
  return db.collection<ProductoDoc>('productos')
}

export async function getOrdenes(): Promise<Collection<OrdenDoc>> {
  const db = await getDb()
  return db.collection<OrdenDoc>('ordenes')
}

// ─── Inicialización de índices ────────────────────────────────────────────────
// Llamar una sola vez al iniciar el server (Next.js instrumentation o script)

export async function crearIndices(): Promise<void> {
  const db = await getDb()

  await Promise.all([
    // Usuarios
    db.collection('usuarios').createIndex({ firebaseUid: 1 }, { unique: true }),
    db.collection('usuarios').createIndex({ email: 1 }, { unique: true }),

    // Categorías
    db.collection('categorias').createIndex({ slug: 1 }, { unique: true }),

    // Productos
    db.collection('productos').createIndex({ slug: 1 }, { unique: true }),
    db.collection('productos').createIndex({ proveedorId: 1 }, { unique: true }),
    db.collection('productos').createIndex({ categoriaSlug: 1 }),
    db.collection('productos').createIndex({ activo: 1 }),
    db.collection('productos').createIndex({ precio: 1 }),
    db.collection('productos').createIndex({ nombre: 'text', descripcion: 'text' }),

    // Órdenes
    db.collection('ordenes').createIndex({ usuarioId: 1 }),
    db.collection('ordenes').createIndex({ estado: 1 }),
    db.collection('ordenes').createIndex({ mpPagoId: 1 }, { sparse: true }),
    db.collection('ordenes').createIndex({ creadoEn: -1 }),
  ])
}
