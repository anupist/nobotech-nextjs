'use client'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from './providers'

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
