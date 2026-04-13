import { NextRequest, NextResponse } from 'next/server'
import admin from '@/shared/lib/firebase-admin'
import { prisma } from '@/shared/lib/prisma'
import { signJWT, COOKIE_OPTIONS } from '@/shared/lib/jwt'

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  try {
    const decoded = await admin.auth().verifyIdToken(token)

    // El rol ADMIN se asigna exclusivamente al email del dueño definido en ADMIN_EMAIL.
    // Nadie más puede obtener ese rol mediante registro normal.
    const adminEmail = process.env.ADMIN_EMAIL
    const esAdmin = adminEmail && decoded.email === adminEmail

    const usuario = await prisma.usuario.upsert({
      where: { firebaseUid: decoded.uid },
      // Si es el email admin, siempre garantizar ADMIN (por si la DB fue reseteada)
      update: esAdmin ? { rol: 'ADMIN' } : {},
      create: {
        firebaseUid: decoded.uid,
        email: decoded.email ?? '',
        nombre: decoded.name ?? null,
        rol: esAdmin ? 'ADMIN' : 'CLIENTE',
      },
      select: { rol: true, nombre: true },
    })

    const payload = {
      uid: decoded.uid,
      email: decoded.email ?? '',
      rol: usuario.rol,
      nombre: usuario.nombre,
    }

    const jwt = await signJWT(payload)
    const response = NextResponse.json(payload)
    response.cookies.set('session-token', jwt, COOKIE_OPTIONS)

    return response
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
}
