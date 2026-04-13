import { create } from 'zustand'

interface UsuarioState {
  uid: string | null
  email: string | null
  rol: string | null
  nombre: string | null
  cargando: boolean
  setUsuario: (data: { uid: string; email: string; rol: string; nombre?: string | null }) => void
  clearUsuario: () => void
  setCargando: (v: boolean) => void
}

export const useUsuarioStore = create<UsuarioState>((set) => ({
  uid: null,
  email: null,
  rol: null,
  nombre: null,
  cargando: true,
  setUsuario: (data) => set({ ...data, cargando: false }),
  clearUsuario: () => set({ uid: null, email: null, rol: null, nombre: null, cargando: false }),
  setCargando: (v) => set({ cargando: v }),
}))
