'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Menu, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface NavigationItemData {
  id: string
  label: string
  url: string
  parentId: string | null
  location: string
  sortOrder: number
  isActive: boolean
  children?: NavigationItemData[]
}

interface FlatNavItem {
  id: string
  label: string
  depth: number
}

export function NavigationPage() {
  const [navItems, setNavItems] = useState<NavigationItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<NavigationItemData | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const [formLabel, setFormLabel] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formParentId, setFormParentId] = useState('')
  const [formLocation, setFormLocation] = useState('header')
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchNavItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/navigation')
      const data = await res.json()
      if (data.success) {
        setNavItems(data.data || [])
        const ids = new Set<string>()
        const collectIds = (items: NavigationItemData[]) => {
          for (const item of items) {
            if (item.children && item.children.length > 0) {
              ids.add(item.id)
              collectIds(item.children)
            }
          }
        }
        collectIds(data.data || [])
        setExpandedIds(ids)
      }
    } catch {
      toast.error('Failed to fetch navigation items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNavItems()
  }, [fetchNavItems])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const resetForm = useCallback(() => {
    setFormLabel('')
    setFormUrl('')
    setFormParentId('')
    setFormLocation('header')
    setFormSortOrder('0')
    setFormIsActive(true)
  }, [])

  const openCreateDialog = useCallback(() => {
    setEditingItem(null)
    resetForm()
    setDialogOpen(true)
  }, [resetForm])

  const openEditDialog = useCallback((item: NavigationItemData) => {
    setEditingItem(item)
    setFormLabel(item.label)
    setFormUrl(item.url)
    setFormParentId(item.parentId || '')
    setFormLocation(item.location)
    setFormSortOrder(String(item.sortOrder || 0))
    setFormIsActive(item.isActive)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formLabel || !formUrl) {
      toast.error('Label and URL are required')
      return
    }

    try {
      const payload: Record<string, unknown> = {
        ...(editingItem ? { id: editingItem.id } : {}),
        label: formLabel,
        url: formUrl,
        parentId: formParentId || null,
        location: formLocation,
        sortOrder: parseInt(formSortOrder) || 0,
        isActive: formIsActive,
      }

      const res = await fetch('/api/admin/navigation', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingItem ? 'Navigation item updated' : 'Navigation item created')
        setDialogOpen(false)
        fetchNavItems()
      } else {
        toast.error(data.error || 'Failed to save navigation item')
      }
    } catch {
      toast.error('Failed to save navigation item')
    }
  }, [editingItem, formLabel, formUrl, formParentId, formLocation, formSortOrder, formIsActive, fetchNavItems])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/navigation?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Navigation item deleted')
        fetchNavItems()
      } else {
        toast.error(data.error || 'Failed to delete navigation item')
      }
    } catch {
      toast.error('Failed to delete navigation item')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchNavItems])

  const deletingItemHasChildren = useCallback((): boolean => {
    const findItem = (items: NavigationItemData[], id: string): NavigationItemData | null => {
      for (const item of items) {
        if (item.id === id) return item
        if (item.children) {
          const found = findItem(item.children, id)
          if (found) return found
        }
      }
      return null
    }
    const item = findItem(navItems, deleteId || '')
    return item?.children != null && item.children.length > 0
  }, [navItems, deleteId])

  const flattenItems = useCallback((): FlatNavItem[] => {
    const result: FlatNavItem[] = []
    const flatten = (items: NavigationItemData[], depth: number) => {
      for (const item of items) {
        result.push({ id: item.id, label: item.label, depth })
        if (item.children) flatten(item.children, depth + 1)
      }
    }
    flatten(navItems, 0)
    return result
  }, [navItems])

  const renderTree = (items: NavigationItemData[], depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0
      const isExpanded = expandedIds.has(item.id)

      return (
        <div key={item.id}>
          <div
            className="flex items-center gap-2 py-2.5 px-3 hover:bg-gray-50 rounded-lg group"
            style={{ paddingLeft: `${depth * 24 + 12}px` }}
          >
            <button
              onClick={() => hasChildren && toggleExpand(item.id)}
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
            <Menu className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{item.label}</span>
                {!item.isActive && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">Inactive</Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">{item.location}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.url}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(item)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(item.id)}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>
          {hasChildren && isExpanded && renderTree(item.children!, depth + 1)}
        </div>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Navigation</h1>
          <p className="text-sm text-muted-foreground">Manage header and footer navigation menu items</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Item
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
          ) : navItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No navigation items yet</p>
          ) : (
            renderTree(navItems)
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Navigation Item' : 'Add Navigation Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input value={formLabel} onChange={(e) => setFormLabel(e.target.value)} placeholder="e.g. Shop" />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="e.g. /shop" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent Item</Label>
                <Select value={formParentId || 'none'} onValueChange={(v) => setFormParentId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {flattenItems().map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {'  '.repeat(item.depth)}{item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={formLocation} onValueChange={setFormLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={formSortOrder} onChange={(e) => setFormSortOrder(e.target.value)} />
              </div>
              <div className="flex items-end justify-between pb-2">
                <Label>Active</Label>
                <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Navigation Item</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingItemHasChildren()
                ? 'This item has child items. Deleting it will orphan those children.'
                : 'Are you sure you want to delete this navigation item? This action cannot be undone.'}
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
