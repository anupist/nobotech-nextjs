'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PROMO_DISMISSED_KEY = 'shophub-promo-dismissed'
const PROMO_END_KEY = 'shophub-promo-end'

function getPromoEndTime(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(PROMO_END_KEY)
  if (stored) {
    const end = parseInt(stored, 10)
    if (end > Date.now()) return end
  }
  // Set new end time: 2 days 14 hours 23 minutes from now
  const newEnd = Date.now() + (2 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000) + (23 * 60 * 1000)
  localStorage.setItem(PROMO_END_KEY, String(newEnd))
  return newEnd
}

export function PromoBar() {
  const [visible, setVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Use a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem(PROMO_DISMISSED_KEY)
      if (!dismissed) {
        setVisible(true)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return
    const endTime = getPromoEndTime()

    const updateTimer = () => {
      const now = Date.now()
      const diff = endTime - now
      if (diff <= 0) {
        setVisible(false)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [visible])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    localStorage.setItem(PROMO_DISMISSED_KEY, 'true')
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 text-white">
            {/* Animated shimmer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-center gap-3 relative z-10">
                <Flame className="h-4 w-4 text-yellow-300 shrink-0 animate-pulse" />
                <p className="text-sm font-medium text-center">
                  🔥 Flash Sale! Up to <span className="font-bold text-yellow-200">50% OFF</span> — Ends in{' '}
                  {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
                  <span>{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
                </p>
                <Flame className="h-4 w-4 text-yellow-300 shrink-0 animate-pulse" />
                <button
                  onClick={handleDismiss}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Dismiss promotion"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
