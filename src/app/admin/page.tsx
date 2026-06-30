'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { AdminApp } from '@/components/admin/admin-app'

const ADMIN_ROLES = ['super_admin', 'admin', 'product_manager', 'order_manager', 'customer_support']

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()
  const isAdmin = user && ADMIN_ROLES.includes(user.role)

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      window.location.href = '/'
    }
  }, [isAuthenticated, isAdmin])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return <AdminApp />
}
