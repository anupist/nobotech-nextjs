'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { AdminApp } from '@/components/admin/admin-app'

const ADMIN_ROLES = ['super-admin', 'admin', 'product-manager', 'order-manager', 'customer-support']

function normalizeRole(role: string): string {
  const nameToSlug: Record<string, string> = {
    'Super Admin': 'super-admin',
    'Admin': 'admin',
    'Product Manager': 'product-manager',
    'Order Manager': 'order-manager',
    'Customer Support': 'customer-support',
    'Customer': 'customer',
  }
  return nameToSlug[role] || role
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Migrate old role name format to slug
    const currentUser = useAuthStore.getState().user
    if (currentUser) {
      const normalized = normalizeRole(currentUser.role)
      if (normalized !== currentUser.role) {
        useAuthStore.getState().setUser({ ...currentUser, role: normalized })
      }
    }

    const role = currentUser ? normalizeRole(currentUser.role) : ''

    if (!isAuthenticated) {
      window.location.href = '/admin/login'
    } else if (!ADMIN_ROLES.includes(role)) {
      window.location.href = '/'
    }
  }, [mounted])

  if (!mounted) return null

  const role = user ? normalizeRole(user.role) : ''
  if (!isAuthenticated || !ADMIN_ROLES.includes(role)) return null

  return <AdminApp />
}
