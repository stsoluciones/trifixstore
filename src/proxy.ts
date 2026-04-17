import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, signJWT, COOKIE_OPTIONS, RENEWAL_THRESHOLD_SECONDS } from '@/shared/lib/jwt'

const RUTAS_PROTEGIDAS: Record<string, string[]> = {
  '/dashboard/admin':    ['ADMIN'],
  '/dashboard/vendedor': ['ADMIN', 'VENDEDOR'],
  '/dashboard/cliente':  ['ADMIN', 'VENDEDOR', 'CLIENTE'],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const rutaRequerida = Object.keys(RUTAS_PROTEGIDAS).find(r => pathname.startsWith(r))
  if (!rutaRequerida) return NextResponse.next()

  const token = req.cookies.get('session-token')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  try {
    const payload = await verifyJWT(token)
    const rolesPermitidos = RUTAS_PROTEGIDAS[rutaRequerida]

    if (!rolesPermitidos.includes(payload.rol)) {
      return NextResponse.redirect(new URL('/dashboard/cliente', req.url))
    }

    // Protección extra para admin: verificar que el email sea el del dueño
    if (rutaRequerida === '/dashboard/admin') {
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail && payload.email !== adminEmail) {
        return NextResponse.redirect(new URL('/dashboard/cliente', req.url))
      }
    }

    const response = NextResponse.next()

    // Sliding session: renovar si quedan menos de 8 horas
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = (payload.exp ?? 0) - now
    if (timeLeft < RENEWAL_THRESHOLD_SECONDS) {
      const newToken = await signJWT({
        uid: payload.uid,
        email: payload.email,
        rol: payload.rol,
        nombre: payload.nombre,
      })
      response.cookies.set('session-token', newToken, COOKIE_OPTIONS)
    }

    return response
  } catch {
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.delete('session-token')
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
