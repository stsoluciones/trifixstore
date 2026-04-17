import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, signJWT, COOKIE_OPTIONS, RENEWAL_THRESHOLD_SECONDS } from '@/shared/lib/jwt'

const RUTAS_PROTEGIDAS: Record<string, string[]> = {
  '/dashboard/admin':    ['ADMIN'],
  '/dashboard/vendedor': ['ADMIN', 'VENDEDOR'],
  '/dashboard/cliente':  ['ADMIN', 'VENDEDOR', 'CLIENTE'],
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  console.log('[proxy] Request:', pathname)

  const rutaRequerida = Object.keys(RUTAS_PROTEGIDAS).find(r => pathname.startsWith(r))
  if (!rutaRequerida) return NextResponse.next()

  const token = req.cookies.get('session-token')?.value
  if (!token) {
    console.log('[proxy] No session-token → redirect /login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const payload = await verifyJWT(token)
    console.log('[proxy] JWT OK — uid:', payload.uid, 'rol:', payload.rol, 'ruta:', rutaRequerida)

    const rolesPermitidos = RUTAS_PROTEGIDAS[rutaRequerida]
    if (!rolesPermitidos.includes(payload.rol)) {
      console.log('[proxy] Rol', payload.rol, 'no permitido en', rutaRequerida, '→ redirect /dashboard/cliente')
      return NextResponse.redirect(new URL('/dashboard/cliente', req.url))
    }

    // Protección extra para admin: verificar que el email sea el del dueño
    if (rutaRequerida === '/dashboard/admin') {
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail && payload.email !== adminEmail) {
        console.log('[proxy] Email', payload.email, 'no es ADMIN_EMAIL → redirect /dashboard/cliente')
        return NextResponse.redirect(new URL('/dashboard/cliente', req.url))
      }
    }

    const response = NextResponse.next()

    // Sliding session: renovar si quedan menos de 8 horas
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = (payload.exp ?? 0) - now
    if (timeLeft < RENEWAL_THRESHOLD_SECONDS) {
      console.log('[proxy] Renovando token — timeLeft:', timeLeft, 's')
      const newToken = await signJWT({
        uid: payload.uid,
        email: payload.email,
        rol: payload.rol,
        nombre: payload.nombre,
      })
      response.cookies.set('session-token', newToken, COOKIE_OPTIONS)
    }

    return response
  } catch (err) {
    console.error('[proxy] JWT inválido:', err instanceof Error ? err.message : String(err))
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.delete('session-token')
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
