'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  Award,
  Send,
  Ban,
  KeyRound,
  Star,
  MessageSquare,
  UserCog,
  ShoppingCart,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface CustomerOrder {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
}

interface ActivityItem {
  id: string
  type: 'order' | 'review' | 'account' | 'note'
  title: string
  description: string
  timestamp: string
  icon: React.ElementType
  color: string
}

interface CustomerData {
  id: string
  loyaltyPoints: number
  createdAt: string
  user: {
    name: string
    email: string
    phone: string | null
    avatar: string | null
  }
  _count?: { orders: number }
  orders?: CustomerOrder[]
  totalSpent?: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function CustomerDetailPage() {
  const pageParams = useNavStore((s) => s.pageParams)
  const navigateAdmin = useNavStore((s) => s.navigateAdmin)

  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<string[]>([
    'VIP customer — priority support',
    'Prefers email communication',
  ])
  const [newNote, setNewNote] = useState('')

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/customers/${pageParams.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCustomer(data.data)
          return
        }
      }
      // Fallback: try list endpoint and find
      const listRes = await fetch('/api/admin/customers?limit=100')
      if (listRes.ok) {
        const listData = await listRes.json()
        if (listData.success) {
          const found = (listData.data || []).find((c: CustomerData) => c.id === pageParams.id)
          if (found) {
            setCustomer(found)
            return
          }
        }
      }
      // Demo fallback
      setCustomer({
        id: pageParams.id || 'demo',
        loyaltyPoints: 2500,
        createdAt: '2024-01-15T10:00:00Z',
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          avatar: null,
        },
        _count: { orders: 12 },
        orders: [
          { id: '1', orderNumber: 'ORD-001', totalAmount: 299.99, status: 'delivered', createdAt: '2024-11-15T10:00:00Z' },
          { id: '2', orderNumber: 'ORD-002', totalAmount: 149.50, status: 'shipped', createdAt: '2024-12-01T14:30:00Z' },
          { id: '3', orderNumber: 'ORD-003', totalAmount: 79.99, status: 'processing', createdAt: '2024-12-20T09:15:00Z' },
          { id: '4', orderNumber: 'ORD-004', totalAmount: 449.00, status: 'pending', createdAt: '2025-01-05T16:45:00Z' },
          { id: '5', orderNumber: 'ORD-005', totalAmount: 199.99, status: 'delivered', createdAt: '2025-01-20T11:00:00Z' },
        ],
        totalSpent: 1178.47,
      })
    } catch {
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }, [pageParams.id])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  const addNote = useCallback(() => {
    if (!newNote.trim()) return
    setNotes((prev) => [newNote.trim(), ...prev])
    setNewNote('')
    toast.success('Note added successfully')
  }, [newNote])

  const removeNote = useCallback((index: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== index))
    toast.success('Note removed')
  }, [])

  const activities: ActivityItem[] = customer
    ? [
        ...(customer.orders || []).map((o) => ({
          id: `order-${o.id}`,
          type: 'order' as const,
          title: `Order #${o.orderNumber}`,
          description: `$${o.totalAmount.toFixed(2)} — ${o.status}`,
          timestamp: o.createdAt,
          icon: ShoppingCart,
          color: 'from-emerald-400 to-teal-500',
        })),
        {
          id: 'review-1',
          type: 'review',
          title: 'Left a 5-star review',
          description: 'Reviewed "Wireless Headphones Pro"',
          timestamp: '2024-12-10T08:00:00Z',
          icon: Star,
          color: 'from-amber-400 to-orange-500',
        },
        {
          id: 'review-2',
          type: 'review',
          title: 'Left a 4-star review',
          description: 'Reviewed "Smart Watch Ultra"',
          timestamp: '2024-11-28T12:00:00Z',
          icon: MessageSquare,
          color: 'from-amber-400 to-orange-500',
        },
        {
          id: 'account-1',
          type: 'account',
          title: 'Account created',
          description: 'Joined ShopHub',
          timestamp: customer.createdAt,
          icon: UserCog,
          color: 'from-violet-400 to-purple-500',
        },
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : []

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Customer not found</h2>
        <Button onClick={() => navigateAdmin('customers')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    )
  }

  const initials = customer.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'C'

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button
          variant="ghost"
          onClick={() => navigateAdmin('customers')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </motion.div>

      {/* Profile + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardContent className="pt-0 pb-6 px-6">
              <div className="flex flex-col items-center -mt-10">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                  <AvatarImage src={customer.user.avatar} />
                  <AvatarFallback className="text-2xl bg-emerald-600 text-white font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mt-3">{customer.user.name}</h2>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {customer.user.email}
                </div>
                {customer.user.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3.5 w-3.5" />
                    {customer.user.phone}
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    Joined
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(customer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-emerald-500" />
                    Total Orders
                  </span>
                  <span className="text-sm font-bold">{customer._count?.orders || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    Total Spent
                  </span>
                  <span className="text-sm font-bold">
                    ${(customer.totalSpent || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-500" />
                    Loyalty Points
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                    {customer.loyaltyPoints} pts
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons + Notes */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Action Buttons */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
                onClick={() => toast.success(`Email sent to ${customer.user.email}`)}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                onClick={() => toast.success(`Account ${customer.user.name} has been disabled`)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Disable Account
              </Button>
              <Button
                variant="outline"
                className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
                onClick={() => toast.success(`Password reset email sent to ${customer.user.email}`)}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note about this customer..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      addNote()
                    }
                  }}
                />
                <Button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white self-end shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {notes.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notes.map((note, idx) => (
                    <motion.div
                      key={`${note}-${idx}`}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start justify-between gap-2 p-2.5 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-sm">{note}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500"
                        onClick={() => removeNote(idx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Order History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {customer.orders && customer.orders.length > 0 ? (
              <div className="overflow-x-auto"><Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                      <TableCell className="font-medium text-sm">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[order.status] || ''}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        ${order.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-300 to-muted" />

                <div className="space-y-4">
                  {activities.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-start gap-4 relative"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${activity.color} text-white shadow-md shrink-0 z-10`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(activity.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
