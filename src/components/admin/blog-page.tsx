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
import { MediaPickerButton } from '@/components/shared/media-picker-button'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  thumbnail: string | null
  category: string | null
  tags: string | null
  isPublished: boolean
  createdAt: string
}

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formThumbnail, setFormThumbnail] = useState('')
  const [formIsPublished, setFormIsPublished] = useState(false)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/blog')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setPosts(data.data || [])
        }
      } else {
        setPosts([])
      }
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const openCreateDialog = useCallback(() => {
    setEditingPost(null)
    setFormTitle('')
    setFormSlug('')
    setFormContent('')
    setFormExcerpt('')
    setFormCategory('')
    setFormTags('')
    setFormThumbnail('')
    setFormIsPublished(false)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((post: BlogPost) => {
    setEditingPost(post)
    setFormTitle(post.title)
    setFormSlug(post.slug)
    setFormContent(post.content)
    setFormExcerpt(post.excerpt || '')
    setFormCategory(post.category || '')
    setFormTags(post.tags || '')
    setFormThumbnail(post.thumbnail || '')
    setFormIsPublished(post.isPublished)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!formTitle || !formSlug) {
      toast.error('Title and slug are required')
      return
    }

    try {
      const payload = {
        ...(editingPost ? { id: editingPost.id } : {}),
        title: formTitle,
        slug: formSlug,
        content: formContent,
        excerpt: formExcerpt || null,
        category: formCategory || null,
        tags: formTags || null,
        thumbnail: formThumbnail || null,
        isPublished: formIsPublished,
      }

      const res = await fetch('/api/admin/blog', {
        method: editingPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingPost ? 'Post updated' : 'Post created')
        setDialogOpen(false)
        fetchPosts()
      } else {
        toast.error(data.error || 'Failed to save post')
      }
    } catch {
      toast.error('Failed to save post')
    }
  }, [editingPost, formTitle, formSlug, formContent, formExcerpt, formCategory, formTags, formThumbnail, formIsPublished, fetchPosts])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/blog?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Post deleted')
        fetchPosts()
      } else {
        toast.error(data.error || 'Failed to delete post')
      }
    } catch {
      toast.error('Failed to delete post')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchPosts])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">Manage blog content</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Post
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
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Tags</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      No blog posts found
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{post.title}</p>
                          <p className="text-xs text-muted-foreground">/{post.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {post.category || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {post.tags ? (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.split(',').slice(0, 3).map((tag) => (
                              <Badge key={tag.trim()} variant="secondary" className="text-xs">{tag.trim()}</Badge>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={post.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}>
                          {post.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(post)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(post.id)}>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Add Post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={formTitle} onChange={(e) => {
                  setFormTitle(e.target.value)
                  if (!editingPost) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                }} />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={10} placeholder="Write your blog content..." />
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea value={formExcerpt} onChange={(e) => setFormExcerpt(e.target.value)} rows={2} placeholder="Brief description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="Technology" />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="tech, review, guide" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <MediaPickerButton
                value={formThumbnail}
                onChange={setFormThumbnail}
                folder="blog"
                label="Choose Thumbnail"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Published</Label>
              <Switch checked={formIsPublished} onCheckedChange={setFormIsPublished} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingPost ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this blog post?</AlertDialogDescription>
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
