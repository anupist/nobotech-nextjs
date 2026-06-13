'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  minPurchase: number
  maxDiscount: number | null
  usageLimit: number | null
  usedCount: number
  startsAt: string
  expiresAt: string
  isActive: boolean
}

export function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const [formCode, setFormCode] = useState('')
  const [formType, setFormType] = useState('percentage')
  const [formValue, setFormValue] = useState('')
  const [formMinPurchase, setFormMinPurchase] = useState('0')
  const [formMaxDiscount, setFormMaxDiscount] = useState('')
  const [formUsageLimit, setFormUsageLimit] = useState('')
  const [formStartsAt, setFormStartsAt] = useState('')
  const [formExpiresAt, setFormExpiresAt] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (data.success) {
        setCoupons(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const openCreateDialog = useCallback(() => {
    setEditingCoupon(null)
    setFormCode('')
    setFormType('percentage')
    setFormValue('')
    setFormMinPurchase('0')
    setFormMaxDiscount('')
    setFormUsageLimit('')
    setFormStartsAt(new Date().toISOString().slice(0, 16))
    setFormExpiresAt(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16))
    setFormIsActive(true)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormCode(coupon.code)
    setFormType(coupon.type)
    setFormValue(String(coupon.value))
    setFormMinPurchase(String(coupon.minPurchase))
    setFormMaxDiscount(coupon.maxDiscount ? String(coupon.maxDiscount) : '')
    setFormUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : '')
    setFormStartsAt(new Date(coupon.startsAt).toISOString().slice(0, 16))
    setFormExpiresAt(new Date(coupon.expiresAt).toISOString().slice(0, 16))
    setFormIsActive(coupon.isActive)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formCode || !formValue || !formStartsAt || !formExpiresAt) {
      toast.error('Code, value, start and end dates are required')
      return
    }

    try {
      const payload = {
        ...(editingCoupon ? { id: editingCoupon.id } : {}),
        code: formCode.toUpperCase(),
        type: formType,
        value: parseFloat(formValue),
        minPurchase: parseFloat(formMinPurchase) || 0,
        maxDiscount: formMaxDiscount ? parseFloat(formMaxDiscount) : null,
        usageLimit: formUsageLimit ? parseInt(formUsageLimit) : null,
        startsAt: formStartsAt,
        expiresAt: formExpiresAt,
        isActive: formIsActive,
      }

      const res = await fetch('/api/admin/coupons', {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created')
        setDialogOpen(false)
        fetchCoupons()
      } else {
        toast.error(data.error || 'Failed to save coupon')
      }
    } catch {
      toast.error('Failed to save coupon')
    }
  }, [editingCoupon, formCode, formType, formValue, formMinPurchase, formMaxDiscount, formUsageLimit, formStartsAt, formExpiresAt, formIsActive, fetchCoupons])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/coupons?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Coupon deleted')
        fetchCoupons()
      } else {
        toast.error(data.error || 'Failed to delete coupon')
      }
    } catch {
      toast.error('Failed to delete coupon')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchCoupons])

  const toggleActive = useCallback(async (coupon: Coupon) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(coupon.isActive ? 'Coupon disabled' : 'Coupon enabled')
        fetchCoupons()
      }
    } catch {
      toast.error('Failed to toggle coupon')
    }
  }, [fetchCoupons])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground">Manage discount coupons</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="hidden sm:table-cell">Min Purchase</TableHead>
                  <TableHead className="hidden md:table-cell">Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No coupons found
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-medium">{coupon.code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{coupon.type}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        ${coupon.minPurchase.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {coupon.usedCount}/{coupon.usageLimit || '∞'}
                      </TableCell>
                      <TableCell>
                        <button onClick={() => toggleActive(coupon)}>
                          <Badge variant="secondary" className={`cursor-pointer ${coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(coupon)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(coupon.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table></div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} placeholder="SAVE10" />
              </div>
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Value *</Label>
                <Input type="number" step="0.01" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Min Purchase</Label>
                <Input type="number" step="0.01" value={formMinPurchase} onChange={(e) => setFormMinPurchase(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Discount</Label>
                <Input type="number" step="0.01" value={formMaxDiscount} onChange={(e) => setFormMaxDiscount(e.target.value)} placeholder="No limit" />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input type="number" value={formUsageLimit} onChange={(e) => setFormUsageLimit(e.target.value)} placeholder="No limit" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starts At *</Label>
                <Input type="datetime-local" value={formStartsAt} onChange={(e) => setFormStartsAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expires At *</Label>
                <Input type="datetime-local" value={formExpiresAt} onChange={(e) => setFormExpiresAt(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingCoupon ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this coupon?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
