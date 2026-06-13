'use client'

import { useState, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { formatPrice } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  ShoppingCart,
  CheckCircle,
  Settings,
  Package,
  Truck,
  MapPin,
  XCircle,
  Clock,
  Mail,
  CreditCard,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

interface OrderItem {
  id: string
  productName: string
  variantName?: string | null
  sku: string
  price: number
  quantity: number
  total: number
  product?: { id: string; name: string; thumbnail?: string | null }
}

interface TimelineEntry {
  id: string
  status: string
  note?: string | null
  createdAt: string
}

interface OrderData {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paymentMethod?: string | null
  paymentStatus: string
  shippingAddress?: string | null
  billingAddress?: string | null
  shippingMethod?: string | null
  createdAt: string
  items: OrderItem[]
  timeline: TimelineEntry[]
  customer?: {
    user: { name: string; email: string; phone?: string }
  }
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: ShoppingCart },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Settings },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
]

const statusOrder = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered']

function getStepIndex(status: string): number {
  const idx = statusOrder.indexOf(status)
  return idx >= 0 ? idx : -1
}

export function OrderTrackingPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim() || !email.trim()) {
      toast.error('Please enter both order number and email')
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(orderNumber.trim())}&limit=5`)
      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        // Try to find order by orderNumber
        let foundOrder = data.data.find((o: OrderData) =>
          o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase()
        )
        // If not found by orderNumber, try by id
        if (!foundOrder) {
          foundOrder = data.data.find((o: OrderData) => o.id === orderNumber.trim())
        }
        if (foundOrder) {
          // Fetch full order details
          const detailRes = await fetch(`/api/orders/${foundOrder.id}`)
          const detailData = await detailRes.json()
          if (detailData.success) {
            setOrder(detailData.data)
          } else {
            setOrder(null)
            toast.error('Order not found')
          }
        } else {
          setOrder(null)
          toast.error('No order found with that number')
        }
      } else {
        setOrder(null)
        toast.error('No order found with that number')
      }
    } catch {
      setOrder(null)
      toast.error('Failed to search for order')
    } finally {
      setLoading(false)
    }
  }, [orderNumber, email])

  const currentStepIdx = order ? getStepIndex(order.status) : -1
  const isCancelled = order?.status === 'cancelled'

  // Estimated delivery date
  const estimatedDelivery = (() => {
    if (!order) return ''
    const date = new Date(order.createdAt)
    if (order.shippingMethod === 'express') {
      date.setDate(date.getDate() + 3)
    } else {
      date.setDate(date.getDate() + 7)
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  })()

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <BreadcrumbNav />

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/20 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <MapPin className="h-8 w-8" />
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">
          Enter your order number and email to see the latest status
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8 shadow-md border-emerald-100">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <ShoppingCart className="h-4 w-4 text-emerald-600" />
                  Order Number
                </label>
                <Input
                  placeholder="e.g. ORD-20240101-XXXX"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Track Order
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* No order found */}
      <AnimatePresence>
        {searched && !order && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center p-8 border-dashed">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                We couldn&apos;t find an order with that number. Please check and try again.
              </p>
              <Button variant="outline" onClick={() => { setSearched(false); setOrderNumber(''); setEmail('') }}>
                Try Again
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Details */}
      <AnimatePresence>
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Order Info Card */}
            <Card className="shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm text-white/70">Order Number</p>
                    <p className="text-xl font-bold">{order.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${isCancelled ? 'bg-red-500/90 text-white' : 'bg-white/20 text-white'} border-0 text-sm px-3 py-1`}>
                      {isCancelled ? (
                        <><XCircle className="h-4 w-4 mr-1" /> Cancelled</>
                      ) : (
                        <><CheckCircle className="h-4 w-4 mr-1" /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</>
                      )}
                    </Badge>
                    <span className="text-sm text-white/80 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                    <p className="font-semibold text-emerald-600">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                    <p className="text-sm font-medium capitalize flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                      {order.paymentMethod || 'COD'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                    <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Est. Delivery</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5 text-emerald-600" />
                      {isCancelled ? 'N/A' : estimatedDelivery}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Order Timeline
                </h2>
                <div className="relative">
                  {isCancelled ? (
                    <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <XCircle className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-700">Order Cancelled</p>
                        <p className="text-sm text-red-600">This order has been cancelled.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx < currentStepIdx
                        const isCurrent = idx === currentStepIdx
                        const isFuture = idx > currentStepIdx
                        const timelineEntry = order.timeline?.find((t) => t.status === step.key)
                        const IconComponent = step.icon

                        return (
                          <div key={step.key} className="flex gap-4 relative">
                            {/* Vertical line */}
                            {idx < statusSteps.length - 1 && (
                              <div
                                className={`absolute left-[19px] top-10 w-0.5 h-[calc(100%-16px)] ${
                                  isCompleted ? 'bg-emerald-300' : 'bg-muted'
                                }`}
                              />
                            )}

                            {/* Icon circle */}
                            <div className="relative z-10 shrink-0">
                              <motion.div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                    : isCurrent
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.1, duration: 0.3 }}
                              >
                                {isCompleted ? (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: idx * 0.1 + 0.2, type: 'spring', stiffness: 300 }}
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </motion.div>
                                ) : (
                                  <IconComponent className="h-5 w-5" />
                                )}
                              </motion.div>
                              {/* Pulsing animation for current step */}
                              {isCurrent && (
                                <motion.div
                                  className="absolute inset-0 rounded-full border-2 border-emerald-400"
                                  animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.6, 0, 0.6],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  }}
                                />
                              )}
                            </div>

                            {/* Step content */}
                            <div className={`pb-8 flex-1 min-w-0 ${isFuture ? 'opacity-50' : ''}`}>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <p className={`font-medium ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {step.label}
                                </p>
                                {timelineEntry && (
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(timelineEntry.createdAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>
                              {timelineEntry?.note && (
                                <p className="text-sm text-muted-foreground mt-0.5">{timelineEntry.note}</p>
                              )}
                              {isCurrent && !timelineEntry?.note && (
                                <p className="text-sm text-emerald-600 mt-0.5">Current status</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-md">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  Order Items ({order.items.length})
                </h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="h-16 w-16 rounded-lg bg-muted/30 overflow-hidden shrink-0">
                        <img
                          src={item.product?.thumbnail || `https://picsum.photos/seed/${item.sku}/100/100`}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm text-emerald-600">{formatPrice(item.total)}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2 text-sm max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-emerald-600">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    Shipping Address
                  </h2>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {typeof order.shippingAddress === 'string'
                      ? (() => {
                          try {
                            const addr = JSON.parse(order.shippingAddress) as Record<string, string>
                            return [
                              `${addr.firstName || ''} ${addr.lastName || ''}`.trim(),
                              addr.address1,
                              addr.address2,
                              `${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim(),
                              addr.phone,
                            ].filter(Boolean).join('\n')
                          } catch {
                            return order.shippingAddress
                          }
                        })()
                      : String(order.shippingAddress)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="outline"
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                onClick={() => navigateStore('home')}
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Continue Shopping
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                onClick={() => { setSearched(false); setOrder(null); setOrderNumber(''); setEmail('') }}
              >
                <Search className="h-4 w-4 mr-2" />
                Track Another Order
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
