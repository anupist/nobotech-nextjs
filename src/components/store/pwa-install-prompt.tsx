'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSAL_KEY = 'shophub-pwa-dismissed'
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

function getIsInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

function getIsDismissed(): boolean {
  if (typeof window === 'undefined') return false
  const dismissedAt = localStorage.getItem(DISMISSAL_KEY)
  if (!dismissedAt) return false
  const elapsed = Date.now() - parseInt(dismissedAt, 10)
  return elapsed < DISMISSAL_DURATION
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(getIsInstalled)

  useEffect(() => {
    // If already installed or dismissed, don't set up listeners
    if (isInstalled || getIsDismissed()) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Also listen for appinstalled
    const installedHandler = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString())
    setShowPrompt(false)
  }

  if (isInstalled || !deferredPrompt) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-4 shadow-2xl shadow-emerald-600/30 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Install ShopHub</h3>
                  <p className="text-[11px] text-white/80">Quick access from your home screen</p>
                </div>
              </div>

              <p className="text-xs text-white/90 mb-3 leading-relaxed">
                Add ShopHub to your home screen for a faster, app-like shopping experience with offline browsing.
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 h-9 bg-white text-emerald-700 hover:bg-white/90 font-semibold text-xs shadow-lg"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Install App
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="h-9 text-white/80 hover:text-white hover:bg-white/10 text-xs"
                >
                  Not now
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
