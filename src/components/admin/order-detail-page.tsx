'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Package,
  Printer,
  CheckCircle2,
  Circle,
  Truck,
  Clock,
  DollarSign,
  Shield,
  Smartphone,
  Banknote,
  Mail,
  Phone,
  Calendar,
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

interface Order {
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
  createdAt: string
  customer: {
    user: { name: string; email: string; phone: string; avatar: string | null }
    addresses: Array<{
      id: string
      label: string
      address1: string
      city: string
      state: string
      zipCode: string
      country: string
    }>
  } | null
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

const statusOrder = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered']

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

export function OrderDetailPage() {
  const { navigateAdmin, pageParams } = useNavStore()
  const orderId = pageParams?.id || ''
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [confirmDialog, setConfirmDialog] = useState(false)

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

  const handleStatusUpdate = useCallback(async () => {
    if (!order || !newStatus) return
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Order status updated')
        setConfirmDialog(false)
        fetchOrder()
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }, [order, newStatus, fetchOrder])

  const handlePrintInvoice = useCallback(() => {
    window.print()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigateAdmin('orders')}>
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

  const currentStatusIdx = statusOrder.indexOf(order.status)

  return (
    <>
      {/* Print-only Invoice */}
      <div className="print-invoice hidden print:block">
        <div className="max-w-[800px] mx-auto p-8 font-sans text-black">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-8 w-8 text-emerald-600" />
                <span className="text-2xl font-bold text-emerald-700">ShopHub</span>
              </div>
              <p className="text-xs text-gray-500">123 Commerce Street, Business City, BC 12345</p>
              <p className="text-xs text-gray-500">support@shophub.com | +1 (555) 123-4567</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-sm text-gray-600 mt-1">#{order.orderNumber}</p>
              <p className="text-xs text-gray-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 capitalize">
                {order.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Bill To */}
            <div className="border rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
              <p className="font-semibold">{order.customer?.user.name || 'Guest'}</p>
              <p className="text-sm text-gray-600">{order.customer?.user.email || ''}</p>
              {order.customer?.user.phone && (
                <p className="text-sm text-gray-600">{order.customer.user.phone}</p>
              )}
            </div>
            {/* Ship To */}
            <div className="border rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ship To</h3>
              {shippingAddr ? (
                <>
                  <p className="font-semibold">{shippingAddr.firstName} {shippingAddr.lastName}</p>
                  <p className="text-sm text-gray-600">{shippingAddr.address1}</p>
                  <p className="text-sm text-gray-600">{shippingAddr.city}, {shippingAddr.state} {shippingAddr.zipCode}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No shipping address</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border text-left px-3 py-2 text-xs font-semibold text-gray-600">Item</th>
                <th className="border text-left px-3 py-2 text-xs font-semibold text-gray-600">SKU</th>
                <th className="border text-right px-3 py-2 text-xs font-semibold text-gray-600">Price</th>
                <th className="border text-center px-3 py-2 text-xs font-semibold text-gray-600">Qty</th>
                <th className="border text-right px-3 py-2 text-xs font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="border px-3 py-2 text-sm">{item.productName}{item.variantName ? ` (${item.variantName})` : ''}</td>
                  <td className="border px-3 py-2 text-sm text-gray-500">{item.sku}</td>
                  <td className="border px-3 py-2 text-sm text-right">${item.price.toFixed(2)}</td>
                  <td className="border px-3 py-2 text-sm text-center">{item.quantity}</td>
                  <td className="border px-3 py-2 text-sm text-right font-medium">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount {order.coupon ? `(${order.coupon.code})` : ''}</span>
                  <span className="text-emerald-600">-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${order.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-1 mt-1">
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-t pt-4 mb-8">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Payment Method:</span> {getPaymentLabel(order.paymentMethod)}
            </p>
          </div>

          {/* Thank you */}
          <div className="text-center border-t pt-6">
            <p className="text-lg font-semibold text-emerald-700">Thank you for your business!</p>
            <p className="text-xs text-gray-500 mt-1">If you have questions about this invoice, please contact support@shophub.com</p>
          </div>
        </div>
      </div>

      {/* Screen content (hidden when printing) */}
      <div className="space-y-6 print:hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigateAdmin('orders')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className={`${statusColors[order.status] || ''} text-sm px-3 py-1 capitalize flex items-center gap-1.5`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusDotColors[order.status] || 'bg-gray-400'}`} />
              {order.status}
            </Badge>
            <Select value={newStatus} onValueChange={(v) => { setNewStatus(v); setConfirmDialog(true) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                {['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print Invoice</span>
            </Button>
          </div>
        </motion.div>

        {/* Status Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 overflow-x-auto">
              <div className="flex items-center min-w-[500px]">
                {statusOrder.map((status, index) => {
                  const isCompleted = index <= currentStatusIdx && currentStatusIdx >= 0
                  const isCurrent = index === currentStatusIdx
                  const isLast = index === statusOrder.length - 1
                  return (
                    <div key={status} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                            isCurrent
                              ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                              : isCompleted
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
                                : 'border-gray-200 bg-muted/30 text-gray-400 dark:border-gray-700'
                          }`}
                        >
                          {statusIcons[status] || <Circle className="h-3.5 w-3.5" />}
                        </div>
                        <span
                          className={`text-[10px] mt-1.5 font-medium capitalize whitespace-nowrap ${
                            isCurrent ? 'text-emerald-600' : isCompleted ? 'text-emerald-500' : 'text-gray-400'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      {!isLast && (
                        <div className="flex-1 mx-1 -mt-5">
                          <div className="h-0.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <motion.div
                              className="h-full bg-emerald-500 rounded-full"
                              initial={{ width: '0%' }}
                              animate={{ width: isCompleted ? '100%' : '0%' }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-600" /> Order Items
                    <Badge variant="secondary" className="ml-auto text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto"><Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded bg-muted/50 overflow-hidden shrink-0">
                                {item.product?.thumbnail ? (
                                  <img src={item.product.thumbnail} alt={item.productName} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.productName}</p>
                                {item.variantName && (
                                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono text-xs">{item.sku}</TableCell>
                          <TableCell className="text-sm">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium text-sm">${item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table></div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>${order.shippingCost.toFixed(2)}</span>
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
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-emerald-600">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" /> Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No timeline entries</p>
                  ) : (
                    <div className="relative">
                      {order.timeline.map((entry, index) => {
                        const isLatest = index === 0
                        const dotColor = statusDotColors[entry.status] || 'bg-gray-400'
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex gap-4 relative"
                          >
                            {/* Vertical line */}
                            {index < order.timeline.length - 1 && (
                              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                            )}
                            {/* Dot */}
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                              isLatest
                                ? `${dotColor} text-white shadow-lg`
                                : 'bg-muted/50 text-muted-foreground'
                            }`}>
                              {isLatest ? (
                                statusIcons[entry.status] || <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </div>
                            {/* Content */}
                            <div className="pb-6">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-medium capitalize">{entry.status}</span>
                                <Badge
                                  variant="secondary"
                                  className={`${statusColors[entry.status] || ''} text-[10px] px-1.5 py-0 border-0`}
                                >
                                  {entry.status}
                                </Badge>
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
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Customer Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" /> Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order.customer ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm shrink-0">
                          {order.customer.user.avatar ? (
                            <img src={order.customer.user.avatar} alt={order.customer.user.name} className="h-full w-full rounded-full object-cover" />
                          ) : (
                            order.customer.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{order.customer.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{order.customer.user.email}</p>
                        </div>
                      </div>
                      {order.customer.user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{order.customer.user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{order.customer.user.email}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Guest order</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
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
                  ) : order.customer?.addresses?.[0] ? (
                    <div className="text-sm space-y-1">
                      <p>{order.customer.addresses[0].address1}</p>
                      <p className="text-muted-foreground">
                        {order.customer.addresses[0].city}, {order.customer.addresses[0].state} {order.customer.addresses[0].zipCode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No address</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader>
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
                    {order.payments.length > 0 && order.payments[0].transactionId && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-mono text-xs">{order.payments[0].transactionId}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold text-emerald-600">${order.totalAmount.toFixed(2)}</span>
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
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" /> Notes
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

      {/* Status Update Confirmation */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Order Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status from &quot;{order.status}&quot; to &quot;{newStatus}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewStatus('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusUpdate} className="bg-emerald-600 hover:bg-emerald-700">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
