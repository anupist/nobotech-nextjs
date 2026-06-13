'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Cookie, Shield, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavStore } from '@/stores/nav-store'

const CONSENT_KEY = 'shophub-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const navigateStore = useNavStore((s) => s.navigateStore)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, all: true, date: new Date().toISOString() }))
    setVisible(false)
  }

  const handleAcceptEssential = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, all: false, date: new Date().toISOString() }))
    setVisible(false)
  }

  const handleDismiss = () => {
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[60] p-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="container mx-auto max-w-4xl">
            <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl shadow-black/30 overflow-hidden">
              {/* Decorative emerald glow */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-x-8 -translate-y-8 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl translate-x-8 translate-y-8 pointer-events-none" />

              <div className="relative p-5 sm:p-6">
                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div className="flex gap-4 items-start">
                  {/* Cookie icon */}
                  <div className="hidden sm:flex h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <Cookie className="h-5 w-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-bold">We value your privacy</h3>
                      <Cookie className="h-4 w-4 text-emerald-400 sm:hidden" />
                    </div>
                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                      We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                      By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                      <button
                        onClick={() => { navigateStore('page'); setVisible(false) }}
                        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 inline-flex items-center gap-0.5"
                      >
                        Privacy Policy
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </p>

                    {/* Customization panel */}
                    <AnimatePresence>
                      {showCustomize && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mb-4"
                        >
                          <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-medium">Essential Cookies</span>
                              </div>
                              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Always Active</span>
                            </div>
                            <p className="text-xs text-gray-400 ml-6">Required for the website to function properly.</p>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              <div className="flex items-center gap-2">
                                <Cookie className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">Analytics Cookies</span>
                              </div>
                              <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">Optional</span>
                            </div>
                            <p className="text-xs text-gray-400 ml-6">Help us understand how visitors interact with our website.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={handleAcceptAll}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 h-9 text-sm"
                      >
                        Accept All
                      </Button>
                      <Button
                        onClick={handleAcceptEssential}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white h-9 text-sm"
                      >
                        Essential Only
                      </Button>
                      <Button
                        onClick={() => setShowCustomize(!showCustomize)}
                        variant="ghost"
                        className="text-gray-400 hover:text-white hover:bg-white/10 h-9 text-sm"
                      >
                        {showCustomize ? 'Hide Options' : 'Customize'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
