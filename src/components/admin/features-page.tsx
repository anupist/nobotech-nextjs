'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Truck, Shield, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface Feature {
  id: string
  icon: string | null
  title: string
  description: string
  isActive: boolean
  sortOrder: number
}

const iconMap: Record<string, React.ElementType> = {
  Truck,
  Shield,
  RotateCcw,
}

function FeatureIcon({ icon }: { icon: string | null }) {
  const Icon = icon && iconMap[icon] ? iconMap[icon] : Truck
  return <Icon className="h-5 w-5" />
}

export function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)

  const [formIcon, setFormIcon] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/features')
      const data = await res.json()
      if (data.success) {
        setFeatures(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch features:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  const openCreateDialog = useCallback(() => {
    setEditingFeature(null)
    setFormIcon('')
    setFormTitle('')
    setFormDescription('')
    setFormSortOrder('0')
    setFormIsActive(true)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((feature: Feature) => {
    setEditingFeature(feature)
    setFormIcon(feature.icon || '')
    setFormTitle(feature.title)
    setFormDescription(feature.description)
    setFormSortOrder(String(feature.sortOrder))
    setFormIsActive(feature.isActive)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formTitle || !formDescription) {
      toast.error('Title and description are required')
      return
    }

    try {
      const payload = {
        ...(editingFeature ? { id: editingFeature.id } : {}),
        icon: formIcon || null,
        title: formTitle,
        description: formDescription,
        sortOrder: parseInt(formSortOrder) || 0,
        isActive: formIsActive,
      }

      const res = await fetch('/api/admin/features', {
        method: editingFeature ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingFeature ? 'Feature updated' : 'Feature created')
        setDialogOpen(false)
        fetchFeatures()
      } else {
        toast.error(data.error || 'Failed to save feature')
      }
    } catch {
      toast.error('Failed to save feature')
    }
  }, [editingFeature, formIcon, formTitle, formDescription, formSortOrder, formIsActive, fetchFeatures])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/features?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Feature deleted')
        fetchFeatures()
      } else {
        toast.error(data.error || 'Failed to delete feature')
      }
    } catch {
      toast.error('Failed to delete feature')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchFeatures])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Features</h1>
          <p className="text-sm text-muted-foreground">Manage footer feature items</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Feature
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : features.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No features yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card key={feature.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <FeatureIcon icon={feature.icon} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">Sort: {feature.sortOrder}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`${feature.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} text-xs`}>
                    {feature.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(feature)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(feature.id)}>
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
            <DialogTitle>{editingFeature ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Free Shipping" />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="On orders over $50" />
            </div>
            <div className="space-y-2">
              <Label>Icon (Lucide name)</Label>
              <Input value={formIcon} onChange={(e) => setFormIcon(e.target.value)} placeholder="Truck, Shield, RotateCcw..." />
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
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingFeature ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this feature?</AlertDialogDescription>
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
