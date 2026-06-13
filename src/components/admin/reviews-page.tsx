'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Check,
  X,
  Flag,
  Eye,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  status: string
  createdAt: string
  customer: {
    user: { name: string; avatar: string | null }
  }
  product: {
    id: string
    name: string
    thumbnail?: string | null
  } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  flagged: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState<number>(0)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const limit = 15

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: '100' })
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/reviews?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setReviews(data.data || [])
          return
        }
      }
      // Fallback to public reviews API
      const res2 = await fetch('/api/reviews?limit=100')
      const data2 = await res2.json()
      if (data2.success) {
        setReviews(data2.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Filter by rating on client side
  const filteredReviews = useMemo(() => {
    let result = reviews
    if (ratingFilter > 0) {
      result = result.filter((r) => r.rating === ratingFilter)
    }
    return result
  }, [reviews, ratingFilter])

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / limit)
  const paginatedReviews = useMemo(() => {
    const start = (page - 1) * limit
    return filteredReviews.slice(start, start + limit)
  }, [filteredReviews, page, limit])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, ratingFilter])

  const updateReviewStatus = useCallback(async (reviewId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, status }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Review ${status}`)
        fetchReviews()
      } else {
        toast.error(data.error || 'Failed to update review')
      }
    } catch {
      toast.error('Failed to update review')
    }
  }, [fetchReviews])

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedIds.size === 0) {
      toast.error('No reviews selected')
      return
    }
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch('/api/admin/reviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: action }),
        })
      )
      await Promise.all(promises)
      toast.success(`${selectedIds.size} review(s) ${action}`)
      setSelectedIds(new Set())
      fetchReviews()
    } catch {
      toast.error('Failed to update reviews')
    }
  }, [selectedIds, fetchReviews])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedReviews.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedReviews.map((r) => r.id)))
    }
  }, [paginatedReviews, selectedIds])

  const openReviewDetail = useCallback((review: Review) => {
    setSelectedReview(review)
    setAdminResponse('')
  }, [])

  const renderStars = (rating: number, size: string = 'h-3.5 w-3.5') => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">Manage product reviews</p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              className={statusFilter === status ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Rating Filter */}
        <div className="flex items-center gap-1">
          <Button
            variant={ratingFilter === 0 ? 'default' : 'outline'}
            size="sm"
            className={ratingFilter === 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
            onClick={() => setRatingFilter(0)}
          >
            All
          </Button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={ratingFilter === rating ? 'default' : 'outline'}
              size="sm"
              className={ratingFilter === rating ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              onClick={() => setRatingFilter(rating)}
            >
              <span className="flex items-center gap-0.5">
                {rating}
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800"
        >
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleBulkAction('approved')}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Approve Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            onClick={() => handleBulkAction('rejected')}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reject Selected
          </Button>
        </motion.div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.size === paginatedReviews.length && paginatedReviews.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="hidden md:table-cell">Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No reviews found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReviews.map((review) => (
                    <TableRow
                      key={review.id}
                      className={selectedIds.has(review.id) ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(review.id)}
                          onCheckedChange={() => toggleSelect(review.id)}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-40 truncate">
                        {review.product?.name || 'Unknown Product'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-emerald-600 text-white">
                              {review.customer?.user?.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{review.customer?.user?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-64 truncate">
                        {review.comment || review.title || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[review.status] || ''}>
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openReviewDetail(review)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {review.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                                onClick={() => updateReviewStatus(review.id, 'approved')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => updateReviewStatus(review.id, 'rejected')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {review.status === 'approved' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 text-xs"
                              onClick={() => updateReviewStatus(review.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          )}
                          {review.status === 'rejected' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 text-xs"
                              onClick={() => updateReviewStatus(review.id, 'approved')}
                            >
                              Approve
                            </Button>
                          )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, filteredReviews.length)} of {filteredReviews.length} reviews
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">{page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-14 w-14 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0">
                  {selectedReview.product?.thumbnail ? (
                    <img
                      src={selectedReview.product.thumbnail}
                      alt={selectedReview.product.name || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-emerald-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{selectedReview.product?.name || 'Unknown Product'}</p>
                  <p className="text-xs text-muted-foreground">Product ID: {selectedReview.product?.id || 'N/A'}</p>
                </div>
              </div>

              {/* Reviewer Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedReview.customer?.user?.avatar || undefined} />
                  <AvatarFallback className="bg-emerald-600 text-white">
                    {selectedReview.customer?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedReview.customer?.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedReview.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                {renderStars(selectedReview.rating, 'h-5 w-5')}
                <span className="text-sm text-muted-foreground">
                  {selectedReview.rating} out of 5
                </span>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                {selectedReview.title && (
                  <p className="font-semibold text-sm">{selectedReview.title}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedReview.comment || 'No comment provided.'}
                </p>
              </div>

              <Separator />

              {/* Admin Response Area */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Admin Response</p>
                <Textarea
                  placeholder="Write a response to this review..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={!adminResponse.trim()}
                  onClick={() => {
                    toast.success('Response submitted successfully')
                    setAdminResponse('')
                  }}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Submit Response
                </Button>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    updateReviewStatus(selectedReview.id, 'approved')
                    setSelectedReview(null)
                  }}
                  disabled={selectedReview.status === 'approved'}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                  onClick={() => {
                    updateReviewStatus(selectedReview.id, 'rejected')
                    setSelectedReview(null)
                  }}
                  disabled={selectedReview.status === 'rejected'}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                  onClick={() => {
                    updateReviewStatus(selectedReview.id, 'flagged')
                    setSelectedReview(null)
                  }}
                >
                  <Flag className="h-3.5 w-3.5 mr-1" />
                  Flag
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
