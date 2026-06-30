'use client'

import { useState, useCallback } from 'react'
import { useNavStore, type AdminPage } from '@/stores/nav-store'
import { useAuthStore } from '@/stores/auth-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  Store,
  LogOut,
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Ticket,
  Zap,
  Image,
  FileText,
  File,
  Mail,
  Users,
  Star,
  Warehouse,
  ClipboardList,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCheck,
  UserPlus,
  BarChart3,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { motion, AnimatePresence } from 'framer-motion'

const pageLabels: Record<AdminPage, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  products: 'Products',
  'add-product': 'Add Product',
  'edit-product': 'Edit Product',
  categories: 'Categories',
  brands: 'Brands',
  orders: 'Orders',
  'order-detail': 'Order Detail',
  customers: 'Customers',
  'customer-detail': 'Customer Detail',
  reviews: 'Reviews',
  coupons: 'Coupons',
  'flash-sales': 'Flash Sales',
  banners: 'Banners',
  blog: 'Blog',
  pages: 'Pages',
  newsletter: 'Newsletter',
  settings: 'Settings',
  inventory: 'Inventory',
  'audit-logs': 'Audit Logs',
}

const pageIcons: Record<AdminPage, React.ElementType> = {
  dashboard: LayoutDashboard,
  analytics: BarChart3,
  products: Package,
  'add-product': Package,
  'edit-product': Package,
  categories: FolderTree,
  brands: Tag,
  orders: ShoppingCart,
  'order-detail': ShoppingCart,
  customers: Users,
  'customer-detail': Users,
  reviews: Star,
  coupons: Ticket,
  'flash-sales': Zap,
  banners: Image,
  blog: FileText,
  pages: File,
  newsletter: Mail,
  settings: Settings,
  inventory: Warehouse,
  'audit-logs': ClipboardList,
}

const pageGroups: Record<string, string> = {
  dashboard: 'Main',
  analytics: 'Main',
  products: 'Catalog',
  'add-product': 'Catalog',
  'edit-product': 'Catalog',
  categories: 'Catalog',
  brands: 'Catalog',
  orders: 'Sales',
  'order-detail': 'Sales',
  coupons: 'Sales',
  'flash-sales': 'Sales',
  banners: 'Content',
  blog: 'Content',
  pages: 'Content',
  newsletter: 'Content',
  customers: 'Customers',
  'customer-detail': 'Customers',
  reviews: 'Customers',
  settings: 'System',
  inventory: 'System',
  'audit-logs': 'System',
}

const sampleNotifications = [
  {
    id: '1',
    title: 'New order #1234 received',
    description: 'A new order has been placed and needs processing.',
    time: '5 min ago',
    type: 'order' as const,
    read: false,
  },
  {
    id: '2',
    title: 'Low stock alert: Samsung Galaxy Watch 6',
    description: 'Only 3 units remaining. Consider restocking soon.',
    time: '15 min ago',
    type: 'warning' as const,
    read: false,
  },
  {
    id: '3',
    title: 'New review on Apple AirPods Pro 2',
    description: 'A customer left a 5-star review with photos.',
    time: '1 hour ago',
    type: 'info' as const,
    read: false,
  },
  {
    id: '4',
    title: 'Coupon WELCOME10 expiring soon',
    description: 'This coupon expires in 2 days. Review and extend if needed.',
    time: '2 hours ago',
    type: 'warning' as const,
    read: false,
  },
  {
    id: '5',
    title: '5 new customer registrations today',
    description: 'New signups are up 25% compared to last week.',
    time: '3 hours ago',
    type: 'success' as const,
    read: true,
  },
]

const notificationIcons = {
  order: ShoppingCart,
  warning: AlertTriangle,
  info: MessageSquare,
  success: UserPlus,
}

const notificationColors = {
  order: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
  warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400',
  info: 'text-sky-600 bg-sky-50 dark:bg-sky-950 dark:text-sky-400',
  success: 'text-teal-600 bg-teal-50 dark:bg-teal-950 dark:text-teal-400',
}

interface AdminHeaderProps {
  onMobileMenuToggle: () => void
}

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const { adminPage, navigateAdmin } = useNavStore()
  const { user, logout } = useAuthStore()
  const [notifications, setNotifications] = useState(sampleNotifications)

  const handleLogout = useCallback(() => {
    logout()
    window.location.href = '/'
  }, [logout])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const currentLabel = pageLabels[adminPage] || 'Dashboard'
  const CurrentIcon = pageIcons[adminPage] || LayoutDashboard
  const currentGroup = pageGroups[adminPage] || 'Main'

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'AD'

  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Manager'
  const roleBadgeColor = user?.role === 'super_admin'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="shrink-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      {/* Left: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav className="flex items-center gap-1.5 text-sm min-w-0 overflow-hidden">
          <button
            onClick={() => navigateAdmin('dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Admin
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="text-muted-foreground/70 text-xs font-medium uppercase tracking-wider">
            {currentGroup}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <CurrentIcon className="h-3.5 w-3.5 text-emerald-600" />
            {currentLabel}
          </span>
        </nav>
      </div>

      {/* Right: Search, Notifications, Theme, User */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 w-56 h-9 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-emerald-500"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-0">
                      {unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <DropdownMenuLabel className="p-0 text-sm font-semibold flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <Badge className="h-5 px-1.5 text-[10px] bg-emerald-500 text-white border-0 hover:bg-emerald-600">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-emerald-600 hover:text-emerald-700"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification, index) => {
                const NotifIcon = notificationIcons[notification.type]
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={`p-1.5 rounded-full shrink-0 ${notificationColors[notification.type]}`}>
                      <NotifIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <p className="text-[11px] text-muted-foreground/70">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="border-t p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs text-emerald-600 hover:text-emerald-700">
                View All Notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
              <Avatar className="h-8 w-8 ring-2 ring-emerald-600/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xs bg-emerald-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-tight">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {user?.email || 'admin@shop.com'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 px-2 py-1.5">
              <Avatar className="h-10 w-10 ring-2 ring-emerald-600/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-sm bg-emerald-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${roleBadgeColor}`}>
                    <Shield className="h-2.5 w-2.5 mr-0.5" />
                    {roleLabel}
                  </Badge>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigateAdmin('dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigateAdmin('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/'}>
              <Store className="mr-2 h-4 w-4" />
              Back to Store
              <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
