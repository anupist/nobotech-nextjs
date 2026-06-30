'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { AdminApp } from '@/components/admin/admin-app'

const ADMIN_ROLES = ['super-admin', 'admin', 'product-manager', 'order-manager', 'customer-support']

function roleToSlug(role: string): string {
  const map: Record<string, string> = {
    'Super Admin': 'super-admin',
    'Admin': 'admin',
    'Product Manager': 'product-manager',
    'Order Manager': 'order-manager',
    'Customer Support': 'customer-support',
    'Customer': 'customer',
  }
  return map[role] || role
}

export default function AdminPage() {
  const [ready, setReady] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready) return
    // Migrate old role name format persisted from before the API slug fix
    const u = useAuthStore.getState().user
    if (u) {
      const normalized = roleToSlug(u.role)
      if (normalized !== u.role) {
        useAuthStore.getState().setUser({ ...u, role: normalized })
      }
    }

    if (!isAuthenticated) {
      window.location.href = '/admin/login'
      return
    }
    const role = roleToSlug(user?.role || '')
    if (!ADMIN_ROLES.includes(role)) {
      window.location.href = '/'
    }
  }, [ready, isAuthenticated, user])

  if (!ready) return null
  const role = roleToSlug(user?.role || '')
  if (!isAuthenticated || !user || !ADMIN_ROLES.includes(role)) return null

  return <AdminApp />
}
