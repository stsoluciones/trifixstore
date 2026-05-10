import { ObjectId } from 'mongodb'
import { getOrdenes } from '@/shared/lib/db/collections'
import type { OrdenDoc, EstadoOrden, ItemOrdenDoc, DireccionDoc } from '@/shared/lib/db/types'

// ─── Crear orden nueva ────────────────────────────────────────────────────────

export interface CrearOrdenInput {
  usuarioId: string
  usuarioEmail: string
  items: ItemOrdenDoc[]
  total: number
  direccionEnvio: DireccionDoc
}

export async function crearOrden(input: CrearOrdenInput): Promise<OrdenDoc> {
  const col = await getOrdenes()
  const ahora = new Date()

  const orden: OrdenDoc = {
    usuarioId: input.usuarioId,
    usuarioEmail: input.usuarioEmail,
    estado: 'PENDIENTE_PAGO',
    total: input.total,
    items: input.items,
    direccionEnvio: input.direccionEnvio,
    creadoEn: ahora,
    actualizadoEn: ahora,
  }

  const result = await col.insertOne(orden)
  return { ...orden, _id: result.insertedId }
}

// ─── Obtener por ID ───────────────────────────────────────────────────────────

export async function obtenerOrdenPorId(id: string): Promise<OrdenDoc | null> {
  if (!ObjectId.isValid(id)) return null
  const col = await getOrdenes()
  return col.findOne({ _id: new ObjectId(id) })
}

// ─── Órdenes de un usuario ────────────────────────────────────────────────────

export async function listarOrdenesPorUsuario(usuarioId: string): Promise<OrdenDoc[]> {
  const col = await getOrdenes()
  return col
    .find({ usuarioId })
    .sort({ creadoEn: -1 })
    .toArray()
}

// ─── Todas las órdenes (admin / vendedor) ────────────────────────────────────

export async function listarTodasLasOrdenes(
  filtros: { estado?: EstadoOrden; page?: number; limit?: number } = {}
): Promise<{ items: OrdenDoc[]; total: number }> {
  const col = await getOrdenes()
  const { estado, page = 1, limit = 20 } = filtros

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {}
  if (estado) query.estado = estado

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    col.find(query).sort({ creadoEn: -1 }).skip(skip).limit(limit).toArray(),
    col.countDocuments(query),
  ])

  return { items, total }
}

// ─── Actualizar estado ────────────────────────────────────────────────────────

export async function actualizarEstadoOrden(
  id: string,
  estado: EstadoOrden,
  extras?: { mpPagoId?: string }
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false
  const col = await getOrdenes()

  const update: Record<string, unknown> = {
    estado,
    actualizadoEn: new Date(),
  }
  if (extras?.mpPagoId) update.mpPagoId = extras.mpPagoId

  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  )
  return result.modifiedCount === 1
}

// ─── Verificar si la orden ya fue procesada (idempotencia webhook) ────────────

export async function ordenYaFueProcesada(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false
  const col = await getOrdenes()
  const orden = await col.findOne(
    { _id: new ObjectId(id) },
    { projection: { estado: 1 } }
  )
  if (!orden) return false
  const estadosProcesados: EstadoOrden[] = ['ENVIADO_A_PROVEEDOR', 'EN_CAMINO', 'ENTREGADO']
  return estadosProcesados.includes(orden.estado as EstadoOrden)
}
