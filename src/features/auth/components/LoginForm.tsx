'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function LoginForm() {
  const { loginEmail, loginGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      await loginEmail(data.email, data.password)
    } catch (e: unknown) {
      setError(mensajeError(e))
    }
  }

  async function handleGoogle() {
    setError(null)
    setLoadingGoogle(true)
    try {
      await loginGoogle()
    } catch (e: unknown) {
      setError(mensajeError(e))
    } finally {
      setLoadingGoogle(false)
    }
  }

  return (
    <div className="bg-white rounded-sm shadow-md w-full max-w-md p-8">
      <h1 className="text-2xl font-bold text-[#333] mb-1">Iniciar sesión</h1>
      <p className="text-sm text-[#666] mb-6">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="text-[#2968C8] hover:underline font-medium">
          Registrate gratis
        </Link>
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className="w-full border border-[#EBEBEB] rounded-sm px-3 py-2 text-sm text-[#333] outline-none focus:border-[#E8640B] transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">
            Contraseña
          </label>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full border border-[#EBEBEB] rounded-sm px-3 py-2 text-sm text-[#333] outline-none focus:border-[#E8640B] transition-colors"
          />
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#E8640B] hover:bg-[#b34700] disabled:bg-[#E8640B]/50 text-white font-semibold py-2.5 rounded-sm transition-colors text-sm"
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#EBEBEB]" />
        <span className="text-xs text-[#666]">o continuá con</span>
        <div className="flex-1 h-px bg-[#EBEBEB]" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={loadingGoogle}
        className="w-full flex items-center justify-center gap-3 border border-[#EBEBEB] hover:border-[#ccc] bg-white rounded-sm py-2.5 text-sm font-medium text-[#333] transition-colors disabled:opacity-50"
      >
        <GoogleIcon />
        {loadingGoogle ? 'Conectando...' : 'Continuar con Google'}
      </button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function mensajeError(e: unknown): string {
  if (e instanceof Error) {
    const code = (e as { code?: string }).code
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Email o contraseña incorrectos'
    }
    if (code === 'auth/too-many-requests') {
      return 'Demasiados intentos. Intentá más tarde'
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Se canceló el inicio de sesión con Google'
    }
    return e.message
  }
  return 'Ocurrió un error. Intentá de nuevo'
}
