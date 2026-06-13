'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useAuthStore } from '@/stores/auth-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  User,
  Package,
  MapPin,
  Star,
  Settings,
  Heart,
  ShoppingBag,
  Clock,
  Edit,
  Plus,
  Eye,
  Gift,
  Calendar,
  Trash2,
  ShieldAlert,
  Check,
  Truck,
  Award,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Home,
  Building2,
  Map,
  Download,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import { motion, AnimatePresence } from 'framer-motion'
import { useRewardStore } from '@/stores/reward-store'
import { formatPrice } from '@/lib/api'

// Order timeline steps
const ORDER_STEPS = [
  { key: 'pending', label: 'Placed', icon: ShoppingBag },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
]

function getStepIndex(status: string): number {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : 0
}

export function AccountPage() {
  const storePage = useNavStore((s) => s.storePage)
  const navigateStore = useNavStore((s) => s.navigateStore)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const activeTab = useMemo(() => {
    if (storePage === 'account-orders') return 'orders'
    if (storePage === 'account-addresses') return 'addresses'
    if (storePage === 'account-reviews') return 'reviews'
    return 'overview'
  }, [storePage])

  const [manualTab, setManualTab] = useState<string | null>(null)
  const currentTab = manualTab || activeTab

  useEffect(() => {
    if (!isAuthenticated) {
      navigateStore('auth')
    }
  }, [isAuthenticated, navigateStore])

  if (!isAuthenticated || !user) {
    return null
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <User className="h-4 w-4" /> },
    { key: 'orders', label: 'Orders', icon: <Package className="h-4 w-4" /> },
    { key: 'addresses', label: 'Addresses', icon: <MapPin className="h-4 w-4" /> },
    { key: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4" /> },
    { key: 'rewards', label: 'Rewards', icon: <Gift className="h-4 w-4" /> },
    { key: 'profile', label: 'Profile', icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <BreadcrumbNav items={[{ label: 'My Account', page: 'account' }, { label: currentTab.charAt(0).toUpperCase() + currentTab.slice(1) }]} />

      {/* Gradient Banner */}
      <div className="account-banner rounded-2xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-32 h-32 bg-white rounded-full blur-2xl" />
          <div className="absolute bottom-4 left-12 w-24 h-24 bg-teal-200 rounded-full blur-xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-2 ring-white/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
              <p className="text-emerald-100/80 text-sm mt-0.5">Manage your account and track your orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setManualTab(tab.key)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === tab.key
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {currentTab === 'overview' && <OverviewTab user={user} navigateStore={navigateStore} />}
              {currentTab === 'orders' && <OrdersTab navigateStore={navigateStore} />}
              {currentTab === 'addresses' && <AddressesTab />}
              {currentTab === 'reviews' && <ReviewsTab />}
              {currentTab === 'rewards' && <RewardsTab />}
              {currentTab === 'profile' && <ProfileTab user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ user, navigateStore }: { user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>; navigateStore: (page: 'products' | 'wishlist' | 'account-orders') => void }) {
  const wishlistItems = useWishlistStore((s) => s.items)
  const rewardPoints = useRewardStore((s) => s.points)

  const stats = [
    { label: 'Total Orders', value: '10', icon: ShoppingBag, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Wishlist Items', value: String(wishlistItems.length), icon: Heart, gradient: 'from-rose-500 to-pink-600' },
    { label: 'Reward Points', value: `${rewardPoints.toLocaleString()} pts`, icon: Gift, gradient: 'from-amber-500 to-orange-600' },
    { label: 'Member Since', value: 'Jan 2025', icon: Calendar, gradient: 'from-sky-500 to-cyan-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-1">Welcome back, {user.name.split(' ')[0]}! 👋</h2>
          <p className="text-sm text-muted-foreground">
            Here&apos;s an overview of your account activity.
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards with Gradient */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group cursor-default">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shrink-0 shadow-md stats-icon-hover`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold truncate">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => navigateStore('products')}>
          <CardContent className="p-4 flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">Continue Shopping</p>
              <p className="text-xs text-muted-foreground">Browse our products</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => navigateStore('wishlist')}>
          <CardContent className="p-4 flex items-center gap-3">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">My Wishlist</p>
              <p className="text-xs text-muted-foreground">View saved items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => navigateStore('account-orders')}>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">Track Orders</p>
              <p className="text-xs text-muted-foreground">Check order status</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => navigateStore('return-request')}>
          <CardContent className="p-4 flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">Returns & Refunds</p>
              <p className="text-xs text-muted-foreground">Request a return or refund</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Orders</h3>
            <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => navigateStore('account-orders')}>
              View All
            </Button>
          </div>
          <OverviewOrders userId={user.id} navigateStore={navigateStore} />
        </CardContent>
      </Card>
    </div>
  )
}

function OverviewOrders({ userId, navigateStore }: { userId: string; navigateStore: (page: string, params?: Record<string, string>) => void }) {
  const [orders, setOrders] = useState<Array<{
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
    items: Array<{ productName: string; quantity: number }>
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders?limit=3')
        const data = await res.json()
        if (data.success) setOrders(data.data || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent orders to display</p>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-sky-100 text-sky-700',
    processing: 'bg-violet-100 text-violet-700',
    shipped: 'bg-teal-100 text-teal-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <button
          key={order.id}
          onClick={() => navigateStore('order-detail', { id: order.id })}
          className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">#{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className="text-sm font-semibold">${order.totalAmount.toFixed(2)}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

function OrdersTab({ navigateStore }: { navigateStore: (page: string, params?: Record<string, string>) => void }) {
  const [orders, setOrders] = useState<Array<{
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
    items: Array<{ productName: string; quantity: number }>
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch('/api/orders?limit=10')
        const data = await res.json()
        if (data.success) setOrders(data.data)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    loadOrders()
  }, [])

  const handleExportOrders = useCallback(() => {
    if (orders.length === 0) {
      toast.error('No orders to export')
      return
    }

    // Generate CSV content
    const headers = ['Order ID', 'Date', 'Status', 'Items Count', 'Total']
    const rows = orders.map((order) => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString(),
      order.status.charAt(0).toUpperCase() + order.status.slice(1),
      String(order.items.length),
      `$${order.totalAmount.toFixed(2)}`,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const today = new Date().toISOString().split('T')[0]
    const filename = `shophub-orders-${today}.csv`

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)

    toast.success('Orders exported successfully!', {
      description: `File saved as ${filename}`,
    })
  }, [orders])

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-sky-100 text-sky-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Orders</h2>
        <Button
          variant="outline"
          size="sm"
          className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
          onClick={handleExportOrders}
          disabled={loading || orders.length === 0}
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export Orders
        </Button>
      </div>
      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => {
          const currentStepIdx = getStepIndex(order.status)
          return (
            <Card
              key={order.id}
              className="overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-0">
                {/* Order Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{order.orderNumber}</span>
                      <Badge className={`${statusColors[order.status] || 'bg-gray-100 text-gray-700'} border-0 text-xs`}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <Button variant="ghost" size="sm" className="text-emerald-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Order Timeline */}
                {order.status !== 'cancelled' && (
                  <div className="border-t bg-muted/20 px-4 py-3">
                    <div className="flex items-center justify-between relative">
                      {/* Background line */}
                      <div className="absolute left-0 right-0 top-4 h-0.5 bg-muted">
                        <motion.div
                          className="h-full bg-emerald-500"
                          initial={{ width: '0%' }}
                          animate={{ width: `${(currentStepIdx / (ORDER_STEPS.length - 1)) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      {ORDER_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx
                        const isCurrent = idx === currentStepIdx
                        const StepIcon = step.icon
                        return (
                          <div key={step.key} className="relative flex flex-col items-center z-10">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isCompleted
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-background border-muted-foreground/30 text-muted-foreground'
                              } ${isCurrent ? 'ring-4 ring-emerald-100 dark:ring-emerald-950/50' : ''}`}
                            >
                              <StepIcon className="h-3.5 w-3.5" />
                            </div>
                            <span className={`text-[10px] mt-1 font-medium ${isCompleted ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                        onClick={() => navigateStore('order-tracking', { orderNumber: order.orderNumber })}
                      >
                        <Truck className="h-3 w-3 mr-1" />
                        Track Order
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

function AddressesTab() {
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      fullName: 'John Smith',
      phone: '+1 (555) 123-4567',
      street: '123 Main Street',
      aptSuite: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      type: 'Home' as const,
      isDefault: true,
    },
    {
      id: '2',
      fullName: 'John Smith',
      phone: '+1 (555) 987-6543',
      street: '456 Business Ave',
      aptSuite: 'Suite 200',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
      type: 'Office' as const,
      isDefault: false,
    },
    {
      id: '3',
      fullName: 'John Smith',
      phone: '+1 (555) 456-7890',
      street: '789 Oak Lane',
      aptSuite: '',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
      type: 'Other' as const,
      isDefault: false,
    },
  ])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<typeof addresses[0] | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    aptSuite: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    type: 'Home' as 'Home' | 'Office' | 'Other',
    isDefault: false,
  })

  const typeIcon = { Home: Home, Office: Building2, Other: Map }
  const typeBadgeColor = {
    Home: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    Office: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    Other: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  }

  const openAddDialog = useCallback(() => {
    setEditingAddress(null)
    setFormData({
      fullName: '',
      phone: '',
      street: '',
      aptSuite: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      type: 'Home',
      isDefault: false,
    })
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((addr: typeof addresses[0]) => {
    setEditingAddress(addr)
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      aptSuite: addr.aptSuite,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      type: addr.type,
      isDefault: addr.isDefault,
    })
    setDialogOpen(true)
  }, [])

  const handleFormSubmit = useCallback(() => {
    if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in all required fields')
      return
    }
    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingAddress.id ? { ...a, ...formData } : a))
      )
      toast.success('Address updated successfully!')
    } else {
      const newAddr = { id: String(Date.now()), ...formData }
      setAddresses((prev) => [newAddr, ...prev])
      toast.success('Address added successfully!')
    }
    if (formData.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === (editingAddress?.id || String(Date.now())) ? { ...a, isDefault: true } : { ...a, isDefault: false }))
      )
    }
    setDialogOpen(false)
  }, [formData, editingAddress])

  const handleDelete = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    toast.success('Address deleted')
  }, [])

  const handleSetDefault = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false }))
    )
    toast.success('Default address updated')
  }, [])

  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'JP', label: 'Japan' },
    { value: 'BD', label: 'Bangladesh' },
    { value: 'IN', label: 'India' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Addresses</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Street Address *</Label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2">
                <Label>Apt / Suite</Label>
                <Input
                  value={formData.aptSuite}
                  onChange={(e) => setFormData({ ...formData, aptSuite: e.target.value })}
                  placeholder="Apt 4B (optional)"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code *</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="10001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Address Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'Home' | 'Office' | 'Other' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="defaultAddr"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked === true })}
                />
                <Label htmlFor="defaultAddr" className="text-sm cursor-pointer">Set as default address</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleFormSubmit}>
                {editingAddress ? 'Save Changes' : 'Add Address'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <AnimatePresence>
        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No saved addresses</p>
                <p className="text-xs text-muted-foreground mt-1">Add an address to speed up checkout</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr, index) => {
              const TypeIcon = typeIcon[addr.type]
              return (
                <motion.div
                  key={addr.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  layout
                >
                  <Card className={`relative overflow-hidden hover:shadow-md transition-shadow ${addr.isDefault ? 'border-emerald-300 dark:border-emerald-700' : ''}`}>
                    {addr.isDefault && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Badge className={`${typeBadgeColor[addr.type]} border-0 text-xs`}>
                            {addr.type}
                          </Badge>
                          {addr.isDefault && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-0 text-xs">
                              <Check className="h-3 w-3 mr-0.5" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{addr.fullName}</p>
                        <p className="text-xs text-muted-foreground">{addr.phone}</p>
                        <p className="text-sm text-muted-foreground">
                          {addr.street}{addr.aptSuite ? `, ${addr.aptSuite}` : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {countries.find((c) => c.value === addr.country)?.label || addr.country}
                        </p>
                      </div>

                      <Separator />

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs flex-1 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                          onClick={() => openEditDialog(addr)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs flex-1 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(addr.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                        {!addr.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                            onClick={() => handleSetDefault(addr.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Set Default
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ReviewsTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">My Reviews</h2>
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-xs text-muted-foreground mt-1">Your product reviews will appear here</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileTab({ user }: { user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']> }) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone || '')

  const handleSave = useCallback(() => {
    toast.success('Profile updated successfully!')
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Profile Settings</h2>

      {/* Avatar & Basic Info */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Button variant="outline" size="sm" className="mt-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600">
                <Edit className="h-3.5 w-3.5 mr-1" />
                Change Avatar
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="font-semibold">Change Password</h3>
          </div>
          <div className="space-y-3 max-w-sm">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
          <Button variant="outline" onClick={() => toast.success('Password updated!')} className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-950/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-600">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-100 dark:border-red-950/40">
            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
              Once you delete your account, there is no going back. All your data, orders, and reviews will be permanently removed.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => toast.error('Account deletion is disabled in demo mode')}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RewardsTab() {
  const points = useRewardStore((s) => s.points)
  const history = useRewardStore((s) => s.history)
  const redeemPoints = useRewardStore((s) => s.redeemPoints)
  const [historyExpanded, setHistoryExpanded] = useState(false)

  // Tier calculation with enhanced gradient backgrounds
  const tier = useMemo(() => {
    if (points >= 10000) return { name: 'Platinum', color: 'from-slate-300 to-slate-500', gradient: 'from-emerald-400 to-teal-500', textColor: 'text-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-950/30', icon: '👑' }
    if (points >= 5000) return { name: 'Gold', color: 'from-amber-400 to-yellow-500', gradient: 'from-yellow-400 to-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30', icon: '🥇' }
    if (points >= 1000) return { name: 'Silver', color: 'from-gray-300 to-gray-400', gradient: 'from-slate-300 to-gray-400', textColor: 'text-gray-600', bgColor: 'bg-slate-50 dark:bg-slate-950/30', icon: '🥈' }
    return { name: 'Bronze', color: 'from-amber-600 to-amber-800', gradient: 'from-amber-500 to-amber-700', textColor: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950/30', icon: '🥉' }
  }, [points])

  const nextTierPoints = useMemo(() => {
    if (points >= 10000) return null
    if (points >= 5000) return 10000
    if (points >= 1000) return 5000
    return 1000
  }, [points])

  const nextTierName = useMemo(() => {
    if (points >= 10000) return null
    if (points >= 5000) return 'Platinum'
    if (points >= 1000) return 'Gold'
    return 'Silver'
  }, [points])

  const progressToNextTier = useMemo(() => {
    if (!nextTierPoints) return 100
    const thresholds = [0, 1000, 5000, 10000]
    const currentThresholdIdx = thresholds.filter((t) => t <= points).length - 1
    const currentThreshold = thresholds[currentThresholdIdx]
    const nextThreshold = thresholds[currentThresholdIdx + 1] || thresholds[thresholds.length - 1]
    if (nextThreshold === currentThreshold) return 100
    return Math.round(((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
  }, [points, nextTierPoints])

  // Tier benefits
  const tierBenefits = useMemo(() => {
    const allBenefits: Record<string, Array<{ text: string; unlocked: boolean }>> = {
      Bronze: [
        { text: '1 point per $1 spent', unlocked: true },
        { text: 'Birthday bonus points', unlocked: true },
        { text: 'Free shipping on orders $50+', unlocked: false },
        { text: 'Early access to sales', unlocked: false },
        { text: 'Exclusive member discounts', unlocked: false },
        { text: 'Priority customer support', unlocked: false },
      ],
      Silver: [
        { text: '1.5 points per $1 spent', unlocked: true },
        { text: 'Birthday bonus points', unlocked: true },
        { text: 'Free shipping on all orders', unlocked: true },
        { text: 'Early access to sales', unlocked: true },
        { text: 'Exclusive member discounts', unlocked: false },
        { text: 'Priority customer support', unlocked: false },
      ],
      Gold: [
        { text: '2 points per $1 spent', unlocked: true },
        { text: 'Birthday bonus points', unlocked: true },
        { text: 'Free shipping on all orders', unlocked: true },
        { text: 'Early access to sales', unlocked: true },
        { text: 'Exclusive member discounts', unlocked: true },
        { text: 'Priority customer support', unlocked: false },
      ],
      Platinum: [
        { text: '3 points per $1 spent', unlocked: true },
        { text: 'Birthday bonus points', unlocked: true },
        { text: 'Free express shipping', unlocked: true },
        { text: 'Early access to sales', unlocked: true },
        { text: 'Exclusive member discounts', unlocked: true },
        { text: 'Priority customer support', unlocked: true },
      ],
    }
    return allBenefits[tier.name] || allBenefits.Bronze
  }, [tier.name])

  const availableRewards = [
    { points: 500, value: 5, description: '$5 off your next order', gradient: 'from-emerald-400 to-teal-500' },
    { points: 1000, value: 10, description: '$10 off your next order', gradient: 'from-teal-400 to-cyan-500' },
    { points: 2000, value: 20, description: '$20 off your next order', gradient: 'from-cyan-400 to-sky-500' },
    { points: 5000, value: 50, description: '$50 off your next order', gradient: 'from-amber-400 to-orange-500' },
  ]

  const handleRedeem = useCallback((rewardPoints: number, rewardValue: number) => {
    const success = redeemPoints(rewardPoints, `Redeemed - $${rewardValue} off coupon`)
    if (success) {
      toast.success(`Successfully redeemed ${rewardPoints} points for $${rewardValue} off!`)
    } else {
      toast.error('Not enough points to redeem this reward')
    }
  }, [redeemPoints])

  // Recent transactions (5 most recent from store)
  const recentTransactions = history.slice(0, 5)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Reward Points</h2>

      {/* Points Balance Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <p className="text-emerald-100 text-sm font-medium mb-1">Available Points</p>
              <motion.div
                className="text-5xl font-bold mb-2"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                {points.toLocaleString()}
              </motion.div>
              <p className="text-emerald-100 text-sm">Worth {formatPrice(points / 100)} in rewards</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Large Tier Badge with gradient */}
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{tier.icon}</span>
              </div>
              <div className="flex-1">
                <Badge className={`bg-gradient-to-r ${tier.gradient} text-white border-0 px-3 py-1 text-sm font-bold shadow-md`}>
                  {tier.name} Member
                </Badge>
                {nextTierPoints && nextTierName ? (
                  <div className="mt-1.5">
                    <p className="text-xs text-muted-foreground mb-1">
                      <span className="font-semibold text-emerald-600">{(nextTierPoints - points).toLocaleString()}</span> points until {nextTierName}
                    </p>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNextTier}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-medium mt-1">🎉 Maximum tier reached!</p>
                )}
              </div>
            </div>

            {/* Tier Benefits */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Tier Benefits</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {tierBenefits.map((benefit) => (
                  <div
                    key={benefit.text}
                    className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${
                      benefit.unlocked
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-muted/30 text-muted-foreground line-through opacity-50'
                    }`}
                  >
                    {benefit.unlocked ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-muted-foreground/30 shrink-0" />
                    )}
                    {benefit.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards History Expandable Section */}
      <Card>
        <CardContent className="p-0">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold">Rewards History</h3>
              <Badge variant="secondary" className="text-[10px]">{recentTransactions.length} recent</Badge>
            </div>
            <motion.div
              animate={{ rotate: historyExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </button>
          <AnimatePresence>
            {historyExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t divide-y max-h-72 overflow-y-auto">
                  {recentTransactions.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                          entry.type === 'earned'
                            ? 'bg-emerald-100 dark:bg-emerald-950/30'
                            : 'bg-red-100 dark:bg-red-950/30'
                        }`}>
                          {entry.type === 'earned' ? (
                            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{entry.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold whitespace-nowrap ${
                        entry.type === 'earned' ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {entry.type === 'earned' ? '+' : '-'}{entry.points}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Redeem Points Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Redeem Points</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableRewards.map((reward) => {
            const canRedeem = points >= reward.points
            return (
              <motion.div
                key={reward.points}
                whileHover={canRedeem ? { scale: 1.02 } : {}}
                whileTap={canRedeem ? { scale: 0.98 } : {}}
              >
                <Card className={`overflow-hidden ${canRedeem ? 'hover:shadow-md cursor-pointer' : 'opacity-60'} transition-all`}>
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-r ${reward.gradient} p-3 text-white`}>
                      <span className="text-2xl font-bold">${reward.value}</span>
                      <span className="text-sm ml-1 opacity-90">OFF</span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">{reward.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          {reward.points} points
                        </span>
                        <Button
                          size="sm"
                          className={`h-7 text-xs ${
                            canRedeem
                              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                          disabled={!canRedeem}
                          onClick={() => handleRedeem(reward.points, reward.value)}
                        >
                          {canRedeem ? 'Redeem' : 'Not enough'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Full Points History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Full History</h3>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y max-h-96 overflow-y-auto">
              {history.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      entry.type === 'earned'
                        ? 'bg-emerald-100 dark:bg-emerald-950/30'
                        : 'bg-red-100 dark:bg-red-950/30'
                    }`}>
                      {entry.type === 'earned' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold whitespace-nowrap ${
                    entry.type === 'earned' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {entry.type === 'earned' ? '+' : '-'}{entry.points}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earn More Points */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Earn More Points</h3>
              <p className="text-xs text-muted-foreground">1 point per $1 spent + bonus activities</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { icon: ShoppingBag, text: '1 pt per $1 spent', subtext: 'On every purchase' },
              { icon: Star, text: '50 pts per review', subtext: 'Write product reviews' },
              { icon: User, text: '250 pts per referral', subtext: 'Invite friends' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.text} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-white/5">
                  <Icon className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">{item.text}</p>
                    <p className="text-[10px] text-muted-foreground">{item.subtext}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
