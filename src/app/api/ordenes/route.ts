import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyJWT } from '@/shared/lib/jwt'
import {
  crearOrden,
  listarOrdenesPorUsuario,
  listarTodasLasOrdenes,
} from '@/features/ordenes/services/orden.service'

// ─── Schema de validación ─────────────────────────────────────────────────────

const ItemOrdenSchema = z.object({
  productoId: z.string().min(1),
  nombre: z.string().min(1),
  imagen: z.string().optional(),
  cantidad: z.number().int().positive(),
  precioUnitario: z.number().positive(),
})

const DireccionSchema = z.object({
  calle: z.string().min(1),
  ciudad: z.string().min(1),
  provincia: z.string().min(1),
  codigoPostal: z.string().min(1),
  pais: z.string().default('Argentina'),
})

const CrearOrdenSchema = z.object({
  items: z.array(ItemOrdenSchema).min(1),
  total: z.number().positive(),
  direccionEnvio: DireccionSchema,
})

// ─── GET /api/ordenes ─────────────────────────────────────────────────────────
// CLIENTE → sus propias órdenes
// ADMIN / VENDEDOR → todas las órdenes (con filtros opcionales)

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('session-token')?.value
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const payload = await verifyJWT(token)
    const { searchParams } = req.nextUrl

    if (payload.rol === 'CLIENTE') {
      const ordenes = await listarOrdenesPorUsuario(payload.uid)
      return NextResponse.json({ items: ordenes, total: ordenes.length })
    }

    // ADMIN o VENDEDOR
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
    const estado = searchParams.get('estado') ?? undefined

    const resultado = await listarTodasLasOrdenes({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      estado: estado as any,
      page,
      limit,
    })

    return NextResponse.json(resultado)
  } catch (err) {
    console.error('[api/ordenes] GET error:', err)
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 })
  }
}

// ─── POST /api/ordenes ────────────────────────────────────────────────────────
// Crea una nueva orden (antes del pago)

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('session-token')?.value
    if (!token) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const payload = await verifyJWT(token)
    const body = await req.json()

    const parsed = CrearOrdenSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalle: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const orden = await crearOrden({
      usuarioId: payload.uid,
      usuarioEmail: payload.email,
      ...parsed.data,
    })

    return NextResponse.json(orden, { status: 201 })
  } catch (err) {
    console.error('[api/ordenes] POST error:', err)
    return NextResponse.json({ error: 'Error al crear orden' }, { status: 500 })
  }
}
