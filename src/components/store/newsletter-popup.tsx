'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Gift, Sparkles, CheckCircle2, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeNewsletter } from '@/lib/api'
import { toast } from 'sonner'

const STORAGE_KEY = 'shophub-newsletter-popup-dismissed'
const SHOW_DELAY = 30000 // 30 seconds
const REMEMBER_DAYS = 7

function isRecentlyDismissed(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false
    const dismissedAt = new Date(stored)
    const now = new Date()
    const diffDays = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays < REMEMBER_DAYS
  } catch {
    return false
  }
}

function rememberDismissal(): void {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
  } catch { /* ignore */ }
}

// Confetti effect for success state
function MiniConfetti() {
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const angle = (i * 18) * (Math.PI / 180)
    const distance = 40 + Math.random() * 50
    const colors = ['bg-emerald-400', 'bg-teal-400', 'bg-amber-400', 'bg-rose-400', 'bg-sky-400']
    return (
      <motion.div
        key={i}
        className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full ${colors[i % colors.length]}`}
        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
        animate={{
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 20,
          scale: [0, 1.2, 0],
          opacity: [1, 1, 0],
        }}
        transition={{ duration: 0.7, delay: i * 0.03, ease: 'easeOut' }}
      />
    )
  })
  return <div className="absolute inset-0 pointer-events-none">{particles}</div>
}

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isRecentlyDismissed()) return

    const timer = setTimeout(() => {
      setVisible(true)
    }, SHOW_DELAY)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    rememberDismissal()
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    try {
      await subscribeNewsletter(email)
      setSuccess(true)
      toast.success('Welcome! Check your email for the discount code.')
      // Auto-dismiss after showing success
      setTimeout(() => {
        setVisible(false)
        rememberDismissal()
      }, 4000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to subscribe'
      if (msg.includes('already')) {
        toast.info('You\'re already subscribed!')
        setVisible(false)
        rememberDismissal()
      } else {
        toast.error(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }, [email])

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto pointer-events-auto">
              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-card border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
                aria-label="Close popup"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="rounded-2xl overflow-hidden shadow-2xl border border-emerald-200/50 dark:border-emerald-800/30">
                {/* Gradient header */}
                <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-6 text-white text-center relative overflow-hidden">
                  {/* Background decorations */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4"
                    >
                      <Gift className="h-8 w-8 text-white" />
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold mb-2"
                    >
                      Get 10% OFF
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-emerald-100 text-sm"
                    >
                      Your first order awaits! Subscribe now for exclusive deals.
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-mono font-bold"
                    >
                      <Sparkles className="h-4 w-4" />
                      WELCOME10
                    </motion.div>
                  </div>
                </div>

                {/* Form section */}
                <div className="bg-card p-6">
                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-4 relative"
                      >
                        <MiniConfetti />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                        </motion.div>
                        <h3 className="text-lg font-bold mb-1">You&apos;re In!</h3>
                        <p className="text-sm text-muted-foreground">
                          Use code <span className="font-mono font-bold text-emerald-600">WELCOME10</span> for 10% off
                        </p>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                      >
                        <div>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={submitting || !email.trim()}
                          className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/20 font-semibold"
                        >
                          {submitting ? (
                            <span className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <PartyPopper className="h-4 w-4" />
                              </motion.div>
                              Subscribing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Get My 10% Off
                            </span>
                          )}
                        </Button>
                        <p className="text-[11px] text-center text-muted-foreground">
                          No spam, unsubscribe anytime. By subscribing you agree to our terms.
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
