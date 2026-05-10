import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyJWT } from '@/shared/lib/jwt'
import {
  obtenerOrdenPorId,
  actualizarEstadoOrden,
} from '@/features/ordenes/services/orden.service'
import type { EstadoOrden } from '@/shared/lib/db/types'

const ESTADOS_VALIDOS: EstadoOrden[] = [
  'PENDIENTE_PAGO',
  'PAGADO',
  'ENVIADO_A_PROVEEDOR',
  'ERROR_PROVEEDOR',
  'EN_CAMINO',
  'ENTREGADO',
]

const PatchSchema = z.object({
  estado: z.enum(ESTADOS_VALIDOS as [EstadoOrden, ...EstadoOrden[]]),
  mpPagoId: z.string().optional(),
})

// ─── GET /api/ordenes/:id ─────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('session-token')?.value
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const payload = await verifyJWT(token)
    const { id } = await params
    const orden = await obtenerOrdenPorId(id)

    if (!orden) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

    // El cliente solo puede ver sus propias órdenes
    if (payload.rol === 'CLIENTE' && orden.usuarioId !== payload.uid) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })
    }

    return NextResponse.json(orden)
  } catch (err) {
    console.error('[api/ordenes/[id]] GET error:', err)
    return NextResponse.json({ error: 'Error al obtener orden' }, { status: 500 })
  }
}

// ─── PATCH /api/ordenes/:id ───────────────────────────────────────────────────
// Solo ADMIN o VENDEDOR pueden actualizar el estado

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('session-token')?.value
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const payload = await verifyJWT(token)
    if (!['ADMIN', 'VENDEDOR'].includes(payload.rol)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = PatchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalle: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const ok = await actualizarEstadoOrden(id, parsed.data.estado, {
      mpPagoId: parsed.data.mpPagoId,
    })

    if (!ok) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/ordenes/[id]] PATCH error:', err)
    return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 })
  }
}
