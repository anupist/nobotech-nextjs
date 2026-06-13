'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag } from 'lucide-react'

interface SocialProofMessage {
  id: string
  name: string
  location: string
  product: string
  action: string
  timeAgo: string
  avatar: string
}

const DEMO_MESSAGES: SocialProofMessage[] = [
  { id: '1', name: 'Sarah', location: 'Dhaka', product: 'iPhone 15 Pro Max', action: 'just bought', timeAgo: '2 minutes ago', avatar: 'S' },
  { id: '2', name: 'Ahmed', location: 'New York', product: 'MacBook Air M3', action: 'just bought', timeAgo: '5 minutes ago', avatar: 'A' },
  { id: '3', name: 'Emily', location: 'London', product: 'Samsung Galaxy S24', action: 'just bought', timeAgo: '8 minutes ago', avatar: 'E' },
  { id: '4', name: '12 people', location: '', product: 'Wireless Headphones', action: 'are viewing', timeAgo: 'right now', avatar: '12' },
  { id: '5', name: 'Carlos', location: 'São Paulo', product: 'Smart Watch Pro', action: 'just bought', timeAgo: '12 minutes ago', avatar: 'C' },
  { id: '6', name: 'Mina', location: 'Tokyo', product: 'Running Shoes', action: 'just bought', timeAgo: '15 minutes ago', avatar: 'M' },
  { id: '7', name: '8 people', location: '', product: 'Bluetooth Speaker', action: 'are viewing', timeAgo: 'right now', avatar: '8' },
  { id: '8', name: 'David', location: 'Sydney', product: 'Yoga Mat Premium', action: 'just bought', timeAgo: '20 minutes ago', avatar: 'D' },
  { id: '9', name: 'Fatima', location: 'Dubai', product: 'Laptop Stand', action: 'just bought', timeAgo: '25 minutes ago', avatar: 'F' },
  { id: '10', name: '5 people', location: '', product: 'USB-C Hub', action: 'are viewing', timeAgo: 'right now', avatar: '5' },
]

const STORAGE_KEY = 'shophub-social-proof-dismissed'

function isDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const avatarColors = [
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-cyan-500',
  'from-rose-400 to-pink-500',
  'from-teal-400 to-emerald-500',
]

export function SocialProof() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true
    return isDismissed()
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const hasInitialized = useRef(false)

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (dismissed || hasInitialized.current) return
    hasInitialized.current = true

    // Show first notification after 10 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true)
    }, 10000)

    return () => clearTimeout(initialTimer)
  }, [dismissed])

  // Cycle through messages
  useEffect(() => {
    if (dismissed || !visible) return

    const cycleInterval = setInterval(() => {
      setVisible(false)
      // Wait for exit animation, then show next
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % DEMO_MESSAGES.length)
        setVisible(true)
      }, 500)
    }, 8000) // Show each for 5 seconds + 3 seconds buffer for animation

    return () => clearInterval(cycleInterval)
  }, [dismissed, visible])

  if (dismissed) return null

  const message = DEMO_MESSAGES[currentIndex]
  const colorIndex = currentIndex % avatarColors.length

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-[320px]">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={message.id}
            initial={{ x: -120, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -120, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-card border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl shadow-xl shadow-emerald-900/10 p-4 pr-10"
          >
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-3 w-3" />
            </button>

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md`}>
                {message.avatar.length > 2 ? (
                  <ShoppingBag className="h-4 w-4" />
                ) : (
                  message.avatar
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">
                  <span className="font-semibold text-foreground">{message.name}</span>
                  {message.location && (
                    <span className="text-muted-foreground"> from {message.location}</span>
                  )}
                  <span className="text-muted-foreground"> {message.action} </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{message.product}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{message.timeAgo}</p>
              </div>
            </div>

            {/* Subtle gradient accent at bottom */}
            <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
