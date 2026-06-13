'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useCartStore } from '@/stores/cart-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  HelpCircle,
  Search,
  ShoppingCart,
  Heart,
  Home,
  X,
  Command,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const shortcuts = [
  {
    keys: ['Ctrl/⌘', 'K'],
    description: 'Focus search',
    icon: Search,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    keys: ['Ctrl/⌘', 'B'],
    description: 'Go to cart',
    icon: ShoppingCart,
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40',
  },
  {
    keys: ['Ctrl/⌘', 'W'],
    description: 'Go to wishlist',
    icon: Heart,
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40',
  },
  {
    keys: ['Ctrl/⌘', 'H'],
    description: 'Go to home page',
    icon: Home,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
  },
  {
    keys: ['Esc'],
    description: 'Close modal/drawer/sidebar',
    icon: X,
    color: 'text-muted-foreground bg-muted',
  },
]

export function KeyboardShortcuts() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const navigateStore = useNavStore((s) => s.navigateStore)
  const setOpen = useCartStore((s) => s.setOpen)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Ctrl/Cmd + B: Go to cart
      if (isMod && e.key === 'b') {
        e.preventDefault()
        navigateStore('cart')
        return
      }

      // Ctrl/Cmd + W: Go to wishlist
      if (isMod && e.key === 'w') {
        e.preventDefault()
        navigateStore('wishlist')
        return
      }

      // Ctrl/Cmd + H: Go to home
      if (isMod && e.key === 'h') {
        e.preventDefault()
        navigateStore('home')
        return
      }

      // Ctrl/Cmd + K is handled in store-header.tsx already
      // Escape to close any open modal/drawer/sidebar
      if (e.key === 'Escape') {
        // Close cart sidebar
        setOpen(false)
        // Close the shortcuts dialog if open
        if (dialogOpen) {
          setDialogOpen(false)
        }
      }

      // ? to open shortcuts dialog
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement
        // Only trigger if not typing in an input
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          !target.isContentEditable
        ) {
          setDialogOpen(true)
        }
      }
    },
    [navigateStore, setOpen, dialogOpen]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      {/* Help button in bottom-left corner */}
      <motion.button
        className="fixed bottom-20 left-4 z-40 h-9 w-9 rounded-full bg-background border shadow-md flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-300 transition-all duration-200"
        onClick={() => setDialogOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        <HelpCircle className="h-4 w-4" />
      </motion.button>

      {/* Shortcuts Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5 text-emerald-600" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 mt-2">
            {shortcuts.map((shortcut, index) => {
              const Icon = shortcut.icon
              return (
                <motion.div
                  key={shortcut.description}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${shortcut.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{shortcut.description}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <kbd className="inline-flex h-6 items-center rounded border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground shadow-sm">
                          {key}
                        </kbd>
                        {i < shortcut.keys.length - 1 && (
                          <span className="text-muted-foreground text-xs">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-center">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              Press <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">?</kbd> anytime to open this dialog
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
