import { NextRequest, NextResponse } from 'next/server'
import admin from '@/shared/lib/firebase-admin'
import { getDb } from '@/shared/lib/mongodb'
import { signJWT, COOKIE_OPTIONS } from '@/shared/lib/jwt'

export async function POST(req: NextRequest) {
  const { token, nombre } = await req.json()

  try {
    const decoded = await admin.auth().verifyIdToken(token)

    const adminEmail = process.env.ADMIN_EMAIL
    const esAdmin = adminEmail && decoded.email === adminEmail

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

    const payload = {
      uid: decoded.uid,
      email: decoded.email ?? '',
      rol: (usuario as { rol: string }).rol,
      nombre: (usuario as { nombre?: string | null }).nombre ?? null,
    }

    const jwt = await signJWT(payload)
    const response = NextResponse.json(payload)
    response.cookies.set('session-token', jwt, COOKIE_OPTIONS)

    return response
  } catch {
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 400 })
  }
}
