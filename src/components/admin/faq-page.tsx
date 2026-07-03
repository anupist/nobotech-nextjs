'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react'
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

interface FAQCategory {
  id: string
  name: string
  icon: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  _count?: { faqs: number }
}

interface FAQItem {
  id: string
  categoryId: string
  category: FAQCategory
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function FAQPage() {
  // --- Categories State ---
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [catLoading, setCatLoading] = useState(true)
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [catDeleteId, setCatDeleteId] = useState<string | null>(null)
  const [editCat, setEditCat] = useState<FAQCategory | null>(null)
  const [catFormName, setCatFormName] = useState('')
  const [catFormIcon, setCatFormIcon] = useState('')
  const [catFormSortOrder, setCatFormSortOrder] = useState('0')

  // --- FAQ Items State ---
  const [faqItems, setFaqItems] = useState<FAQItem[]>([])
  const [faqLoading, setFaqLoading] = useState(true)
  const [faqDialogOpen, setFaqDialogOpen] = useState(false)
  const [faqDeleteId, setFaqDeleteId] = useState<string | null>(null)
  const [editFaq, setEditFaq] = useState<FAQItem | null>(null)
  const [faqFormCategoryId, setFaqFormCategoryId] = useState('')
  const [faqFormQuestion, setFaqFormQuestion] = useState('')
  const [faqFormAnswer, setFaqFormAnswer] = useState('')
  const [faqFormSortOrder, setFaqFormSortOrder] = useState('0')
  const [faqFormIsActive, setFaqFormIsActive] = useState(true)

  // --- Fetch Categories ---
  const fetchCategories = useCallback(async () => {
    try {
      setCatLoading(true)
      const res = await fetch('/api/admin/faq/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data || [])
    } catch {
      toast.error('Failed to fetch FAQ categories')
    } finally {
      setCatLoading(false)
    }
  }, [])

  // --- Fetch FAQ Items ---
  const fetchFaqItems = useCallback(async () => {
    try {
      setFaqLoading(true)
      const res = await fetch('/api/admin/faq')
      const data = await res.json()
      if (data.success) setFaqItems(data.data || [])
    } catch {
      toast.error('Failed to fetch FAQ items')
    } finally {
      setFaqLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchFaqItems()
  }, [fetchCategories, fetchFaqItems])

  // --- Category Handlers ---
  const openCatCreate = useCallback(() => {
    setEditCat(null)
    setCatFormName('')
    setCatFormIcon('')
    setCatFormSortOrder('0')
    setCatDialogOpen(true)
  }, [])

  const openCatEdit = useCallback((cat: FAQCategory) => {
    setEditCat(cat)
    setCatFormName(cat.name)
    setCatFormIcon(cat.icon || '')
    setCatFormSortOrder(String(cat.sortOrder))
    setCatDialogOpen(true)
  }, [])

  const handleCatSave = useCallback(async () => {
    if (!catFormName.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      const payload = {
        ...(editCat ? { id: editCat.id } : {}),
        name: catFormName.trim(),
        icon: catFormIcon.trim() || null,
        sortOrder: parseInt(catFormSortOrder) || 0,
      }
      const res = await fetch('/api/admin/faq/categories', {
        method: editCat ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editCat ? 'Category updated' : 'Category created')
        setCatDialogOpen(false)
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to save category')
      }
    } catch {
      toast.error('Failed to save category')
    }
  }, [editCat, catFormName, catFormIcon, catFormSortOrder, fetchCategories])

  const handleCatDelete = useCallback(async () => {
    if (!catDeleteId) return
    try {
      const res = await fetch(`/api/admin/faq/categories?id=${catDeleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Category deleted')
        fetchCategories()
        fetchFaqItems()
      } else {
        toast.error(data.error || 'Failed to delete category')
      }
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setCatDeleteId(null)
    }
  }, [catDeleteId, fetchCategories, fetchFaqItems])

  // --- FAQ Item Handlers ---
  const openFaqCreate = useCallback(() => {
    setEditFaq(null)
    setFaqFormCategoryId('')
    setFaqFormQuestion('')
    setFaqFormAnswer('')
    setFaqFormSortOrder('0')
    setFaqFormIsActive(true)
    setFaqDialogOpen(true)
  }, [])

  const openFaqEdit = useCallback((faq: FAQItem) => {
    setEditFaq(faq)
    setFaqFormCategoryId(faq.categoryId)
    setFaqFormQuestion(faq.question)
    setFaqFormAnswer(faq.answer)
    setFaqFormSortOrder(String(faq.sortOrder))
    setFaqFormIsActive(faq.isActive)
    setFaqDialogOpen(true)
  }, [])

  const handleFaqSave = useCallback(async () => {
    if (!faqFormCategoryId || !faqFormQuestion.trim() || !faqFormAnswer.trim()) {
      toast.error('Category, question and answer are required')
      return
    }
    try {
      const payload = {
        ...(editFaq ? { id: editFaq.id } : {}),
        categoryId: faqFormCategoryId,
        question: faqFormQuestion.trim(),
        answer: faqFormAnswer.trim(),
        sortOrder: parseInt(faqFormSortOrder) || 0,
        isActive: faqFormIsActive,
      }
      const res = await fetch('/api/admin/faq', {
        method: editFaq ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editFaq ? 'FAQ updated' : 'FAQ created')
        setFaqDialogOpen(false)
        fetchFaqItems()
      } else {
        toast.error(data.error || 'Failed to save FAQ')
      }
    } catch {
      toast.error('Failed to save FAQ')
    }
  }, [editFaq, faqFormCategoryId, faqFormQuestion, faqFormAnswer, faqFormSortOrder, faqFormIsActive, fetchFaqItems])

  const handleFaqDelete = useCallback(async () => {
    if (!faqDeleteId) return
    try {
      const res = await fetch(`/api/admin/faq?id=${faqDeleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('FAQ deleted')
        fetchFaqItems()
      } else {
        toast.error(data.error || 'Failed to delete FAQ')
      }
    } catch {
      toast.error('Failed to delete FAQ')
    } finally {
      setFaqDeleteId(null)
    }
  }, [faqDeleteId, fetchFaqItems])

  return (
    <div className="space-y-8">
      {/* ===================== FAQ Categories ===================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">FAQ Categories</h2>
            <p className="text-sm text-muted-foreground">Organize FAQs into groups</p>
          </div>
          <Button onClick={openCatCreate} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {catLoading ? (
              <div className="p-4">
                <TableSkeleton rows={3} />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="font-medium">No FAQ categories</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first FAQ category to get started</p>
                <Button onClick={openCatCreate} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead className="text-center">Sort Order</TableHead>
                    <TableHead className="text-center">FAQs</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground">{cat.icon || '—'}</TableCell>
                      <TableCell className="text-center">{cat.sortOrder}</TableCell>
                      <TableCell className="text-center">{cat._count?.faqs ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCatEdit(cat)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCatDeleteId(cat.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===================== FAQ Items ===================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">FAQ Items</h2>
            <p className="text-sm text-muted-foreground">Manage questions and answers</p>
          </div>
          <Button onClick={openFaqCreate} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" /> Add FAQ
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {faqLoading ? (
              <div className="p-4">
                <TableSkeleton rows={4} />
              </div>
            ) : faqItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="font-medium">No FAQ items</p>
                <p className="text-sm text-muted-foreground mt-1">Add questions and answers to your FAQ categories</p>
                <Button onClick={openFaqCreate} variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add FAQ
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead className="text-center">Sort Order</TableHead>
                    <TableHead className="text-center">Active</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqItems.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {faq.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate font-medium">
                        {faq.question}
                      </TableCell>
                      <TableCell className="text-center">{faq.sortOrder}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${faq.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                          <span className={`h-2 w-2 rounded-full ${faq.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openFaqEdit(faq)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFaqDeleteId(faq.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===================== Category Dialog ===================== */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCat ? 'Edit FAQ Category' : 'Add FAQ Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={catFormName} onChange={(e) => setCatFormName(e.target.value)} placeholder="e.g. Orders & Shipping" />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Input value={catFormIcon} onChange={(e) => setCatFormIcon(e.target.value)} placeholder="Lucide icon name (e.g. Package)" />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={catFormSortOrder} onChange={(e) => setCatFormSortOrder(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCatSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editCat ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== FAQ Item Dialog ===================== */}
      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={faqFormCategoryId} onValueChange={setFaqFormCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question *</Label>
              <Input value={faqFormQuestion} onChange={(e) => setFaqFormQuestion(e.target.value)} placeholder="How do I track my order?" />
            </div>
            <div className="space-y-2">
              <Label>Answer *</Label>
              <Textarea value={faqFormAnswer} onChange={(e) => setFaqFormAnswer(e.target.value)} rows={4} placeholder="You can track your order by..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={faqFormSortOrder} onChange={(e) => setFaqFormSortOrder(e.target.value)} />
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch checked={faqFormIsActive} onCheckedChange={setFaqFormIsActive} id="faq-active" />
                  <Label htmlFor="faq-active">Active</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFaqSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editFaq ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== Delete Category Alert ===================== */}
      <AlertDialog open={!!catDeleteId} onOpenChange={() => setCatDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also delete all FAQ items in this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCatDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===================== Delete FAQ Alert ===================== */}
      <AlertDialog open={!!faqDeleteId} onOpenChange={() => setFaqDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFaqDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
