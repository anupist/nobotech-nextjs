'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Plus,
  Eye,
  Truck,
  BarChart3,
  Activity,
  Clock,
  PackageCheck,
  UserPlus,
  CreditCard,
  AlertTriangle,
  Zap,
  Tag,
  PieChart as PieChartIcon,
  MessageSquare,
  Target,
  Repeat,
  ShoppingCartIcon,
  Sun,
  Megaphone,
  ChevronDown,
  CheckCheck,
  Star,
  Copy,
  Archive,
  Bell,
  LayoutList,
  CalendarDays,
  Timer,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Legend,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Stats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  pendingOrders: number
  totalCategories: number
  totalBrands: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
    customer: { user: { name: string; email: string } } | null
    items: Array<{ productName: string; quantity: number; total: number }>
  }>
  topProducts: Array<{
    id: string
    name: string
    thumbnail: string | null
    sellingPrice: number
    totalSold: number
    averageRating: number
  }>
  monthlyRevenue: Record<string, number>
}

const statusColors: Record<string, { bg: string; dot: string; text: string }> = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-950/40', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  confirmed: { bg: 'bg-sky-50 dark:bg-sky-950/40', dot: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-300' },
  processing: { bg: 'bg-violet-50 dark:bg-violet-950/40', dot: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-300' },
  shipped: { bg: 'bg-teal-50 dark:bg-teal-950/40', dot: 'bg-teal-500', text: 'text-teal-700 dark:text-teal-300' },
  delivered: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-950/40', dot: 'bg-red-500', text: 'text-red-700 dark:text-red-300' },
}

// Sparkline data for stat cards
const sparklineData = {
  revenue: [40, 55, 45, 65, 50, 75, 60, 80, 70, 90, 85, 95],
  orders: [30, 45, 35, 50, 40, 55, 45, 60, 50, 65, 55, 70],
  customers: [20, 25, 30, 28, 35, 32, 38, 40, 36, 45, 42, 48],
  products: [60, 58, 55, 57, 54, 52, 53, 51, 50, 49, 48, 47],
}

// Animated counter hook with pulse detection
function useAnimatedCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0)
  const [pulse, setPulse] = useState(false)
  const prevTarget = useRef(0)

  useEffect(() => {
    if (target === prevTarget.current) return
    let pulseTimer: ReturnType<typeof setTimeout> | undefined
    if (prevTarget.current !== 0) {
      pulseTimer = setTimeout(() => {
        setPulse(true)
        setTimeout(() => setPulse(false), 600)
      }, 0)
    }
    prevTarget.current = target
    const start = count
    const diff = target - start
    const startTime = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(start + diff * eased))
      if (progress >= 1) clearInterval(timer)
    }, 16)

    return () => { clearInterval(timer); if (pulseTimer) clearTimeout(pulseTimer) }
  }, [target, duration])

  return { count, pulse }
}

// Mini Sparkline Component
function MiniSparkline({ data, color, width = 80, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} className="opacity-60">
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sparkGrad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Activity Feed Data with type-based border colors
type ActivityType = 'order' | 'review' | 'customer' | 'inventory'

const activityFeedInitial = [
  { id: '1', type: 'order' as ActivityType, message: 'New order #ORD-0015 placed', time: '2 min ago', icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400', unread: true, avatar: 'JD', avatarColor: 'bg-emerald-500' },
  { id: '2', type: 'customer' as ActivityType, message: 'New customer registered: Jane Smith', time: '15 min ago', icon: UserPlus, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950 dark:text-sky-400', unread: true, avatar: 'JS', avatarColor: 'bg-sky-500' },
  { id: '3', type: 'order' as ActivityType, message: 'Payment received for order #ORD-0014', time: '32 min ago', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400', unread: true, avatar: 'MR', avatarColor: 'bg-emerald-500' },
  { id: '4', type: 'inventory' as ActivityType, message: 'Low stock alert: Wireless Headphones (3 left)', time: '1 hour ago', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-400', unread: false, avatar: 'SY', avatarColor: 'bg-rose-500' },
  { id: '5', type: 'review' as ActivityType, message: 'New 5-star review on Smart Watch Pro', time: '2 hours ago', icon: Star, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400', unread: false, avatar: 'AK', avatarColor: 'bg-amber-500' },
  { id: '6', type: 'order' as ActivityType, message: 'Order #ORD-0008 delivered successfully', time: '3 hours ago', icon: PackageCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400', unread: false, avatar: 'BT', avatarColor: 'bg-teal-500' },
  { id: '7', type: 'review' as ActivityType, message: 'New 4-star review on Laptop Stand', time: '4 hours ago', icon: Star, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400', unread: false, avatar: 'LM', avatarColor: 'bg-amber-500' },
  { id: '8', type: 'inventory' as ActivityType, message: 'Product "USB-C Hub" restocked (50 units)', time: '5 hours ago', icon: Package, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-400', unread: false, avatar: 'PD', avatarColor: 'bg-rose-500' },
]

const borderColors: Record<ActivityType, string> = {
  order: 'border-l-emerald-500',
  review: 'border-l-amber-500',
  customer: 'border-l-sky-500',
  inventory: 'border-l-rose-500',
}

// Revenue data by period with previous period comparison
const revenuePeriods: Record<string, Array<{ label: string; revenue: number; orders: number; prevRevenue: number; prevOrders: number }>> = {
  '7d': [
    { label: 'Mon', revenue: 1200, orders: 8, prevRevenue: 950, prevOrders: 6 },
    { label: 'Tue', revenue: 1800, orders: 12, prevRevenue: 1400, prevOrders: 9 },
    { label: 'Wed', revenue: 1400, orders: 10, prevRevenue: 1100, prevOrders: 7 },
    { label: 'Thu', revenue: 2200, orders: 15, prevRevenue: 1800, prevOrders: 12 },
    { label: 'Fri', revenue: 1900, orders: 13, prevRevenue: 1500, prevOrders: 10 },
    { label: 'Sat', revenue: 2800, orders: 19, prevRevenue: 2200, prevOrders: 15 },
    { label: 'Sun', revenue: 2400, orders: 16, prevRevenue: 1900, prevOrders: 13 },
  ],
  '30d': [
    { label: 'W1', revenue: 8500, orders: 56, prevRevenue: 7200, prevOrders: 48 },
    { label: 'W2', revenue: 9200, orders: 62, prevRevenue: 7800, prevOrders: 52 },
    { label: 'W3', revenue: 7800, orders: 51, prevRevenue: 6500, prevOrders: 43 },
    { label: 'W4', revenue: 10500, orders: 70, prevRevenue: 8900, prevOrders: 59 },
  ],
  '90d': [
    { label: 'Jan', revenue: 28000, orders: 186, prevRevenue: 24000, prevOrders: 160 },
    { label: 'Feb', revenue: 32000, orders: 213, prevRevenue: 27000, prevOrders: 180 },
    { label: 'Mar', revenue: 36000, orders: 240, prevRevenue: 30000, prevOrders: 200 },
  ],
  '1y': [
    { label: 'Q1', revenue: 96000, orders: 639, prevRevenue: 82000, prevOrders: 547 },
    { label: 'Q2', revenue: 112000, orders: 748, prevRevenue: 95000, prevOrders: 633 },
    { label: 'Q3', revenue: 105000, orders: 700, prevRevenue: 88000, prevOrders: 587 },
    { label: 'Q4', revenue: 138000, orders: 920, prevRevenue: 115000, prevOrders: 767 },
  ],
}

const orderStatusData = [
  { status: 'Pending', count: 0, fill: '#f59e0b' },
  { status: 'Confirmed', count: 0, fill: '#0ea5e9' },
  { status: 'Processing', count: 0, fill: '#8b5cf6' },
  { status: 'Shipped', count: 0, fill: '#14b8a6' },
  { status: 'Delivered', count: 0, fill: '#10b981' },
  { status: 'Cancelled', count: 0, fill: '#ef4444' },
]

// Customer Acquisition Funnel Data
const funnelData = [
  { label: 'Visitors', value: 12450, color: 'from-emerald-400 to-emerald-500', width: '100%' },
  { label: 'Signups', value: 3120, color: 'from-emerald-500 to-teal-500', width: '76%' },
  { label: 'First Purchase', value: 890, color: 'from-teal-500 to-teal-600', width: '52%' },
  { label: 'Repeat Purchase', value: 340, color: 'from-teal-600 to-cyan-600', width: '32%' },
]

// Top Products by Revenue data
const topProductRevenueColors = ['#10b981', '#14b8a6', '#0d9488', '#0f766e', '#115e59']

// Performance metrics
const performanceMetrics = [
  { label: 'Avg Order Value', value: 89.50, suffix: '$', target: 100, color: '#10b981', icon: DollarSign },
  { label: 'Conversion Rate', value: 3.2, suffix: '%', target: 5, color: '#14b8a6', icon: Target },
  { label: 'Customer Retention', value: 68, suffix: '%', target: 100, color: '#0d9488', icon: Repeat },
  { label: 'Cart Abandonment', value: 24, suffix: '%', target: 100, color: '#f59e0b', icon: ShoppingCartIcon },
]

// Demo product sparkline data for top products trend
const productTrendData: Record<number, number[]> = {
  0: [12, 18, 15, 22, 19, 25, 28],
  1: [8, 12, 14, 11, 16, 18, 20],
  2: [15, 13, 18, 16, 20, 17, 22],
  3: [6, 9, 7, 11, 8, 13, 10],
  4: [10, 8, 12, 9, 14, 11, 15],
}

// Announcements data
const announcementsData = [
  { id: '1', title: 'Summer Sale Campaign Starting', message: 'Configure summer sale discounts and banners before June 1st', icon: Sun, date: 'May 28, 2025', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400' },
  { id: '2', title: 'New Payment Method Available', message: 'bKash and Nagad payment integration is now live for customers', icon: CreditCard, date: 'May 25, 2025', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400' },
  { id: '3', title: 'Inventory Review Needed', message: '5 products are below low stock threshold and require attention', icon: AlertTriangle, date: 'May 24, 2025', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-400' },
]

// Circular Progress Component
function CircularProgress({ value, target, color, size = 72, strokeWidth = 6 }: { value: number; target: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percent = Math.min(value / target, 1)
  const offset = circumference - percent * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// Low Stock Alerts Component
interface LowStockProduct {
  id: string
  name: string
  thumbnail: string | null
  sellingPrice: number
  inventory: { quantity: number; lowStockAlert: number } | null
}

function LowStockAlerts({ navigateAdmin }: { navigateAdmin: (page: 'inventory' | 'edit-product', params?: Record<string, string>) => void }) {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await fetch('/api/products?limit=100')
        const data = await res.json()
        if (data.success) {
          const products = (data.data as LowStockProduct[]).filter(
            (p) => p.inventory && p.inventory.quantity < 10
          )
          setLowStockProducts(products)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchLowStock()
  }, [])

  const criticalCount = lowStockProducts.filter((p) => (p.inventory?.quantity ?? 0) < 5).length
  const lowCount = lowStockProducts.filter((p) => {
    const qty = p.inventory?.quantity ?? 0
    return qty >= 5 && qty < 10
  }).length

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400" />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low Stock Alerts
              {lowStockProducts.length > 0 && (
                <Badge className="h-5 px-1.5 text-[10px] bg-red-500 text-white border-0 hover:bg-red-600">
                  {lowStockProducts.length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-0">
                  {criticalCount} Critical
                </Badge>
              )}
              {lowCount > 0 && (
                <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0">
                  {lowCount} Low
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-emerald-800 dark:hover:bg-emerald-950"
                onClick={() => navigateAdmin('inventory')}
              >
                View Inventory
              </Button>
            </div>
          </div>
          <CardDescription>Products with stock below 10 units</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <PackageCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All products are well-stocked!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {lowStockProducts.map((product, index) => {
                const quantity = product.inventory?.quantity ?? 0
                const isCritical = quantity < 5
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      isCritical
                        ? 'border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/10'
                        : 'border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/10'
                    }`}
                  >
                    {/* Product thumbnail */}
                    <div className="h-10 w-10 rounded-lg bg-muted/50 overflow-hidden shrink-0">
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          ${product.sellingPrice.toFixed(2)}
                        </span>
                        <div className={`h-1.5 w-16 rounded-full overflow-hidden ${isCritical ? 'bg-red-200 dark:bg-red-900' : 'bg-amber-200 dark:bg-amber-900'}`}>
                          <motion.div
                            className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(quantity / 10) * 100}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <Badge className={`text-[10px] border-0 shrink-0 ${
                      isCritical
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {isCritical ? 'Critical' : 'Low'}
                    </Badge>

                    {/* Stock count */}
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {quantity}
                      </p>
                      <p className="text-[10px] text-muted-foreground">units</p>
                    </div>

                    {/* Pulse animation for critical */}
                    {isCritical && (
                      <motion.div
                        className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0"
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}

                    {/* Reorder button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] shrink-0 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-emerald-800 dark:hover:bg-emerald-950"
                      onClick={() => navigateAdmin('edit-product', { id: product.id })}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reorder
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function DashboardPage() {
  const navigateAdmin = useNavStore((s) => s.navigateAdmin)
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [revenuePeriod, setRevenuePeriod] = useState<'7d' | '30d' | '90d' | '1y'>('7d')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const [activityItems, setActivityItems] = useState(activityFeedInitial.map(a => ({ ...a, read: a.unread ? false : true })))
  const [announcementsOpen, setAnnouncementsOpen] = useState(true)
  const [readAnnouncements, setReadAnnouncements] = useState<Set<string>>(new Set())
  const [currentTime, setCurrentTime] = useState(new Date())

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const animatedRevenue = useAnimatedCounter(stats?.totalRevenue || 0)
  const animatedOrders = useAnimatedCounter(stats?.totalOrders || 0)
  const animatedCustomers = useAnimatedCounter(stats?.totalCustomers || 0)
  const animatedProducts = useAnimatedCounter(stats?.totalProducts || 0)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const revenueChartData = useMemo(() => {
    if (!stats?.monthlyRevenue) return []
    return Object.entries(stats.monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        }),
        revenue: Math.round(revenue),
      }))
  }, [stats])

  // Top products by revenue chart data
  const topProductsRevenueData = useMemo(() => {
    if (!stats?.topProducts) return []
    return stats.topProducts.map((product, index) => ({
      name: product.name.length > 18 ? product.name.slice(0, 18) + '...' : product.name,
      revenue: Math.round(product.sellingPrice * product.totalSold),
      fill: topProductRevenueColors[index] || '#10b981',
    }))
  }, [stats])

  const markAllRead = useCallback(() => {
    setActivityItems(prev => prev.map(a => ({ ...a, read: true })))
    toast.success('All activities marked as read')
  }, [])

  const markAnnouncementRead = useCallback((id: string) => {
    setReadAnnouncements(prev => new Set(prev).add(id))
  }, [])

  const daysRemainingInMonth = useMemo(() => {
    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return endOfMonth.getDate() - now.getDate()
  }, [])

  const statCards = useMemo(
    () => [
      {
        title: 'Total Revenue',
        value: `$${animatedRevenue.count.toLocaleString()}`,
        icon: DollarSign,
        change: '+12.5%',
        trend: 'up' as const,
        gradient: 'from-emerald-500 to-teal-600',
        lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        sparkData: sparklineData.revenue,
        sparkColor: '#10b981',
        pulse: animatedRevenue.pulse,
      },
      {
        title: 'Total Orders',
        value: animatedOrders.count.toLocaleString(),
        icon: ShoppingCart,
        change: '+8.2%',
        trend: 'up' as const,
        gradient: 'from-teal-500 to-cyan-600',
        lightBg: 'bg-teal-50 dark:bg-teal-950/40',
        iconBg: 'bg-teal-100 dark:bg-teal-900/60',
        iconColor: 'text-teal-600 dark:text-teal-400',
        sparkData: sparklineData.orders,
        sparkColor: '#14b8a6',
        pulse: animatedOrders.pulse,
      },
      {
        title: 'Total Customers',
        value: animatedCustomers.count.toLocaleString(),
        icon: Users,
        change: '+5.1%',
        trend: 'up' as const,
        gradient: 'from-amber-500 to-orange-600',
        lightBg: 'bg-amber-50 dark:bg-amber-950/40',
        iconBg: 'bg-amber-100 dark:bg-amber-900/60',
        iconColor: 'text-amber-600 dark:text-amber-400',
        sparkData: sparklineData.customers,
        sparkColor: '#f59e0b',
        pulse: animatedCustomers.pulse,
      },
      {
        title: 'Total Products',
        value: animatedProducts.count.toLocaleString(),
        icon: Package,
        change: '-2.3%',
        trend: 'down' as const,
        gradient: 'from-rose-500 to-red-600',
        lightBg: 'bg-rose-50 dark:bg-rose-950/40',
        iconBg: 'bg-rose-100 dark:bg-rose-900/60',
        iconColor: 'text-rose-600 dark:text-rose-400',
        sparkData: sparklineData.products,
        sparkColor: '#f43f5e',
        pulse: animatedProducts.pulse,
      },
    ],
    [animatedRevenue, animatedOrders, animatedCustomers, animatedProducts]
  )

  const quickActions = [
    { label: 'Create Product', icon: Plus, page: 'add-product' as const, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-400' },
    { label: 'View Orders', icon: Eye, page: 'orders' as const, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 dark:text-teal-400' },
    { label: 'Ship Orders', icon: Truck, page: 'orders' as const, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-400' },
    { label: 'Analytics', icon: BarChart3, page: 'analytics' as const, color: 'text-violet-600 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950 dark:hover:bg-violet-900 dark:text-violet-400' },
    { label: 'Add Coupon', icon: Tag, page: 'coupons' as const, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-400' },
    { label: 'View Reviews', icon: MessageSquare, page: 'reviews' as const, color: 'text-sky-600 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-400' },
  ]

  // Custom tooltip for revenue chart
  const RevenueTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold mb-1.5">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">
              {item.name === 'revenue' ? 'Revenue' : item.name === 'prevRevenue' ? 'Prev. Revenue' : item.name === 'orders' ? 'Orders' : 'Prev. Orders'}:
            </span>
            <span className="font-semibold">
              {item.name === 'revenue' || item.name === 'prevRevenue' ? `$${item.value.toLocaleString()}` : item.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Admin Announcements */}
      <motion.div variants={itemVariants}>
        <Collapsible open={announcementsOpen} onOpenChange={setAnnouncementsOpen}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500" />
            <CollapsibleTrigger asChild>
              <button className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-amber-500" />
                      Announcements
                      {announcementsData.filter(a => !readAnnouncements.has(a.id)).length > 0 && (
                        <Badge className="h-5 px-1.5 text-[10px] bg-amber-500 text-white border-0 hover:bg-amber-600">
                          {announcementsData.filter(a => !readAnnouncements.has(a.id)).length} new
                        </Badge>
                      )}
                    </CardTitle>
                    <motion.div
                      animate={{ rotate: announcementsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </CardHeader>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-2">
                  {announcementsData.map((announcement) => {
                    const AnnIcon = announcement.icon
                    const isRead = readAnnouncements.has(announcement.id)
                    return (
                      <motion.div
                        key={announcement.id}
                        layout
                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${isRead ? 'opacity-60' : 'bg-muted/30'}`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${announcement.color}`}>
                          <AnnIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{announcement.title}</p>
                            {!isRead && (
                              <Badge className="h-4 px-1 text-[9px] bg-emerald-500 text-white border-0">New</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{announcement.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-1">{announcement.date}</p>
                        </div>
                        {!isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs shrink-0"
                            onClick={() => markAnnouncementRead(announcement.id)}
                          >
                            Mark read
                          </Button>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </motion.div>

      {/* Today's Summary Card with Live Clock */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</h3>
                  <p className="text-emerald-100 text-xs">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-200" />
                <span className="text-lg font-mono font-bold tabular-nums">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-emerald-100">Revenue Today</p>
                <p className="text-lg font-bold mt-0.5">${(stats?.totalRevenue ? Math.round(stats.totalRevenue / 30) : 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-emerald-100">Orders Today</p>
                <p className="text-lg font-bold mt-0.5">{stats?.totalOrders ? Math.round(stats.totalOrders / 30) : 0}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-emerald-100">New Customers</p>
                <p className="text-lg font-bold mt-0.5">{stats?.totalCustomers ? Math.round(stats.totalCustomers / 90) : 0}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-emerald-100">Pending Orders</p>
                <p className="text-lg font-bold mt-0.5">{stats?.pendingOrders || 0}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stat Cards with mesh gradient background */}
      <div className="relative rounded-2xl bg-mesh-gradient p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div key={card.title} variants={itemVariants}>
              <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow relative ${card.pulse ? 'ring-2 ring-emerald-400/30' : ''}`}>
                {/* Gradient border effect */}
                <div className={`absolute inset-0 rounded-lg pointer-events-none`} style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))`, opacity: 0.15 }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-20 rounded-lg`} />
                </div>
                <CardContent className="p-0 relative">
                  {/* Gradient top bar with shimmer effect */}
                  <div className={`h-1.5 bg-gradient-to-r ${card.gradient} relative overflow-hidden`}>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={card.value}
                            initial={{ opacity: 0.7, scale: card.pulse ? 1.05 : 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-2xl font-bold mt-1.5 tracking-tight"
                          >
                            {card.value}
                          </motion.p>
                        </AnimatePresence>
                        <div className="flex items-center mt-2 gap-1">
                          {card.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={`text-xs font-semibold ${card.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {card.change}
                          </span>
                          <span className="text-[11px] text-muted-foreground ml-0.5">vs last month</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <motion.div
                          className={`p-2.5 rounded-xl ${card.iconBg}`}
                          animate={card.pulse ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          <Icon className={`h-5 w-5 ${card.iconColor}`} />
                        </motion.div>
                        <MiniSparkline data={card.sparkData} color={card.sparkColor} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      </div>

      {/* Weather/Season Widget + Customer Acquisition Funnel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Weather/Season Widget */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm overflow-hidden h-full">
            <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60">
                    <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Summer Sale Season</h3>
                    <p className="text-[11px] text-muted-foreground">{daysRemainingInMonth} days left in month</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((30 - daysRemainingInMonth) / 30) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Great time to promote outdoor products!
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                onClick={() => navigateAdmin('flash-sales')}
              >
                <Zap className="h-3 w-3 mr-1" />
                Create Flash Sale
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Customer Acquisition Funnel */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600" />
                Customer Acquisition Funnel
              </CardTitle>
              <CardDescription>Conversion rates across customer journey stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnelData.map((stage, index) => {
                  const conversionRate = index > 0
                    ? ((stage.value / funnelData[index - 1].value) * 100).toFixed(1)
                    : null
                  return (
                    <div key={stage.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stage.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{stage.value.toLocaleString()}</span>
                          {conversionRate && (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                              {conversionRate}% from {funnelData[index - 1].label.toLowerCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: stage.width }}
                          transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
                          className={`h-8 rounded-lg bg-gradient-to-r ${stage.color} flex items-center justify-center shadow-sm`}
                          style={{ maxWidth: '100%' }}
                        >
                          <span className="text-xs font-medium text-white">
                            {((stage.value / funnelData[0].value) * 100).toFixed(1)}%
                          </span>
                        </motion.div>
                      </div>
                      {index < funnelData.length - 1 && (
                        <div className="flex justify-center">
                          <ArrowUpRight className="h-3 w-3 text-muted-foreground/40 rotate-90" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Insights Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Quick Insights
            </CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Revenue Trend', value: '+12.5%', sparkData: sparklineData.revenue, sparkColor: '#10b981', trend: 'up' },
                { label: 'Order Growth', value: '+8.2%', sparkData: sparklineData.orders, sparkColor: '#14b8a6', trend: 'up' },
                { label: 'Customer Growth', value: '+5.1%', sparkData: sparklineData.customers, sparkColor: '#f59e0b', trend: 'up' },
                { label: 'Stock Level', value: '-2.3%', sparkData: sparklineData.products, sparkColor: '#f43f5e', trend: 'down' },
              ].map((insight) => (
                <div key={insight.label} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{insight.label}</span>
                    <span className={`text-xs font-bold ${insight.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {insight.value}
                    </span>
                  </div>
                  <MiniSparkline data={insight.sparkData} color={insight.sparkColor} width={120} height={36} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickActions.map((action) => {
                  const ActionIcon = action.icon
                  return (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigateAdmin(action.page)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color} group`}
                    >
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ActionIcon className="h-5 w-5" />
                      </motion.div>
                      <span className="text-xs font-medium">{action.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Activity Feed */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-teal-600" />
                  Activity Feed
                  {activityItems.some(a => !a.read) && (
                    <Badge className="h-5 px-1.5 text-[10px] bg-emerald-500 text-white border-0 hover:bg-emerald-600">
                      {activityItems.filter(a => !a.read).length}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={markAllRead}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {activityItems.map((activity, index) => {
                  const ActivityIcon = activity.icon
                  const isNew = !activity.read
                  const dotColors: Record<ActivityType, string> = {
                    order: 'bg-emerald-500',
                    review: 'bg-amber-500',
                    customer: 'bg-sky-500',
                    inventory: 'bg-rose-500',
                  }
                  return (
                    <motion.div
                      key={activity.id}
                      initial={isNew ? { opacity: 0, x: -10 } : {}}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border-l-3 ${borderColors[activity.type]} ${isNew ? 'bg-muted/30' : ''} transition-colors hover:bg-muted/20`}
                    >
                      {/* Avatar with colored dot */}
                      <div className="relative shrink-0">
                        <div className={`h-8 w-8 rounded-full ${activity.avatarColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                          {activity.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${dotColors[activity.type]} border-2 border-background`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm truncate">{activity.message}</p>
                          {isNew && (
                            <Badge className="h-4 px-1 text-[9px] bg-emerald-500 text-white border-0 shrink-0">New</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{activity.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Overview + Top Categories Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Enhanced Revenue Overview with Period Selector + Chart Type Toggle */}
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Revenue Overview
              </CardTitle>
              <CardDescription className="mt-1">Revenue with previous period comparison</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Chart Type Toggle */}
              <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
                <Button
                  variant={chartType === 'area' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 text-xs px-2.5 ${chartType === 'area' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-muted-foreground'}`}
                  onClick={() => setChartType('area')}
                >
                  <LayoutList className="h-3 w-3 mr-1" />
                  Line
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 text-xs px-2.5 ${chartType === 'bar' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-muted-foreground'}`}
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Bar
                </Button>
              </div>
              {/* Period Selector */}
              <div className="flex items-center gap-0.5 bg-muted/50 rounded-full p-0.5">
                {(['7d', '30d', '90d', '1y'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={revenuePeriod === period ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-7 text-xs px-3 rounded-full ${
                      revenuePeriod === period
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => setRevenuePeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={revenuePeriods[revenuePeriod]}>
                    <defs>
                      <linearGradient id="revenueGradientEnhanced" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="prevRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis
                      yAxisId="revenue"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="orders"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="prevRevenue"
                      stroke="#94a3b8"
                      fill="url(#prevRevenueGradient)"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      name="Previous Period"
                    />
                    <Area
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      fill="url(#revenueGradientEnhanced)"
                      strokeWidth={2.5}
                      name="Current Period"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={revenuePeriods[revenuePeriod]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Legend />
                    <Bar dataKey="prevRevenue" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Previous Period" />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Current Period" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Categories Mini Chart */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-teal-600" />
              Top Categories
            </CardTitle>
            <CardDescription>Revenue by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Electronics', revenue: 12450, percent: 38, color: 'from-emerald-400 to-emerald-500' },
                { name: 'Clothing', revenue: 8320, percent: 25, color: 'from-teal-400 to-teal-500' },
                { name: 'Home & Garden', revenue: 5640, percent: 17, color: 'from-cyan-400 to-cyan-500' },
                { name: 'Sports', revenue: 3890, percent: 12, color: 'from-amber-400 to-amber-500' },
                { name: 'Books', revenue: 2450, percent: 8, color: 'from-rose-400 to-rose-500' },
              ].map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">${category.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percent}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">{category.percent}% of total</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>

      {/* Recent Activity Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                Recent Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {activityItems.slice(0, 5).map((activity, index) => {
                const dotColors: Record<ActivityType, string> = {
                  order: 'bg-emerald-500',
                  review: 'bg-amber-500',
                  customer: 'bg-sky-500',
                  inventory: 'bg-rose-500',
                }
                const typeBg: Record<ActivityType, string> = {
                  order: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40',
                  review: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40',
                  customer: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/40',
                  inventory: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40',
                }
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className={`p-3 rounded-xl border ${typeBg[activity.type]} transition-all hover:shadow-sm`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative">
                        <div className={`h-8 w-8 rounded-full ${activity.avatarColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                          {activity.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${dotColors[activity.type]} border-2 border-background`} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{activity.time}</span>
                      {!activity.read && (
                        <Badge className="h-3.5 px-1 text-[8px] bg-emerald-500 text-white border-0 ml-auto">New</Badge>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2">{activity.message}</p>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Low Stock Alerts */}
      <LowStockAlerts navigateAdmin={navigateAdmin} />

      {/* Performance Metrics */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric) => {
                const MetricIcon = metric.icon
                return (
                  <motion.div
                    key={metric.label}
                    className="flex flex-col items-center text-center gap-2"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <CircularProgress value={metric.value} target={metric.target} color={metric.color} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {metric.suffix === '$' ? '$' : ''}{metric.value}{metric.suffix !== '$' ? metric.suffix : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MetricIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Monthly Revenue</CardTitle>
              <CardDescription>Revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                      <linearGradient id="revenueFillGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="url(#lineGradient)"
                      fill="url(#revenueFillGradient)"
                      strokeWidth={2.5}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="url(#lineGradient)"
                      strokeWidth={2.5}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Orders by Status</CardTitle>
              <CardDescription>Distribution of order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {orderStatusData.map((entry, index) => (
                        <Bar key={index} dataKey="count" fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Top Products + Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders</CardDescription>
              </div>
              <button
                onClick={() => navigateAdmin('orders')}
                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                View All <ArrowUpRight className="h-3 w-3" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto"><Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recentOrders?.map((order) => {
                    const statusStyle = statusColors[order.status] || statusColors.pending
                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer"
                        onClick={() => navigateAdmin('order-detail', { id: order.id })}
                      >
                        <TableCell className="font-medium text-sm">
                          #{order.orderNumber}
                        </TableCell>
                        <TableCell className="text-sm">
                          {order.customer?.user?.name || 'Guest'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${statusStyle.bg} ${statusStyle.text} border-0 gap-1.5 font-medium`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          ${order.totalAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No recent orders
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table></div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Top Products List */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Top Products</CardTitle>
                <CardDescription>Best selling products with trend</CardDescription>
              </div>
              <button
                onClick={() => navigateAdmin('products')}
                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                View All <ArrowUpRight className="h-3 w-3" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.topProducts?.map((product, index) => {
                  const trendData = productTrendData[index] || productTrendData[0]
                  const trendChange = trendData[trendData.length - 1] - trendData[0]
                  const trendUp = trendChange >= 0
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigateAdmin('edit-product', { id: product.id })}
                    >
                      <span className="text-xs font-bold text-muted-foreground/50 w-5 text-center">
                        {index + 1}
                      </span>
                      {/* Product thumbnail */}
                      <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{product.totalSold} sold</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs font-semibold">${(product.sellingPrice * product.totalSold).toLocaleString()}</span>
                        </div>
                      </div>
                      {/* Mini sparkline for 7-day trend */}
                      <div className="shrink-0 hidden sm:block">
                        <MiniSparkline data={trendData} color={trendUp ? '#10b981' : '#ef4444'} width={60} height={24} />
                      </div>
                      {/* Percentage change indicator */}
                      <div className={`flex items-center gap-0.5 shrink-0 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trendUp ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span className="text-xs font-semibold">{Math.abs(trendChange)}%</span>
                      </div>
                      {/* View Details link */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigateAdmin('edit-product', { id: product.id })
                        }}
                      >
                        Details
                        <ArrowUpRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </motion.div>
                  )
                })}
                {(!stats?.topProducts || stats.topProducts.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    No top products
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products by Revenue Chart */}
      {topProductsRevenueData.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Top Products by Revenue</CardTitle>
              <CardDescription>Revenue contribution from top products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsRevenueData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                      {topProductsRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
