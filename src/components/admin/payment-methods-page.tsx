'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { MediaPickerButton } from '@/components/shared/media-picker-button'
import Image from 'next/image'

interface PaymentMethod {
  id: string
  name: string
  image: string
  isActive: boolean
  sortOrder: number
}

export function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<PaymentMethod | null>(null)

  const [formName, setFormName] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formSortOrder, setFormSortOrder] = useState('0')

  const fetchMethods = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/payment-methods')
      const data = await res.json()
      if (data.success) {
        setMethods(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMethods()
  }, [fetchMethods])

  const openCreateDialog = useCallback(() => {
    setEditing(null)
    setFormName('')
    setFormImage('')
    setFormIsActive(true)
    setFormSortOrder('0')
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((method: PaymentMethod) => {
    setEditing(method)
    setFormName(method.name)
    setFormImage(method.image)
    setFormIsActive(method.isActive)
    setFormSortOrder(String(method.sortOrder))
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formName || !formImage) {
      toast.error('Name and image are required')
      return
    }

    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        name: formName,
        image: formImage,
        isActive: formIsActive,
        sortOrder: parseInt(formSortOrder) || 0,
      }

      const res = await fetch('/api/admin/payment-methods', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editing ? 'Payment method updated' : 'Payment method created')
        setDialogOpen(false)
        fetchMethods()
      } else {
        toast.error(data.error || 'Failed to save payment method')
      }
    } catch {
      toast.error('Failed to save payment method')
    }
  }, [editing, formName, formImage, formIsActive, formSortOrder, fetchMethods])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/payment-methods?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Payment method deleted')
        fetchMethods()
      } else {
        toast.error(data.error || 'Failed to delete payment method')
      }
    } catch {
      toast.error('Failed to delete payment method')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchMethods])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-sm text-muted-foreground">Manage payment method images shown in the footer</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Payment Method
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <Skeleton className="h-12 w-20 rounded" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : methods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No payment methods yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {methods.map((method) => (
            <Card key={method.id} className="relative group">
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <div className="h-12 w-20 relative flex items-center justify-center">
                  <Image
                    src={method.image}
                    alt={method.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium truncate max-w-full">{method.name}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${method.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">#{method.sortOrder}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(method)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(method.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Visa, Mastercard, PayPal..." />
            </div>
            <div className="space-y-2">
              <Label>Image *</Label>
              <MediaPickerButton
                value={formImage}
                onChange={setFormImage}
                folder="general"
                label="Choose Payment Image"
              />
              {formImage && (
                <div className="h-16 rounded border overflow-hidden flex items-center justify-center bg-white p-2">
                  <Image src={formImage} alt="Preview" width={80} height={40} className="object-contain max-h-full" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={formSortOrder} onChange={(e) => setFormSortOrder(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this payment method?</AlertDialogDescription>
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
