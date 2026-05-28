import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

export const useAuthStore = create(persist(
  (set, get) => ({
    user: null,
    token: null,
    empresa: null,
    primeiroAcesso: false,

    login: async (email, password, empresa) => {
      const { data } = await authAPI.login({ email, password, empresa })
      localStorage.setItem('rh_token', data.access_token)
      set({ user: data.user, token: data.access_token,
            primeiroAcesso: data.primeiro_acesso, empresa: empresa })
      return data
    },

    logout: () => {
      localStorage.removeItem('rh_token')
      set({ user: null, token: null, empresa: null })
    },

    setEmpresa: (empresa) => set({ empresa }),
    setUser: (user) => set({ user }),
  }),
  { name: 'rh-auth' }
))
