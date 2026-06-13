import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: string
  permissions: string[]
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: AuthUser | null) => void
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => void
  setLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const data = await res.json()
          if (data.success && data.data?.user) {
            const apiUser = data.data.user
            const authUser: AuthUser = {
              id: apiUser.id,
              email: apiUser.email,
              name: apiUser.name,
              phone: apiUser.phone,
              avatar: apiUser.avatar,
              role: apiUser.roles?.[0] || 'customer',
              permissions: apiUser.permissions || [],
            }
            set({ user: authUser, isAuthenticated: true, isLoading: false })
            return true
          }
          set({ isLoading: false })
          return false
        } catch {
          set({ isLoading: false })
          return false
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone }),
          })
          const data = await res.json()
          if (data.success && data.data?.user) {
            const apiUser = data.data.user
            const authUser: AuthUser = {
              id: apiUser.id,
              email: apiUser.email,
              name: apiUser.name,
              phone: apiUser.phone,
              avatar: apiUser.avatar,
              role: apiUser.roles?.[0] || 'customer',
              permissions: apiUser.permissions || [],
            }
            set({ user: authUser, isAuthenticated: true, isLoading: false })
            return true
          }
          set({ isLoading: false })
          return false
        } catch {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      },

      hasPermission: (permission) => {
        const user = get().user
        if (!user) return false
        if (user.role === 'super_admin') return true
        return user.permissions.includes(permission)
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
