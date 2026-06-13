'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  Truck,
  Zap,
  Tag,
  Gift,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface Notification {
  id: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  description: string
  timestamp: string
  read: boolean
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: Truck,
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600',
    title: 'Your order #ORD-010001 has been shipped!',
    description: 'Your package is on its way. Estimated delivery in 3-5 business days.',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: '2',
    icon: Zap,
    iconBg: 'bg-amber-100 dark:bg-amber-950/40',
    iconColor: 'text-amber-600',
    title: 'Flash sale starts in 2 hours!',
    description: 'Get up to 50% off on electronics. Don\'t miss out!',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    icon: Tag,
    iconBg: 'bg-sky-100 dark:bg-sky-950/40',
    iconColor: 'text-sky-600',
    title: 'Price drop on Samsung Galaxy Watch 6',
    description: 'The price dropped by 15%. Check it out before it goes back up!',
    timestamp: '3 hours ago',
    read: false,
  },
  {
    id: '4',
    icon: Gift,
    iconBg: 'bg-purple-100 dark:bg-purple-950/40',
    iconColor: 'text-purple-600',
    title: 'Welcome to ShopHub! Get 10% off with WELCOME10',
    description: 'Use code WELCOME10 at checkout for 10% off your first order.',
    timestamp: '1 day ago',
    read: true,
  },
]

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-bold bg-emerald-600 text-white rounded-full"
          >
            {unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-emerald-600 hover:text-emerald-700"
                  onClick={markAllAsRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Notification List */}
            <ScrollArea className="max-h-96">
              <div className="divide-y">
                {notifications.map((notification) => {
                  const Icon = notification.icon
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        !notification.read ? 'bg-emerald-50/50 dark:bg-emerald-950/10' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`h-9 w-9 rounded-full ${notification.iconBg} flex items-center justify-center shrink-0`}>
                          <Icon className={`h-4 w-4 ${notification.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} line-clamp-2`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t bg-muted/20">
              <button className="w-full text-center text-xs text-emerald-600 hover:text-emerald-700 font-medium py-1">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
