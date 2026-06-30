'use client'

import { useNavStore } from '@/stores/nav-store'
import { StoreApp } from '@/components/store/store-app'
import { AdminApp } from '@/components/admin/admin-app'
import RootProvider from '@/lib/root-provider'

export default function Home() {
  const viewMode = useNavStore((s) => s.viewMode)

  return (
    <RootProvider>
      <div className="bg-background text-foreground">
        {viewMode === 'store' ? <StoreApp /> : <AdminApp />}
      </div>
    </RootProvider>
  )
}
