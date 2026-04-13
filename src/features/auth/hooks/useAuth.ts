'use client'

import { useRouter } from 'next/navigation'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { auth } from '@/shared/lib/firebase'
import { useUsuarioStore } from '../store/usuario.store'

export function useAuth() {
  const router = useRouter()
  const { setUsuario, clearUsuario } = useUsuarioStore()

  async function verificarYGuardar(token: string) {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) throw new Error('Error al verificar sesión')
    const data = await res.json()
    setUsuario(data)
    return data as { uid: string; email: string; rol: string; nombre: string | null }
  }

  async function loginEmail(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    const token = await user.getIdToken()
    const data = await verificarYGuardar(token)
    redirigirPorRol(data.rol)
  }

  async function loginGoogle() {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    const token = await user.getIdToken()
    const data = await verificarYGuardar(token)
    redirigirPorRol(data.rol)
  }

  async function register(nombre: string, email: string, password: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    const token = await user.getIdToken()
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nombre }),
    })
    if (!res.ok) throw new Error('Error al registrar usuario')
    const data = await res.json()
    setUsuario(data)
    redirigirPorRol(data.rol)
  }

  async function logout() {
    await signOut(auth)
    await fetch('/api/auth/logout', { method: 'POST' })
    clearUsuario()
    router.push('/login')
  }

  function redirigirPorRol(rol: string) {
    if (rol === 'ADMIN') router.push('/dashboard/admin')
    else if (rol === 'VENDEDOR') router.push('/dashboard/vendedor')
    else router.push('/dashboard/cliente')
  }

  return { loginEmail, loginGoogle, register, logout }
}
