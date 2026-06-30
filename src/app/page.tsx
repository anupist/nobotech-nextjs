'use client'

import { useEffect } from 'react'
import { useNavStore, type StorePage } from '@/stores/nav-store'
import RootProvider from '@/lib/root-provider'
import { StoreApp } from '@/components/store/store-app'

export default function Home() {
  const navigateStore = useNavStore((s) => s.navigateStore)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const page = params.get('page') as StorePage | null
    if (page) {
      const pageParams: Record<string, string> = {}
      for (const key of ['id', 'slug', 'query']) {
        const val = params.get(key)
        if (val) pageParams[key] = val
      }
      navigateStore(page, pageParams)
      window.history.replaceState({}, '', '/')
    }
  }, [navigateStore])

  return (
    <RootProvider>
      <div className="bg-background text-foreground">
        <StoreApp />
      </div>
    </RootProvider>
  )
}
