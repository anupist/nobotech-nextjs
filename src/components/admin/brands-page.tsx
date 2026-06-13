'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { MediaPickerButton } from '@/components/shared/media-picker-button'

interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  isActive: boolean
  _count?: { products: number }
}

export function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formLogo, setFormLogo] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/brands')
      const data = await res.json()
      if (data.success) setBrands(data.data || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  const openCreateDialog = useCallback(() => {
    setEditingBrand(null)
    setFormName('')
    setFormSlug('')
    setFormLogo('')
    setFormDescription('')
    setFormIsActive(true)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((brand: Brand) => {
    setEditingBrand(brand)
    setFormName(brand.name)
    setFormSlug(brand.slug)
    setFormLogo(brand.logo || '')
    setFormDescription(brand.description || '')
    setFormIsActive(brand.isActive)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formName || !formSlug) {
      toast.error('Name and slug are required')
      return
    }

    try {
      const payload = {
        ...(editingBrand ? { id: editingBrand.id } : {}),
        name: formName,
        slug: formSlug,
        logo: formLogo || null,
        description: formDescription || null,
        isActive: formIsActive,
      }

      const res = await fetch('/api/admin/brands', {
        method: editingBrand ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingBrand ? 'Brand updated' : 'Brand created')
        setDialogOpen(false)
        fetchBrands()
      } else {
        toast.error(data.error || 'Failed to save brand')
      }
    } catch {
      toast.error('Failed to save brand')
    }
  }, [editingBrand, formName, formSlug, formLogo, formDescription, formIsActive, fetchBrands])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/brands?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Brand deleted')
        fetchBrands()
      } else {
        toast.error(data.error || 'Failed to delete brand')
      }
    } catch {
      toast.error('Failed to delete brand')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchBrands])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-sm text-muted-foreground">Manage product brands</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Brand
        </Button>
      </div>

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
                  <TableHead className="w-12">Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No brands found
                    </TableCell>
                  </TableRow>
                ) : (
                  brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
                          ) : (
                            <Tag className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{brand.slug}</TableCell>
                      <TableCell className="text-sm">{brand._count?.products || 0}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${brand.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                          {brand.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(brand)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(brand.id)}>
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
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formName} onChange={(e) => {
                  setFormName(e.target.value)
                  if (!editingBrand) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                }} />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <MediaPickerButton
                value={formLogo}
                onChange={setFormLogo}
                folder="brands"
                label="Choose Brand Logo"
              />
              {formLogo && (
                <div className="h-16 w-16 rounded border overflow-hidden">
                  <img src={formLogo} alt="Logo preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingBrand ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this brand? Products linked to this brand will be unlinked.
            </AlertDialogDescription>
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
