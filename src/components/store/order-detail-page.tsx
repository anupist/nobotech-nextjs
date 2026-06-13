'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useCartStore } from '@/stores/cart-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  Circle,
  ShoppingCart,
  FileDown,
  RotateCcw,
  Smartphone,
  Banknote,
  Mail,
  Phone,
  Calendar,
  Navigation,
} from 'lucide-react'

interface OrderItem {
  id: string
  productName: string
  variantName: string | null
  sku: string
  price: number
  quantity: number
  total: number
  product: { id: string; name: string; thumbnail: string | null } | null
  variant: { id: string; name: string; thumbnail: string | null } | null
}

interface TimelineEntry {
  id: string
  status: string
  note: string | null
  createdAt: string
}

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  subtotal: number
  shippingCost: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  notes: string | null
  shippingAddress: string | null
  shippingMethod: string | null
  createdAt: string
  items: OrderItem[]
  payments: Array<{ id: string; method: string; amount: number; status: string; transactionId: string | null }>
  timeline: TimelineEntry[]
  coupon: { code: string; type: string; value: number } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  processing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  packed: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  refunded: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
}

const statusDotColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-sky-500',
  processing: 'bg-amber-500',
  packed: 'bg-violet-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
  returned: 'bg-orange-500',
  refunded: 'bg-pink-500',
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  confirmed: <CheckCircle2 className="h-3.5 w-3.5" />,
  processing: <Package className="h-3.5 w-3.5" />,
  shipped: <Truck className="h-3.5 w-3.5" />,
  delivered: <CheckCircle2 className="h-3.5 w-3.5" />,
  cancelled: <Circle className="h-3.5 w-3.5" />,
}

function getPaymentIcon(method: string | null) {
  switch (method) {
    case 'cod':
      return <Banknote className="h-5 w-5 text-emerald-600" />
    case 'stripe':
      return <CreditCard className="h-5 w-5 text-violet-600" />
    case 'bkash':
    case 'nagad':
      return <Smartphone className="h-5 w-5 text-pink-600" />
    default:
      return <CreditCard className="h-5 w-5 text-muted-foreground" />
  }
}

function getPaymentLabel(method: string | null) {
  switch (method) {
    case 'cod': return 'Cash on Delivery'
    case 'stripe': return 'Stripe / Credit Card'
    case 'bkash': return 'bKash'
    case 'nagad': return 'Nagad'
    default: return method || 'N/A'
  }
}

export function CustomerOrderDetailPage() {
  const { navigateStore, pageParams } = useNavStore()
  const orderId = pageParams?.id || ''
  const addItem = useCartStore((s) => s.addItem)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.data)
      } else {
        toast.error('Order not found')
      }
    } catch {
      toast.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleReorder = useCallback(() => {
    if (!order) return
    for (const item of order.items) {
      addItem({
        productId: item.product?.id || '',
        productName: item.productName,
        productSlug: '',
        thumbnail: item.product?.thumbnail || '',
        sku: item.sku,
        price: item.price,
        quantity: 1,
        stock: 999,
      })
    }
    toast.success(`${order.items.length} item(s) added to cart`)
    navigateStore('cart')
  }, [order, addItem, navigateStore])

  const handleTrackOrder = useCallback(() => {
    if (!order) return
    navigateStore('order-tracking', { id: order.id })
  }, [order, navigateStore])

  const handleDownloadInvoice = useCallback(() => {
    toast.info('Invoice download will be available soon')
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center max-w-4xl">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-lg font-semibold mb-2">Order not found</h2>
        <p className="text-sm text-muted-foreground mb-4">The order you are looking for does not exist.</p>
        <Button variant="outline" onClick={() => navigateStore('account-orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    )
  }

  let shippingAddr: Record<string, string> | null = null
  if (order.shippingAddress) {
    try {
      shippingAddr = JSON.parse(order.shippingAddress)
    } catch {
      shippingAddr = null
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigateStore('account-orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`${statusColors[order.status] || ''} text-sm px-3 py-1 capitalize flex items-center gap-1.5 w-fit`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusDotColors[order.status] || 'bg-gray-400'}`} />
          {order.status}
        </Badge>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          onClick={handleReorder}
        >
          <RotateCcw className="h-4 w-4" />
          Reorder
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleTrackOrder}
        >
          <Navigation className="h-4 w-4" />
          Track Order
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleDownloadInvoice}
        >
          <FileDown className="h-4 w-4" />
          Download Invoice
        </Button>
      </motion.div>

      {/* Simplified Timeline */}
      {order.timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" /> Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {order.timeline.slice(0, 4).map((entry, index) => {
                  const isLatest = index === 0
                  const dotColor = statusDotColors[entry.status] || 'bg-gray-400'
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 relative"
                    >
                      {index < Math.min(order.timeline.length, 4) - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                      )}
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isLatest
                          ? `${dotColor} text-white shadow-md`
                          : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {isLatest ? (
                          statusIcons[entry.status] || <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Circle className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">{entry.status}</span>
                        </div>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground">{entry.note}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" /> Items
                  <Badge variant="secondary" className="ml-auto text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg bg-muted/50 overflow-hidden shrink-0">
                      {item.product?.thumbnail ? (
                        <img
                          src={item.product.thumbnail}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">${item.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Totals */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shippingCost === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `$${order.shippingCost.toFixed(2)}`}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount {order.coupon ? `(${order.coupon.code})` : ''}</span>
                      <span className="text-emerald-600">-${order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${order.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg pt-1">
                    <span>Total</span>
                    <span className="text-emerald-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {shippingAddr ? (
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{shippingAddr.firstName} {shippingAddr.lastName}</p>
                    <p className="text-muted-foreground">{shippingAddr.address1}</p>
                    <p className="text-muted-foreground">{shippingAddr.city}, {shippingAddr.state} {shippingAddr.zipCode}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No shipping address</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" /> Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      {getPaymentIcon(order.paymentMethod)}
                    </div>
                    <div>
                      <p className="font-medium">{getPaymentLabel(order.paymentMethod)}</p>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[order.paymentStatus] || ''} text-[10px] px-1.5 py-0 border-0 mt-0.5`}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes */}
          {order.notes && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-600" /> Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
