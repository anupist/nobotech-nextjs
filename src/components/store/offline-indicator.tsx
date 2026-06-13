'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine)
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true)
      setShowBackOnline(false)
    }

    const handleOnline = () => {
      setIsOffline(false)
      setShowBackOnline(true)
      // Auto-hide the "back online" message after 3 seconds
      setTimeout(() => setShowBackOnline(false), 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return (
    <AnimatePresence>
      {(isOffline || showBackOnline) && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[60]"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
              isOffline
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="h-4 w-4 shrink-0" />
                <span>You&apos;re offline. Some features may be limited.</span>
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 opacity-70" />
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 shrink-0" />
                <span>You&apos;re back online!</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
