'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
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
import { Plus, Pencil, Trash2, FolderTree, ChevronRight, ChevronDown } from 'lucide-react'
import { MediaPickerButton } from '@/components/shared/media-picker-button'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  parentId?: string | null
  sortOrder: number
  isActive: boolean
  children?: Category[]
  _count?: { products: number }
}

interface FlatCategory {
  id: string
  name: string
  depth: number
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Form state
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formParentId, setFormParentId] = useState('')
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
        // Auto-expand all
        const ids = new Set<string>()
        const collectIds = (cats: Category[]) => {
          for (const cat of cats) {
            if (cat.children && cat.children.length > 0) {
              ids.add(cat.id)
              collectIds(cat.children)
            }
          }
        }
        collectIds(data.data || [])
        setExpandedIds(ids)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const openCreateDialog = useCallback(() => {
    setEditingCategory(null)
    setFormName('')
    setFormSlug('')
    setFormDescription('')
    setFormImage('')
    setFormParentId('')
    setFormSortOrder('0')
    setFormIsActive(true)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((cat: Category) => {
    setEditingCategory(cat)
    setFormName(cat.name)
    setFormSlug(cat.slug)
    setFormDescription(cat.description || '')
    setFormImage(cat.image || '')
    setFormParentId(cat.parentId || '')
    setFormSortOrder(String(cat.sortOrder || 0))
    setFormIsActive(cat.isActive)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formName || !formSlug) {
      toast.error('Name and slug are required')
      return
    }

    try {
      const payload = {
        ...(editingCategory ? { id: editingCategory.id } : {}),
        name: formName,
        slug: formSlug,
        description: formDescription || null,
        image: formImage || null,
        parentId: formParentId || null,
        sortOrder: parseInt(formSortOrder) || 0,
        isActive: formIsActive,
      }

      const res = await fetch('/api/admin/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingCategory ? 'Category updated' : 'Category created')
        setDialogOpen(false)
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to save category')
      }
    } catch {
      toast.error('Failed to save category')
    }
  }, [editingCategory, formName, formSlug, formDescription, formImage, formParentId, formSortOrder, formIsActive, fetchCategories])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/categories?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Category deleted')
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to delete category')
      }
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchCategories])

  const flattenCategories = useCallback((): FlatCategory[] => {
    const result: FlatCategory[] = []
    const flatten = (cats: Category[], depth: number) => {
      for (const cat of cats) {
        result.push({ id: cat.id, name: cat.name, depth })
        if (cat.children) flatten(cat.children, depth + 1)
      }
    }
    flatten(categories, 0)
    return result
  }, [categories])

  const renderCategoryTree = (cats: Category[], depth = 0) => {
    return cats.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0
      const isExpanded = expandedIds.has(cat.id)

      return (
        <div key={cat.id}>
          <div
            className="flex items-center gap-2 py-2.5 px-3 hover:bg-gray-50 rounded-lg group"
            style={{ paddingLeft: `${depth * 24 + 12}px` }}
          >
            <button
              onClick={() => hasChildren && toggleExpand(cat.id)}
              className="w-5 h-5 flex items-center justify-center"
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <div className="w-4" />
              )}
            </button>
            <FolderTree className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{cat.name}</span>
                {!cat.isActive && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">Inactive</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">/{cat.slug}</p>
            </div>
            <span className="text-xs text-muted-foreground">{cat._count?.products || 0} products</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(cat)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(cat.id)}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>
          {hasChildren && isExpanded && renderCategoryTree(cat.children!, depth + 1)}
        </div>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage product categories</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No categories found</p>
          ) : (
            renderCategoryTree(categories)
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formName} onChange={(e) => {
                  setFormName(e.target.value)
                  if (!editingCategory) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                }} />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <MediaPickerButton
                value={formImage}
                onChange={setFormImage}
                folder="categories"
                label="Choose Category Image"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select value={formParentId || 'none'} onValueChange={(v) => setFormParentId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {flattenCategories().map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.depth)}{cat.name}
                      </SelectItem>
                    ))}
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
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also affect any subcategories and product associations.
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
