'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Search,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Download,
  Printer,
  RefreshCw,
  CheckCircle2,
  Circle,
  Clock,
  Package,
  Truck,
  CreditCard,
  Banknote,
  Wallet,
  Smartphone,
  Flame,
  ArrowDown,
  Minus,
  FileDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string
  totalAmount: number
  createdAt: string
  customer: { user: { name: string; email: string } } | null
  items: Array<{ productName: string; quantity: number }>
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
  packed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300',
  shipped: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  returned: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
  refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-950/40 dark:text-gray-300',
}

const statusDotColors: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-purple-500',
  packed: 'bg-indigo-500',
  shipped: 'bg-emerald-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
  returned: 'bg-orange-500',
  refunded: 'bg-gray-500',
}

// Status progression order
const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

// All possible statuses for the dropdown
const allStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const paymentColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const statusTabs = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

// Order status timeline steps
const timelineSteps = [
  { key: 'pending', label: 'Placed', icon: Clock, description: 'Order has been placed' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, description: 'Order confirmed by admin' },
  { key: 'processing', label: 'Processing', icon: Package, description: 'Order is being prepared' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Order has been shipped' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, description: 'Order delivered successfully' },
]

// Payment method icons
function PaymentMethodIcon({ method }: { method: string }) {
  switch (method) {
    case 'stripe':
    case 'card':
      return <CreditCard className="h-3.5 w-3.5 text-sky-500" />
    case 'cod':
      return <Banknote className="h-3.5 w-3.5 text-emerald-500" />
    case 'bkash':
      return <Smartphone className="h-3.5 w-3.5 text-pink-500" />
    case 'nagad':
      return <Wallet className="h-3.5 w-3.5 text-orange-500" />
    default:
      return <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
  }
}

// Customer avatar with initials
function CustomerAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const colors = ['bg-emerald-500', 'bg-teal-500', 'bg-sky-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500']
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length

  return (
    <div className={`h-7 w-7 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
      {initials}
    </div>
  )
}

// Order priority based on total amount
function getOrderPriority(totalAmount: number): { label: string; color: string; icon: React.ElementType } {
  if (totalAmount >= 500) return { label: 'High', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800/40', icon: Flame }
  if (totalAmount >= 150) return { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40', icon: ArrowDown }
  return { label: 'Low', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40', icon: Minus }
}

// Daily order sparkline data
const dailyOrderTrend = [3, 5, 4, 7, 6, 8, 5, 9, 7, 6, 8, 10, 7, 5]

function MiniOrderSparkline() {
  const data = dailyOrderTrend
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 120
  const height = 32

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} className="opacity-70">
      <defs>
        <linearGradient id="orderSparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#orderSparkGrad)" />
      <polyline points={points} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function OrdersPage() {
  const navigateAdmin = useNavStore((s) => s.navigateAdmin)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  // Bulk actions state
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkActionOpen, setBulkActionOpen] = useState(false)

  // Order detail timeline dialog
  const [timelineOrder, setTimelineOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set('search', search)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data || [])
        setTotalPages(data.meta?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Select all toggle
  const toggleSelectAll = useCallback(() => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)))
    }
  }, [orders, selectedOrders])

  const toggleSelectOrder = useCallback((id: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBulkStatusUpdate = useCallback(async (status: string) => {
    if (selectedOrders.size === 0) return
    try {
      let successCount = 0
      for (const orderId of selectedOrders) {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        const data = await res.json()
        if (data.success) successCount++
      }
      toast.success(`${successCount} order(s) updated to ${status}`)
      setSelectedOrders(new Set())
      fetchOrders()
    } catch {
      toast.error('Failed to update orders')
    }
    setBulkActionOpen(false)
  }, [selectedOrders, fetchOrders])

  const handleBulkExport = useCallback(() => {
    const csvRows = [
      ['Order #', 'Customer', 'Status', 'Payment', 'Total', 'Date'].join(','),
      ...orders
        .filter(o => selectedOrders.has(o.id))
        .map(o => [
          o.orderNumber,
          o.customer?.user?.name || 'Guest',
          o.status,
          o.paymentStatus,
          o.totalAmount.toFixed(2),
          new Date(o.createdAt).toLocaleDateString(),
        ].join(','))
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders-export.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${selectedOrders.size} orders`)
    setBulkActionOpen(false)
  }, [orders, selectedOrders])

  // Export all orders to CSV
  const handleExportAllOrders = useCallback(() => {
    if (orders.length === 0) {
      toast.error('No orders to export')
      return
    }
    const csvRows = [
      ['Order #', 'Customer', 'Email', 'Status', 'Payment Status', 'Payment Method', 'Total', 'Items', 'Date'].join(','),
      ...orders.map(o => [
        o.orderNumber,
        `"${o.customer?.user?.name || 'Guest'}"`,
        o.customer?.user?.email || '',
        o.status,
        o.paymentStatus,
        o.paymentMethod,
        o.totalAmount.toFixed(2),
        o.items.length,
        new Date(o.createdAt).toLocaleDateString(),
      ].join(','))
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const today = new Date().toISOString().split('T')[0]
    const a = document.createElement('a')
    a.href = url
    a.download = `shophub-orders-${today}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${orders.length} orders`, { description: `File saved as shophub-orders-${today}.csv` })
  }, [orders])

  // Get timeline status index
  const getTimelineIndex = (status: string) => {
    const idx = timelineSteps.findIndex(s => s.key === status)
    return idx >= 0 ? idx : 0
  }

  // Status update handler
  const handleStatusUpdate = useCallback(async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`)
        fetchOrders()
      } else {
        toast.error('Failed to update order status')
      }
    } catch {
      toast.error('Failed to update order status')
    }
  }, [fetchOrders])

  // Get status progression percentage
  const getStatusProgress = (status: string) => {
    if (status === 'cancelled') return 0
    const idx = statusOrder.indexOf(status)
    if (idx < 0) return 0
    return ((idx + 1) / statusOrder.length) * 100
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">Manage customer orders</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">Daily Trend</p>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{orders.length} orders</p>
            </div>
            <MiniOrderSparkline />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-emerald-800 dark:hover:bg-emerald-950"
            onClick={handleExportAllOrders}
            disabled={orders.length === 0}
          >
            <FileDown className="h-4 w-4 mr-1.5" />
            Export Orders
          </Button>
        {selectedOrders.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0">
              {selectedOrders.size} selected
            </Badge>
            <DropdownMenu open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  Bulk Actions
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('confirmed')}>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                  Mark as Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('processing')}>
                  <Package className="h-4 w-4 mr-2 text-violet-500" />
                  Mark as Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate('shipped')}>
                  <Truck className="h-4 w-4 mr-2 text-teal-500" />
                  Mark as Shipped
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBulkExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { window.print(); setBulkActionOpen(false) }}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => setSelectedOrders(new Set())}
            >
              Clear
            </Button>
          </motion.div>
        )}
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
        <TabsList className="flex-wrap h-auto gap-1 w-full">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-xs capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number or customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={orders.length > 0 && selectedOrders.size === orders.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Payment</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      className="group relative cursor-pointer border-b transition-colors hover:bg-muted/30"
                      onClick={() => navigateAdmin('order-detail', { id: order.id })}
                      initial={false}
                      whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.04)' }}
                    >
                      <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedOrders.has(order.id)}
                          onCheckedChange={() => toggleSelectOrder(order.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CustomerAvatar name={order.customer?.user?.name || 'Guest'} />
                          <div>
                            <p className="text-sm">{order.customer?.user?.name || 'Guest'}</p>
                            <p className="text-[11px] text-muted-foreground hidden lg:block">{order.customer?.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs bg-muted/50 border-0">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">${order.totalAmount.toFixed(2)}</span>
                          {(() => {
                            const priority = getOrderPriority(order.totalAmount)
                            const PriorityIcon = priority.icon
                            return (
                              <Badge className={`text-[9px] border px-1.5 py-0 ${priority.color}`}>
                                <PriorityIcon className="h-2.5 w-2.5 mr-0.5" />
                                {priority.label}
                              </Badge>
                            )
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <motion.div
                            key={order.status}
                            initial={{ scale: 1.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                          >
                            <Badge variant="secondary" className={`${statusColors[order.status] || ''} flex items-center gap-1.5`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusDotColors[order.status] || 'bg-gray-500'}`} />
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </motion.div>
                          {/* Mini timeline indicator */}
                          {order.status !== 'cancelled' && (
                            <div className="hidden xl:flex items-center gap-0.5 w-20">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${getStatusProgress(order.status)}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                              </div>
                              <span className="text-[9px] text-muted-foreground ml-1 w-7">{Math.round(getStatusProgress(order.status))}%</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <PaymentMethodIcon method={order.paymentMethod} />
                          <Badge variant="secondary" className={paymentColors[order.paymentStatus] || ''}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigateAdmin('order-detail', { id: order.id })}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setTimelineOrder(order)}>
                                <Clock className="mr-2 h-4 w-4" />
                                View Timeline
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Update Status</p>
                              {allStatuses.map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() => handleStatusUpdate(order.id, s)}
                                  disabled={s === order.status}
                                  className="flex items-center gap-2"
                                >
                                  <span className={`h-2 w-2 rounded-full ${statusDotColors[s] || 'bg-gray-400'}`} />
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                  {s === order.status && <CheckCircle2 className="h-3 w-3 ml-auto text-emerald-500" />}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table></div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Order Status Timeline Dialog */}
      <Dialog open={!!timelineOrder} onOpenChange={() => setTimelineOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order Timeline #{timelineOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {timelineOrder && (
            <div className="space-y-0">
              {timelineSteps.map((step, index) => {
                const currentIndex = getTimelineIndex(timelineOrder.status)
                const isCompleted = index < currentIndex
                const isCurrent = index === currentIndex
                const isFuture = index > currentIndex
                const StepIcon = step.icon

                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
                        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-muted border-muted-foreground/20 text-muted-foreground/40'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isCurrent ? (
                          <>
                            <StepIcon className="h-4 w-4" />
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-emerald-400"
                              animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </>
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </motion.div>
                      {index < timelineSteps.length - 1 && (
                        <div className={`w-0.5 h-8 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                        }`} />
                      )}
                    </div>
                    {/* Step content */}
                    <div className="pb-6">
                      <p className={`text-sm font-semibold ${
                        isFuture ? 'text-muted-foreground/40' : isCurrent ? 'text-emerald-700 dark:text-emerald-300' : ''
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isFuture ? 'text-muted-foreground/30' : 'text-muted-foreground'}`}>
                        {step.description}
                      </p>
                      {isCurrent && (
                        <Badge className="mt-1.5 h-5 text-[10px] bg-emerald-500 text-white border-0">
                          Current Status
                        </Badge>
                      )}
                      {isCompleted && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Completed
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
              {/* Cancelled state */}
              {timelineOrder.status === 'cancelled' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-red-500 text-white flex items-center justify-center">
                      <Circle className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-600">Cancelled</p>
                    <p className="text-xs text-muted-foreground">Order has been cancelled</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimelineOrder(null)}>Close</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                if (timelineOrder) {
                  navigateAdmin('order-detail', { id: timelineOrder.id })
                  setTimelineOrder(null)
                }
              }}
            >
              View Full Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
