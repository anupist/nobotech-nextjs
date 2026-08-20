'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Plus, Star, Pencil, Trash2, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { MediaPickerButton } from '@/components/shared/media-picker-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Testimonial {
  id: string
  name: string
  avatar: string | null
  rating: number
  comment: string
  isActive: boolean
  sortOrder: number
}

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)

  const [formName, setFormName] = useState('')
  const [formAvatar, setFormAvatar] = useState('')
  const [formRating, setFormRating] = useState('5')
  const [formComment, setFormComment] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formSortOrder, setFormSortOrder] = useState('0')

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/testimonials')
      const data = await res.json()
      if (data.success) {
        setTestimonials(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const openCreateDialog = useCallback(() => {
    setEditingTestimonial(null)
    setFormName('')
    setFormAvatar('')
    setFormRating('5')
    setFormComment('')
    setFormIsActive(true)
    setFormSortOrder('0')
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormName(testimonial.name)
    setFormAvatar(testimonial.avatar || '')
    setFormRating(String(testimonial.rating))
    setFormComment(testimonial.comment)
    setFormIsActive(testimonial.isActive)
    setFormSortOrder(String(testimonial.sortOrder))
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formName || !formComment || !formRating) {
      toast.error('Name, rating and comment are required')
      return
    }

    try {
      const payload = {
        ...(editingTestimonial ? { id: editingTestimonial.id } : {}),
        name: formName,
        avatar: formAvatar || null,
        rating: parseInt(formRating),
        comment: formComment,
        isActive: formIsActive,
        sortOrder: parseInt(formSortOrder) || 0,
      }

      const res = await fetch('/api/admin/testimonials', {
        method: editingTestimonial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingTestimonial ? 'Testimonial updated' : 'Testimonial created')
        setDialogOpen(false)
        fetchTestimonials()
      } else {
        toast.error(data.error || 'Failed to save testimonial')
      }
    } catch {
      toast.error('Failed to save testimonial')
    }
  }, [editingTestimonial, formName, formAvatar, formRating, formComment, formIsActive, formSortOrder, fetchTestimonials])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/testimonials?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Testimonial deleted')
        fetchTestimonials()
      } else {
        toast.error(data.error || 'Failed to delete testimonial')
      }
    } catch {
      toast.error('Failed to delete testimonial')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchTestimonials])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-sm text-muted-foreground">Manage customer testimonials</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Quote className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No testimonials yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar || ''} alt={testimonial.name} />
                      <AvatarFallback className="text-sm">{testimonial.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">{testimonial.name}</h3>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`${testimonial.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} text-xs`}>
                    {testimonial.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Sort: {testimonial.sortOrder}</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(testimonial)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(testimonial.id)}>
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
            <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Customer name" />
            </div>
            <div className="space-y-2">
              <Label>Avatar</Label>
              <MediaPickerButton
                value={formAvatar}
                onChange={setFormAvatar}
                folder="general"
                label="Choose Avatar"
              />
              {formAvatar && (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={formAvatar} alt="Preview" />
                  <AvatarFallback>{formName.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rating *</Label>
              <Select value={formRating} onValueChange={setFormRating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <SelectItem key={star} value={String(star)}>
                      <div className="flex items-center gap-2">
                        {star} Star{star > 1 ? 's' : ''}
                        <span className="flex">
                          {renderStars(star)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comment *</Label>
              <Textarea value={formComment} onChange={(e) => setFormComment(e.target.value)} placeholder="Customer testimonial..." rows={4} />
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
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingTestimonial ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this testimonial? This action cannot be undone.</AlertDialogDescription>
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