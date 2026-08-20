'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface AboutSection {
  id: string
  type: string
  title: string | null
  description: string | null
  items: string | null
  sortOrder: number
  isActive: boolean
}

const TYPE_BADGES: Record<string, string> = {
  hero: 'bg-purple-100 text-purple-800',
  values: 'bg-blue-100 text-blue-800',
  stats: 'bg-green-100 text-green-800',
  team: 'bg-orange-100 text-orange-800',
  timeline: 'bg-cyan-100 text-cyan-800',
  cta: 'bg-rose-100 text-rose-800',
}

const ITEMS_HELP: Record<string, string> = {
  values: '[{"icon":"Heart","title":"Quality","description":"...","gradient":"from-..."}]',
  stats: '[{"number":"50K+","label":"Customers","suffix":"+"}]',
  team: '[{"name":"Sarah Kim","role":"CEO","bio":"...","avatar":""}]',
  timeline: '[{"year":"2020","title":"Founded","description":"..."}]',
}

export function AboutSectionsPage() {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null)

  const [formType, setFormType] = useState('hero')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formItems, setFormItems] = useState('')
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/about-sections')
      const data = await res.json()
      if (data.success) {
        setSections(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch about sections:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  const openCreateDialog = useCallback(() => {
    setEditingSection(null)
    setFormType('hero')
    setFormTitle('')
    setFormDescription('')
    setFormItems('')
    setFormSortOrder('0')
    setFormIsActive(true)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((section: AboutSection) => {
    setEditingSection(section)
    setFormType(section.type)
    setFormTitle(section.title || '')
    setFormDescription(section.description || '')
    setFormItems(section.items || '')
    setFormSortOrder(String(section.sortOrder))
    setFormIsActive(section.isActive)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formType) {
      toast.error('Type is required')
      return
    }

    let itemsParsed: unknown = null
    if (formItems.trim()) {
      try {
        itemsParsed = JSON.parse(formItems.trim())
      } catch {
        toast.error('Items must be valid JSON')
        return
      }
    }

    try {
      const payload: Record<string, unknown> = {
        ...(editingSection ? { id: editingSection.id } : {}),
        type: formType,
        title: formTitle || null,
        description: formDescription || null,
        items: itemsParsed,
        sortOrder: parseInt(formSortOrder) || 0,
        isActive: formIsActive,
      }

      const res = await fetch('/api/admin/about-sections', {
        method: editingSection ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingSection ? 'About section updated' : 'About section created')
        setDialogOpen(false)
        fetchSections()
      } else {
        toast.error(data.error || 'Failed to save about section')
      }
    } catch {
      toast.error('Failed to save about section')
    }
  }, [editingSection, formType, formTitle, formDescription, formItems, formSortOrder, formIsActive, fetchSections])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/about-sections?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('About section deleted')
        fetchSections()
      } else {
        toast.error(data.error || 'Failed to delete about section')
      }
    } catch {
      toast.error('Failed to delete about section')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchSections])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">About Sections</h1>
          <p className="text-sm text-muted-foreground">Manage about page sections</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Section
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No about sections yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs capitalize ${TYPE_BADGES[section.type] || ''}`}>
                      {section.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-60 truncate">
                    {section.title || <span className="text-muted-foreground italic">No title</span>}
                  </TableCell>
                  <TableCell>{section.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${section.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} text-xs`}>
                      {section.isActive ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(section)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(section.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSection ? 'Edit About Section' : 'Add About Section'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="values">Values</SelectItem>
                  <SelectItem value="stats">Stats</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="cta">CTA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Section title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Section description" rows={3} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items (JSON)</Label>
                {ITEMS_HELP[formType] && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Expected: {ITEMS_HELP[formType]}
                  </span>
                )}
              </div>
              <Textarea
                value={formItems}
                onChange={(e) => setFormItems(e.target.value)}
                placeholder='[{"key": "value"}]'
                rows={5}
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={formSortOrder} onChange={(e) => setFormSortOrder(e.target.value)} />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label>Active</Label>
                <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingSection ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete About Section</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this about section?</AlertDialogDescription>
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
