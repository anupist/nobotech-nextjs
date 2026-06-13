'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
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
  X,
  Check,
  ImageIcon,
  FolderOpen,
  File,
  Loader2,
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

interface MediaGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (urls: string[]) => void
  multiple?: boolean
  folder?: string
  maxSelect?: number
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

function truncateName(name: string, maxLen = 20): string {
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

export function MediaGallery({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  folder: initialFolder = 'general',
  maxSelect,
}: MediaGalleryProps) {
  // State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedUrls, setSelectedUrls] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFolder, setActiveFolder] = useState(initialFolder)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const offsetRef = useRef(0)
  const isInitialLoad = useRef(true)

  // Fetch media
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
        }
      } catch (err) {
        console.error('Failed to fetch media:', err)
        toast.error('Failed to load media')
      } finally {
        setLoading(false)
      }
    },
    [activeFolder, searchQuery]
  )

  // Load on open or filter change
  useEffect(() => {
    if (open) {
      offsetRef.current = 0
      isInitialLoad.current = true
      fetchMedia(true)
    }
  }, [open, activeFolder, fetchMedia])

  // Debounced search
  useEffect(() => {
    if (!open) return
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      offsetRef.current = 0
      fetchMedia(true)
    }, 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery, fetchMedia])

  // Upload files
  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      if (!files || files.length === 0) return
      setUploading(true)

      const fileArray = Array.from(files)
      // Initialize progress
      const progressMap: Record<string, number> = {}
      fileArray.forEach((f) => {
        progressMap[f.name] = 0
      })
      setUploadProgress(progressMap)

      try {
        const formData = new FormData()
        fileArray.forEach((f) => formData.append('files', f))
        formData.append('folder', activeFolder || 'general')

        // Simulate progress
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

          // Refresh gallery
          setTimeout(() => {
            setUploadProgress({})
            fetchMedia(true)
          }, 500)
        } else {
          toast.error(json.error || 'Upload failed')
        }
      } catch (err) {
        console.error('Upload error:', err)
        toast.error('Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [activeFolder, fetchMedia]
  )

  // Delete media
  const handleDelete = useCallback(
    async (item: MediaItem) => {
      try {
        const res = await fetch(`/api/admin/media?id=${item.id}`, {
          method: 'DELETE',
        })
        const json = await res.json()

        if (json.success) {
          toast.success('Media deleted')
          setMediaItems((prev) => prev.filter((m) => m.id !== item.id))
          setSelectedUrls((prev) => prev.filter((u) => u !== item.url))
          setDeleteTarget(null)
        } else {
          toast.error(json.error || 'Delete failed')
        }
      } catch (err) {
        console.error('Delete error:', err)
        toast.error('Failed to delete media')
      }
    },
    []
  )

  // Toggle selection
  const toggleSelect = useCallback(
    (url: string) => {
      setSelectedUrls((prev) => {
        if (prev.includes(url)) {
          return prev.filter((u) => u !== url)
        }
        if (multiple) {
          if (maxSelect && prev.length >= maxSelect) {
            toast.warning(`Maximum ${maxSelect} selections allowed`)
            return prev
          }
          return [...prev, url]
        }
        return [url]
      })
    },
    [multiple, maxSelect]
  )

  // Handle confirm selection
  const handleConfirm = useCallback(() => {
    if (selectedUrls.length > 0) {
      onSelect(selectedUrls)
      onOpenChange(false)
      setSelectedUrls([])
    }
  }, [selectedUrls, onSelect, onOpenChange])

  // Handle dialog close
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setSelectedUrls([])
        setSearchQuery('')
        setPreviewItem(null)
      }
      onOpenChange(newOpen)
    },
    [onOpenChange]
  )

  // Drag & drop handlers
  const [isDragOver, setIsDragOver] = useState(false)

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

  // Load more
  const handleLoadMore = useCallback(() => {
    fetchMedia(false)
  }, [fetchMedia])

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent
            className="max-w-4xl sm:max-w-4xl w-[calc(100%-2rem)] max-h-[90vh] flex flex-col p-0 gap-0"
            showCloseButton={false}
          >
          {/* Header */}
          <DialogHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Media Gallery
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {total > 0 ? `${total} media item${total !== 1 ? 's' : ''}` : 'Browse and select media'}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Left Panel: Gallery Browser */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r-0 md:border-r">
              {/* Search */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Folder Tabs */}
              <div className="px-3 py-2 border-b overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                  {FOLDERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setActiveFolder(f.value)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                        activeFolder === f.value
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Grid */}
              <ScrollArea className="flex-1">
                <div className="p-3">
                  {loading && mediaItems.length === 0 ? (
                    // Skeleton loading
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="aspect-square w-full rounded-lg" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : mediaItems.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <FolderOpen className="h-12 w-12 mb-3 opacity-50" />
                      <p className="text-sm font-medium">No media found</p>
                      <p className="text-xs mt-1">
                        Upload images using the panel on the right
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <AnimatePresence mode="popLayout">
                          {mediaItems.map((item, index) => {
                            const isSelected = selectedUrls.includes(item.url)
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{
                                  duration: 0.2,
                                  delay: index * 0.03,
                                }}
                                className={`group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10'
                                    : 'border-transparent hover:border-emerald-200 dark:hover:border-emerald-800'
                                }`}
                                onClick={() => toggleSelect(item.url)}
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

                                  {/* Selected overlay */}
                                  {isSelected && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center"
                                    >
                                      <div className="bg-emerald-500 rounded-full p-1">
                                        <Check className="h-4 w-4 text-white" />
                                      </div>
                                    </motion.div>
                                  )}

                                  {/* Delete button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setDeleteTarget(item)
                                    }}
                                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/90 hover:bg-red-600 text-white rounded-full p-1 shadow-sm"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>

                                  {/* Preview button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setPreviewItem(item)
                                    }}
                                    className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-full p-1 shadow-sm"
                                  >
                                    <Search className="h-3 w-3" />
                                  </button>

                                  {/* Size badge */}
                                  <div className="absolute bottom-1 right-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-1 py-0 h-4 bg-black/60 text-white border-0 hover:bg-black/80"
                                    >
                                      {formatFileSize(item.size)}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Filename */}
                                <div className="px-2 py-1.5 bg-background">
                                  <p
                                    className="text-xs text-foreground truncate"
                                    title={item.originalName}
                                  >
                                    {truncateName(item.originalName)}
                                  </p>
                                </div>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>

                      {/* Load More */}
                      {hasMore && (
                        <div className="flex justify-center mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLoadMore}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right Panel: Upload Area */}
            <div className="w-full md:w-72 lg:w-80 border-t md:border-t-0 p-4 flex flex-col">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-600" />
                Upload Files
              </h3>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-muted-foreground/25 hover:border-emerald-400 hover:bg-muted/50'
                }`}
              >
                <Upload
                  className={`h-8 w-8 mx-auto mb-2 transition-colors ${
                    isDragOver
                      ? 'text-emerald-500'
                      : 'text-muted-foreground'
                  }`}
                />
                <p className="text-sm font-medium text-foreground">
                  Drag & drop images here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  JPG, PNG, GIF, WebP, SVG (max 5MB)
                </p>
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
                  <h4 className="text-xs font-medium text-muted-foreground">
                    Uploading...
                  </h4>
                  {Object.entries(uploadProgress).map(([name, progress]) => (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground truncate max-w-[160px]">
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

              {/* Quick stats */}
              <div className="mt-auto pt-4">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-3 w-3" />
                    <span>{total} total items</span>
                  </div>
                  {activeFolder && (
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-3 w-3" />
                      <span>Folder: {FOLDERS.find((f) => f.value === activeFolder)?.label || activeFolder}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-3 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              {selectedUrls.length > 0 ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
                  <Check className="h-3 w-3" />
                  {selectedUrls.length} selected
                  {maxSelect ? ` (max ${maxSelect})` : ''}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {multiple ? 'Select one or more images' : 'Click an image to select it'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={selectedUrls.length === 0 || uploading}
                onClick={handleConfirm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    Select{selectedUrls.length > 1 ? ` (${selectedUrls.length})` : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Image Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(isOpen) => { if (!isOpen) setPreviewItem(null) }}>
        <DialogContent className="max-w-2xl p-2">
          {previewItem && (
            <div className="space-y-2">
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
              <div className="px-2 pb-1 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {previewItem.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(previewItem.size)} &middot; {previewItem.mimeType} &middot; {previewItem.folder}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toggleSelect(previewItem.url)
                      setPreviewItem(null)
                    }}
                  >
                    {selectedUrls.includes(previewItem.url) ? (
                      <>
                        <X className="h-3 w-3" />
                        Deselect
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" />
                        Select
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
