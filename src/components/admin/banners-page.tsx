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
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import { MediaPickerButton } from '@/components/shared/media-picker-button'

interface Banner {
  id: string
  title: string
  image: string
  link: string | null
  position: string
  sortOrder: number
  isActive: boolean
}

export function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formLink, setFormLink] = useState('')
  const [formPosition, setFormPosition] = useState('hero')
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/banners?limit=100')
      const data = await res.json()
      if (data.success) {
        setBanners(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const openCreateDialog = useCallback(() => {
    setEditingBanner(null)
    setFormTitle('')
    setFormImage('')
    setFormLink('')
    setFormPosition('hero')
    setFormSortOrder('0')
    setFormIsActive(true)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((banner: Banner) => {
    setEditingBanner(banner)
    setFormTitle(banner.title)
    setFormImage(banner.image)
    setFormLink(banner.link || '')
    setFormPosition(banner.position)
    setFormSortOrder(String(banner.sortOrder))
    setFormIsActive(banner.isActive)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formTitle || !formImage) {
      toast.error('Title and image are required')
      return
    }

    try {
      const payload = {
        ...(editingBanner ? { id: editingBanner.id } : {}),
        title: formTitle,
        image: formImage,
        link: formLink || null,
        position: formPosition,
        sortOrder: parseInt(formSortOrder) || 0,
        isActive: formIsActive,
      }

      const res = await fetch('/api/admin/banners', {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingBanner ? 'Banner updated' : 'Banner created')
        setDialogOpen(false)
        fetchBanners()
      } else {
        toast.error(data.error || 'Failed to save banner')
      }
    } catch {
      toast.error('Failed to save banner')
    }
  }, [editingBanner, formTitle, formImage, formLink, formPosition, formSortOrder, formIsActive, fetchBanners])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/banners?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Banner deleted')
        fetchBanners()
      } else {
        toast.error(data.error || 'Failed to delete banner')
      }
    } catch {
      toast.error('Failed to delete banner')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchBanners])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">Manage homepage banners</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No banners found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="h-40 bg-gray-100 relative">
                <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <Badge variant="secondary" className="bg-white/90 text-xs capitalize">
                    {banner.position}
                  </Badge>
                  <Badge variant="secondary" className={`${banner.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'} text-xs`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{banner.title}</h3>
                    {banner.link && (
                      <p className="text-xs text-muted-foreground truncate max-w-48">{banner.link}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Sort: {banner.sortOrder}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(banner)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(banner.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Image *</Label>
              <MediaPickerButton
                value={formImage}
                onChange={setFormImage}
                folder="banners"
                label="Choose Banner Image"
              />
              {formImage && (
                <div className="h-24 rounded border overflow-hidden">
                  <img src={formImage} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input value={formLink} onChange={(e) => setFormLink(e.target.value)} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select value={formPosition} onValueChange={setFormPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={formSortOrder} onChange={(e) => setFormSortOrder(e.target.value)} />
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
              {editingBanner ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this banner?</AlertDialogDescription>
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
