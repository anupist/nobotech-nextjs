'use client'

import { useEffect } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { urlToPage } from '@/lib/route-map'
import RootProvider from '@/lib/root-provider'
import { StoreApp } from '@/components/store/store-app'

export default function CatchAllPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)

  useEffect(() => {
    // Navigate to the page matching the current URL on initial load
    const syncUrlToStore = () => {
      const path = window.location.pathname
      const searchParams = new URLSearchParams(window.location.search)
      const { page, params } = urlToPage(path, searchParams)
      const state = useNavStore.getState()

      if (page !== state.storePage || JSON.stringify(params) !== JSON.stringify(state.pageParams)) {
        navigateStore(page, params)
      }
    }

    syncUrlToStore()

    // Handle browser back/forward — just sync store state, URL is already updated by browser
    const handlePopState = () => {
      const path = window.location.pathname
      const searchParams = new URLSearchParams(window.location.search)
      const { page, params } = urlToPage(path, searchParams)
      const state = useNavStore.getState()

      if (page !== state.storePage || JSON.stringify(params) !== JSON.stringify(state.pageParams)) {
        useNavStore.setState({ storePage: page, pageParams: params, viewMode: 'store' })
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [navigateStore])

  return (
    <RootProvider>
      <div className="bg-background text-foreground">
        <StoreApp />
      </div>
    </RootProvider>
  )
}
