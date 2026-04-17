import { NextRequest, NextResponse } from 'next/server'
import admin from '@/shared/lib/firebase-admin'
import { getDb } from '@/shared/lib/mongodb'
import { signJWT, COOKIE_OPTIONS } from '@/shared/lib/jwt'

export async function POST(req: NextRequest) {
  console.log('[register] POST /api/auth/register')
  const body = await req.json()
  const { token, nombre } = body

  if (!token) {
    console.error('[register] No token provided')
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
  }

  try {
    console.log('[register] Verifying Firebase token...')
    const decoded = await admin.auth().verifyIdToken(token)
    console.log('[register] Token OK — uid:', decoded.uid, 'email:', decoded.email)

    const adminEmail = process.env.ADMIN_EMAIL
    const esAdmin = adminEmail && decoded.email === adminEmail
    console.log('[register] esAdmin:', esAdmin)

    console.log('[register] Connecting to MongoDB...')
    const db = await getDb()
    const usuarios = db.collection('usuarios')

    const result = await usuarios.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $set: {
          email: decoded.email ?? '',
          nombre,
          ...(esAdmin ? { rol: 'ADMIN' } : {}),
        },
        $setOnInsert: {
          firebaseUid: decoded.uid,
          rol: esAdmin ? 'ADMIN' : 'CLIENTE',
          creadoEn: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    )

    const usuario = result ?? { rol: esAdmin ? 'ADMIN' : 'CLIENTE', nombre }
    console.log('[register] Usuario guardado:', JSON.stringify({ rol: (usuario as { rol: string }).rol }))

    const payload = {
      uid: decoded.uid,
      email: decoded.email ?? '',
      rol: (usuario as { rol: string }).rol,
      nombre: (usuario as { nombre?: string | null }).nombre ?? null,
    }

    const jwt = await signJWT(payload)
    const response = NextResponse.json(payload)
    response.cookies.set('session-token', jwt, COOKIE_OPTIONS)
    console.log('[register] OK — rol:', payload.rol)

    return response
  } catch (err) {
    console.error('[register] ERROR:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 400 })
  }
}
