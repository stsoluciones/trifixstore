import { SignJWT, jwtVerify } from 'jose'

export interface JWTPayload {
  uid: string
  email: string
  rol: string
  nombre: string | null
  exp?: number // claim estándar, lo agrega jose automáticamente
}

const SESSION_DURATION = 60 * 60 * 24 // 1 día en segundos

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no está definido en las variables de entorno')
  return new TextEncoder().encode(secret)
}

export async function signJWT(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret())
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as JWTPayload
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_DURATION,
  path: '/',
}

// Umbral de renovación: si quedan menos de 8 horas, se renueva
export const RENEWAL_THRESHOLD_SECONDS = 8 * 60 * 60
