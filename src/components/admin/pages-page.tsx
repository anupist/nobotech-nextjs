'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'

interface PageItem {
  id: string
  title: string
  slug: string
  content: string
  isActive: boolean
  createdAt: string
}

export function PagesPage() {
  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingPage, setEditingPage] = useState<PageItem | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/pages')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setPages(data.data || [])
        }
      } else {
        setPages([])
      }
    } catch {
      setPages([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const openCreateDialog = useCallback(() => {
    setEditingPage(null)
    setFormTitle('')
    setFormSlug('')
    setFormContent('')
    setFormIsActive(true)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((page: PageItem) => {
    setEditingPage(page)
    setFormTitle(page.title)
    setFormSlug(page.slug)
    setFormContent(page.content)
    setFormIsActive(page.isActive)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formTitle || !formSlug) {
      toast.error('Title and slug are required')
      return
    }

    try {
      const payload = {
        ...(editingPage ? { id: editingPage.id } : {}),
        title: formTitle,
        slug: formSlug,
        content: formContent,
        isActive: formIsActive,
      }

      const res = await fetch('/api/admin/pages', {
        method: editingPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingPage ? 'Page updated' : 'Page created')
        setDialogOpen(false)
        fetchPages()
      } else {
        toast.error(data.error || 'Failed to save page')
      }
    } catch {
      toast.error('Failed to save page')
    }
  }, [editingPage, formTitle, formSlug, formContent, formIsActive, fetchPages])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/pages?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Page deleted')
        fetchPages()
      } else {
        toast.error(data.error || 'Failed to delete page')
      }
    } catch {
      toast.error('Failed to delete page')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchPages])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-sm text-muted-foreground">Manage static pages</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Page
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
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      No pages found
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium text-sm">{page.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">/{page.slug}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={page.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}>
                          {page.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(page)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(page.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Page' : 'Add Page'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formTitle} onChange={(e) => {
                  setFormTitle(e.target.value)
                  if (!editingPage) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                }} />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={12} placeholder="Page content..." />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingPage ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this page?</AlertDialogDescription>
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
