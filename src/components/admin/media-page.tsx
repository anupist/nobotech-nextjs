'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Upload,
  Search,
  Trash2,
  Copy,
  Eye,
  ImagePlus,
  FolderOpen,
  File,
  Loader2,
  HardDrive,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  ImageIcon,
  Link,
  Info,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// ============ Types ============

interface MediaItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt: string | null
  width: number | null
  height: number | null
  folder: string
  uploadedBy: string | null
  createdAt: string
  updatedAt: string
}

// ============ Helpers ============

const FOLDERS = [
  { value: '', label: 'All' },
  { value: 'products', label: 'Products' },
  { value: 'banners', label: 'Banners' },
  { value: 'categories', label: 'Categories' },
  { value: 'brands', label: 'Brands' },
  { value: 'blog', label: 'Blog' },
  { value: 'general', label: 'General' },
]

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncateName(name: string, maxLen = 24): string {
  if (name.length <= maxLen) return name
  const ext = name.lastIndexOf('.')
  if (ext > 0) {
    const base = name.substring(0, ext)
    const extension = name.substring(ext)
    const truncBase = base.substring(0, maxLen - extension.length - 3)
    return truncBase + '...' + extension
  }
  return name.substring(0, maxLen - 3) + '...'
}

// ============ Component ============

export function MediaPage() {
  // Media state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFolder, setActiveFolder] = useState('')
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalSize, setTotalSize] = useState(0)
  const [recentCount, setRecentCount] = useState(0)

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete / preview / detail state
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null)

  // Edit state (alt, folder)
  const [editAlt, setEditAlt] = useState('')
  const [editFolder, setEditFolder] = useState('')

  // Refs
  const offsetRef = useRef(0)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  // ============ Fetch ============

  const fetchMedia = useCallback(
    async (reset = true) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeFolder) params.set('folder', activeFolder)
        if (searchQuery) params.set('search', searchQuery)
        params.set('limit', '20')
        params.set('offset', reset ? '0' : String(offsetRef.current))

        const res = await fetch(`/api/admin/media?${params.toString()}`)
        const json = await res.json()

        if (json.success) {
          const newItems = json.data as MediaItem[]
          if (reset) {
            setMediaItems(newItems)
            offsetRef.current = newItems.length
          } else {
            setMediaItems((prev) => [...prev, ...newItems])
            offsetRef.current += newItems.length
          }
          setHasMore(json.meta?.hasMore ?? false)
          setTotal(json.meta?.total ?? 0)

          // Compute total size & recent count
          const allItems = reset ? newItems : [...mediaItems, ...newItems]
          setTotalSize(allItems.reduce((sum, item) => sum + item.size, 0))
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          setRecentCount(
            allItems.filter((item) => new Date(item.createdAt) >= sevenDaysAgo).length
          )
        }
      } catch {
        toast.error('Failed to load media')
      } finally {
        setLoading(false)
      }
    },
    [activeFolder, searchQuery, mediaItems]
  )

  useEffect(() => {
    offsetRef.current = 0
    fetchMedia(true)
  }, [activeFolder])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      offsetRef.current = 0
      fetchMedia(true)
    }, 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  // ============ Upload ============

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!files || files.length === 0) return
      setUploading(true)

      const fileArray = Array.from(files)
      const progressMap: Record<string, number> = {}
      fileArray.forEach((f) => {
        progressMap[f.name] = 0
      })
      setUploadProgress(progressMap)

      try {
        const formData = new FormData()
        fileArray.forEach((f) => formData.append('files', f))
        formData.append('folder', activeFolder || 'general')

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const next = { ...prev }
            for (const key of Object.keys(next)) {
              next[key] = Math.min(next[key] + Math.random() * 20, 90)
            }
            return next
          })
        }, 200)

        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)
        const json = await res.json()

        if (json.success) {
          setUploadProgress((prev) => {
            const next = { ...prev }
            for (const key of Object.keys(next)) {
              next[key] = 100
            }
            return next
          })

          toast.success(
            `${fileArray.length} file${fileArray.length > 1 ? 's' : ''} uploaded successfully`
          )

          setTimeout(() => {
            setUploadProgress({})
            setUploadOpen(false)
            fetchMedia(true)
          }, 500)
        } else {
          toast.error(json.error || 'Upload failed')
        }
      } catch {
        toast.error('Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [activeFolder, fetchMedia]
  )

  // ============ Delete ============

  const handleDelete = useCallback(
    async (item: MediaItem) => {
      try {
        const res = await fetch(`/api/admin/media?id=${item.id}`, { method: 'DELETE' })
        const json = await res.json()
        if (json.success) {
          toast.success('Media deleted')
          setMediaItems((prev) => prev.filter((m) => m.id !== item.id))
          setTotal((prev) => prev - 1)
          setDeleteTarget(null)
        } else {
          toast.error(json.error || 'Delete failed')
        }
      } catch {
        toast.error('Failed to delete media')
      }
    },
    []
  )

  // ============ Copy URL ============

  const handleCopyUrl = useCallback(async (item: MediaItem) => {
    try {
      const fullUrl = window.location.origin + item.url
      await navigator.clipboard.writeText(fullUrl)
      toast.success('URL copied to clipboard')
    } catch {
      toast.error('Failed to copy URL')
    }
  }, [])

  // ============ Update media (alt/folder) ============

  const handleUpdateMedia = useCallback(
    async () => {
      if (!detailItem) return
      try {
        const res = await fetch(`/api/admin/media/${detailItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alt: editAlt, folder: editFolder }),
        })
        const json = await res.json()
        if (json.success) {
          toast.success('Media updated')
          setMediaItems((prev) =>
            prev.map((m) => (m.id === detailItem.id ? { ...m, alt: editAlt, folder: editFolder } : m))
          )
          setDetailItem(null)
        } else {
          toast.error(json.error || 'Update failed')
        }
      } catch {
        toast.error('Failed to update media')
      }
    },
    [detailItem, editAlt, editFolder]
  )

  // ============ Drag & drop ============

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (e.dataTransfer.files?.length) {
        handleUpload(e.dataTransfer.files)
      }
    },
    [handleUpload]
  )

  // ============ Load more ============

  const handleLoadMore = useCallback(() => {
    fetchMedia(false)
  }, [fetchMedia])

  // ============ Open detail ============

  const openDetail = useCallback((item: MediaItem) => {
    setDetailItem(item)
    setEditAlt(item.alt || '')
    setEditFolder(item.folder)
  }, [])

  // ============ Render ============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ImagePlus className="h-6 w-6 text-emerald-600" />
            Media Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your media files and uploads
          </p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Collapsible Upload Dropzone */}
      <AnimatePresence>
        {uploadOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-emerald-200 dark:border-emerald-800/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Upload className="h-4 w-4 text-emerald-600" />
                    Upload Files
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadOpen(false)}
                    className="h-7 text-xs"
                  >
                    <ChevronUp className="h-3.5 w-3.5 mr-1" />
                    Collapse
                  </Button>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-muted-foreground/25 hover:border-emerald-400 hover:bg-muted/50'
                  }`}
                >
                  <motion.div
                    animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Upload
                      className={`h-10 w-10 mx-auto mb-3 transition-colors ${
                        isDragOver ? 'text-emerald-500' : 'text-muted-foreground'
                      }`}
                    />
                    <p className="text-sm font-medium text-foreground">
                      Drag & drop images here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      JPG, PNG, GIF, WebP, SVG (max 5MB each)
                    </p>
                  </motion.div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleUpload(e.target.files)
                      e.target.value = ''
                    }
                  }}
                />

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Uploading...</h4>
                    {Object.entries(uploadProgress).map(([name, progress]) => (
                      <div key={name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground truncate max-w-[200px]">
                            {name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={activeFolder} onValueChange={setActiveFolder}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Folders" />
          </SelectTrigger>
          <SelectContent>
            {FOLDERS.map((f) => (
              <SelectItem key={f.value} value={f.value || '__all__'}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <ImageIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total Files</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <HardDrive className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
              <p className="text-xs text-muted-foreground">Total Size</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{recentCount}</p>
              <p className="text-xs text-muted-foreground">Recent (7 days)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Grid */}
      {loading && mediaItems.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-muted-foreground">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No media uploaded yet</p>
              <p className="text-sm mt-1 mb-4">Upload images to get started</p>
              <Button
                onClick={() => setUploadOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {mediaItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="group relative rounded-xl border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 overflow-hidden bg-card shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openDetail(item)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {item.mimeType.startsWith('image/') ? (
                      <img
                        src={item.url}
                        alt={item.alt || item.originalName}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <File className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Hover overlay with action buttons */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewItem(item)
                        }}
                        className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4 text-foreground" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyUrl(item)
                        }}
                        className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4 text-foreground" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(item)
                        }}
                        className="p-2 bg-red-500/90 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>

                    {/* Folder badge */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-5 bg-black/60 text-white border-0 hover:bg-black/80 capitalize"
                      >
                        {item.folder}
                      </Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-3 py-2.5">
                    <p
                      className="text-xs font-medium text-foreground truncate"
                      title={item.originalName}
                    >
                      {truncateName(item.originalName)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatFileSize(item.size)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="min-w-32"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.originalName}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(isOpen) => { if (!isOpen) setPreviewItem(null) }}>
        <DialogContent className="max-w-2xl p-2">
          {previewItem && (
            <div className="space-y-3">
              <div className="relative bg-muted rounded-lg overflow-hidden">
                {previewItem.mimeType.startsWith('image/') ? (
                  <img
                    src={previewItem.url}
                    alt={previewItem.alt || previewItem.originalName}
                    className="w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <File className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="px-3 pb-2 space-y-2">
                <p className="text-sm font-medium truncate">{previewItem.originalName}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatFileSize(previewItem.size)}
                  </span>
                  <span>·</span>
                  <span>{previewItem.mimeType}</span>
                  <span>·</span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 capitalize">
                    {previewItem.folder}
                  </Badge>
                  {previewItem.width && previewItem.height && (
                    <>
                      <span>·</span>
                      <span>{previewItem.width}×{previewItem.height}</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyUrl(previewItem)}
                    className="gap-1.5"
                  >
                    <Copy className="h-3 w-3" />
                    Copy URL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPreviewItem(null)
                      openDetail(previewItem)
                    }}
                    className="gap-1.5"
                  >
                    <Info className="h-3 w-3" />
                    Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail/Edit Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(isOpen) => { if (!isOpen) setDetailItem(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4">
              {/* Image preview */}
              <div className="bg-muted rounded-lg overflow-hidden">
                {detailItem.mimeType.startsWith('image/') ? (
                  <img
                    src={detailItem.url}
                    alt={detailItem.alt || detailItem.originalName}
                    className="w-full max-h-48 object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <File className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Filename</span>
                  <p className="font-medium truncate" title={detailItem.originalName}>
                    {detailItem.originalName}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Size</span>
                  <p className="font-medium">{formatFileSize(detailItem.size)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Type</span>
                  <p className="font-medium">{detailItem.mimeType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Dimensions</span>
                  <p className="font-medium">
                    {detailItem.width && detailItem.height
                      ? `${detailItem.width}×${detailItem.height}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Uploaded</span>
                  <p className="font-medium">{formatDate(detailItem.createdAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">URL</span>
                  <div className="flex items-center gap-1">
                    <Link className="h-3 w-3 text-muted-foreground shrink-0" />
                    <p className="font-medium truncate text-xs">{detailItem.url}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Alt Text</Label>
                  <Input
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="Describe this image..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Folder</Label>
                  <Select value={editFolder} onValueChange={setEditFolder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOLDERS.filter((f) => f.value).map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => detailItem && handleCopyUrl(detailItem)}
              className="gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy URL
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateMedia}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
