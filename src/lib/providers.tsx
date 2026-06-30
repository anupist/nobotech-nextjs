'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

const THEME_STORAGE_KEY = 'theme'

interface ThemeContextValue {
  theme: string
  setTheme: (t: string) => void
  resolvedTheme: string
}

const ThemeCtx = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
})

export const useTheme = () => useContext(ThemeCtx)

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    const initial = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setThemeState(initial)
    document.documentElement.className = initial
    setMounted(true)
  }, [])

  const setTheme = useCallback((t: string) => {
    setThemeState(t)
    localStorage.setItem(THEME_STORAGE_KEY, t)
    document.documentElement.className = t
  }, [])

  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return theme
  }, [theme])

  const ctx = useMemo<ThemeContextValue>(
    () => ({ theme: mounted ? theme : 'light', setTheme, resolvedTheme }),
    [mounted, theme, setTheme, resolvedTheme],
  )

  return (
    <ThemeCtx.Provider value={ctx}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
