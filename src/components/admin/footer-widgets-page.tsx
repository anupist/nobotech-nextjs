'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Link as LinkIcon, GripVertical } from 'lucide-react'
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

interface FooterWidgetLink {
  id: string
  label: string
  url: string
  sortOrder: number
}

interface FooterWidget {
  id: string
  title: string
  location: string
  sortOrder: number
  isActive: boolean
  links: FooterWidgetLink[]
}

interface FormLink {
  key: string
  label: string
  url: string
  sortOrder: number
}

export function FooterWidgetsPage() {
  const [widgets, setWidgets] = useState<FooterWidget[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingWidget, setEditingWidget] = useState<FooterWidget | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formLocation, setFormLocation] = useState('quick_links')
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formLinks, setFormLinks] = useState<FormLink[]>([])

  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/footer-widgets?limit=100')
      const data = await res.json()
      if (data.success) {
        setWidgets(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch footer widgets:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWidgets()
  }, [fetchWidgets])

  const resetForm = useCallback(() => {
    setFormTitle('')
    setFormLocation('quick_links')
    setFormSortOrder('0')
    setFormIsActive(true)
    setFormLinks([])
  }, [])

  const openCreateDialog = useCallback(() => {
    setEditingWidget(null)
    resetForm()
    setDialogOpen(true)
  }, [resetForm])

  const openEditDialog = useCallback((widget: FooterWidget) => {
    setEditingWidget(widget)
    setFormTitle(widget.title)
    setFormLocation(widget.location)
    setFormSortOrder(String(widget.sortOrder))
    setFormIsActive(widget.isActive)
    setFormLinks(
      widget.links.map((link) => ({
        key: link.id,
        label: link.label,
        url: link.url,
        sortOrder: link.sortOrder,
      }))
    )
    setDialogOpen(true)
  }, [])

  const addLinkRow = useCallback(() => {
    setFormLinks((prev) => [
      ...prev,
      { key: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, label: '', url: '', sortOrder: prev.length },
    ])
  }, [])

  const removeLinkRow = useCallback((key: string) => {
    setFormLinks((prev) => prev.filter((link) => link.key !== key))
  }, [])

  const updateLinkField = useCallback(
    (key: string, field: keyof FormLink, value: string | number) => {
      setFormLinks((prev) =>
        prev.map((link) => (link.key === key ? { ...link, [field]: value } : link))
      )
    },
    []
  )

  const handleSave = useCallback(async () => {
    if (!formTitle || !formLocation) {
      toast.error('Title and location are required')
      return
    }

    try {
      const payload = {
        ...(editingWidget ? { id: editingWidget.id } : {}),
        title: formTitle,
        location: formLocation,
        sortOrder: parseInt(formSortOrder) || 0,
        isActive: formIsActive,
        links: formLinks.map(({ label, url, sortOrder }) => ({
          label,
          url,
          sortOrder,
        })),
      }

      const res = await fetch('/api/admin/footer-widgets', {
        method: editingWidget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingWidget ? 'Footer widget updated' : 'Footer widget created')
        setDialogOpen(false)
        fetchWidgets()
      } else {
        toast.error(data.error || 'Failed to save footer widget')
      }
    } catch {
      toast.error('Failed to save footer widget')
    }
  }, [editingWidget, formTitle, formLocation, formSortOrder, formIsActive, formLinks, fetchWidgets])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/footer-widgets?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Footer widget deleted')
        fetchWidgets()
      } else {
        toast.error(data.error || 'Failed to delete footer widget')
      }
    } catch {
      toast.error('Failed to delete footer widget')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchWidgets])

  const locationLabel = (loc: string) => {
    switch (loc) {
      case 'quick_links':
        return 'Quick Links'
      case 'customer_service':
        return 'Customer Service'
      default:
        return loc
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Footer Widgets</h1>
          <p className="text-sm text-muted-foreground">Manage quick links and customer service sections</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Widget
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : widgets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No footer widgets yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map((widget) => (
            <Card key={widget.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{widget.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {locationLabel(widget.location)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`${
                          widget.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        } text-xs`}
                      >
                        {widget.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(widget)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteId(widget.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Sort: {widget.sortOrder}</p>
                {widget.links.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Links ({widget.links.length}):
                    </p>
                    <ul className="space-y-1">
                      {widget.links.map((link) => (
                        <li
                          key={link.id}
                          className="text-xs text-muted-foreground flex items-center gap-1"
                        >
                          <LinkIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{link.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWidget ? 'Edit Footer Widget' : 'Add Footer Widget'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Quick Links"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location *</Label>
                <Select value={formLocation} onValueChange={setFormLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick_links">Quick Links</SelectItem>
                    <SelectItem value="customer_service">Customer Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Links</Label>
                <Button variant="outline" size="sm" onClick={addLinkRow}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
                </Button>
              </div>
              {formLinks.length === 0 && (
                <p className="text-sm text-muted-foreground">No links added yet.</p>
              )}
              {formLinks.map((link, index) => (
                <div key={link.key} className="border rounded-lg p-3 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Link {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeLinkRow(link.key)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => updateLinkField(link.key, 'label', e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateLinkField(link.key, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Sort"
                        value={link.sortOrder}
                        onChange={(e) =>
                          updateLinkField(
                            link.key,
                            'sortOrder',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingWidget ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Footer Widget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this footer widget? All associated links will also be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
