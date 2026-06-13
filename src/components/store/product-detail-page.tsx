'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useCartStore } from '@/stores/cart-store'
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import {
  fetchProduct,
  fetchProducts,
  submitReview,
  type Product,
  formatPrice,
  getDiscountPercentage,
} from '@/lib/api'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Check,
  ZoomIn,
  X,
  Weight,
  Ruler,
  Package as PackageIcon,
  Tag,
  Clock,
  MessageCircleQuestion,
  Send,
  User as UserIcon,
  Sparkles,
  Brain,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Bell,
  Mail,
  ClipboardList,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import { SocialShare } from '@/components/store/social-share'
import { SizeGuide } from '@/components/store/size-guide'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

interface QuestionAnswer {
  question: string
  answer: string
  askedBy: string
  date: string
}

const DEMO_QUESTIONS: QuestionAnswer[] = [
  {
    question: 'Is this product compatible with iPhone 15?',
    answer: 'Yes, it is fully compatible with iPhone 15 and all recent models.',
    askedBy: 'John D.',
    date: 'Jan 15, 2025',
  },
  {
    question: 'Does it come with a warranty?',
    answer: 'Yes, all our products come with a 1-year manufacturer warranty.',
    askedBy: 'Sarah M.',
    date: 'Feb 3, 2025',
  },
  {
    question: 'What is the return policy?',
    answer: 'We offer a 30-day hassle-free return policy for all unused items in original packaging.',
    askedBy: 'Mike R.',
    date: 'Feb 20, 2025',
  },
]

export function ProductDetailPage() {
  const pageParams = useNavStore((s) => s.pageParams)
  const navigateStore = useNavStore((s) => s.navigateStore)
  const addItem = useCartStore((s) => s.addItem)
  const setOpen = useCartStore((s) => s.setOpen)
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addItem)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const isWishlisted = useWishlistStore((s) => product ? s.isWishlisted(product.id) : false)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [showStickyBar, setShowStickyBar] = useState(false)

  // Zoom state - CSS transform-based zoom
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [isZooming, setIsZooming] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(0)

  // Review form
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewFormVisible, setReviewFormVisible] = useState(true)
  const REVIEW_MAX_CHARS = 500

  // Q&A state
  const [questionText, setQuestionText] = useState('')
  const [questions, setQuestions] = useState<QuestionAnswer[]>(DEMO_QUESTIONS)

  // Size Guide state
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  // Notify me state
  const [showNotifyForm, setShowNotifyForm] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifySubmitted, setNotifySubmitted] = useState(false)

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [frequentlyBought, setFrequentlyBought] = useState<Product[]>([])

  // AI Recommended products
  const [aiRecommended, setAiRecommended] = useState<Product[]>([])

  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageParams.id) {
      setLoading(false)
      return
    }
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetchProduct(pageParams.id)
        setProduct(res.data)
        // Add to recently viewed
        addRecentlyViewed({
          id: res.data.id,
          name: res.data.name,
          slug: res.data.slug,
          thumbnail: res.data.thumbnail || '',
          price: res.data.sellingPrice,
          discountPrice: res.data.discountPrice,
        })
        // Load related products from same category
        if (res.data.categoryId) {
          const relRes = await fetchProducts({
            category: res.data.category?.slug || '',
            limit: '4',
          })
          setRelatedProducts(relRes.data.filter((p) => p.id !== res.data.id))
        }
        // Load frequently bought together (best sellers from same category)
        const fbRes = await fetchProducts({ bestSeller: 'true', limit: '3' })
        setFrequentlyBought(fbRes.data.filter((p) => p.id !== res.data.id).slice(0, 3))

        // Load AI recommended products: 2 from same category, 1 from same brand, 1 best seller
        const aiProducts: Product[] = []
        const excludeIds = new Set([res.data.id])

        // Same category (2 products)
        if (res.data.categoryId) {
          const catRes = await fetchProducts({
            category: res.data.category?.slug || '',
            limit: '4',
          })
          const catProds = catRes.data.filter((p) => !excludeIds.has(p.id))
          catProds.slice(0, 2).forEach((p) => {
            aiProducts.push(p)
            excludeIds.add(p.id)
          })
        }

        // Same brand (1 product)
        if (res.data.brandId) {
          const brandRes = await fetchProducts({
            brand: res.data.brand?.slug || '',
            limit: '4',
          })
          const brandProd = brandRes.data.find((p) => !excludeIds.has(p.id))
          if (brandProd) {
            aiProducts.push(brandProd)
            excludeIds.add(brandProd.id)
          }
        }

        // Best seller (1 product)
        const bsRes = await fetchProducts({ bestSeller: 'true', limit: '5' })
        const bsProd = bsRes.data.find((p) => !excludeIds.has(p.id))
        if (bsProd) {
          aiProducts.push(bsProd)
        }

        setAiRecommended(aiProducts.slice(0, 4))
      } catch {
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [pageParams.id, addRecentlyViewed])

  // Sticky add-to-cart bar - detect when main CTA is out of view
  useEffect(() => {
    const handleScroll = () => {
      if (!ctaRef.current) return
      const rect = ctaRef.current.getBoundingClientRect()
      setShowStickyBar(rect.bottom < 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Zoom handlers - CSS transform-based
  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomOrigin({ x, y })
  }, [])

  const handleImageMouseEnter = useCallback(() => {
    setIsZooming(true)
  }, [])

  const handleImageMouseLeave = useCallback(() => {
    setIsZooming(false)
  }, [])

  // Images memo — filters by variant when one is selected
  const images = useMemo(() => {
    if (!product) return []
    const variantId = currentVariant?.id
    const imgs: string[] = []

    // Always include product thumbnail
    if (product.thumbnail && !variantId) imgs.push(product.thumbnail)
    else if (currentVariant?.thumbnail && !imgs.includes(currentVariant.thumbnail)) {
      imgs.push(currentVariant.thumbnail)
    } else if (product.thumbnail) imgs.push(product.thumbnail)

    // Filter images by variant when a variant is selected
    if (product.images?.length) {
      product.images.forEach((img) => {
        if (variantId && img.variantId && img.variantId !== variantId) return
        if (!imgs.includes(img.url)) imgs.push(img.url)
      })
    }
    if (product.gallery) {
      try {
        const gallery = JSON.parse(product.gallery) as string[]
        gallery.forEach((url) => {
          if (!imgs.includes(url)) imgs.push(url)
        })
      } catch { /* ignore */ }
    }
    if (imgs.length === 0) {
      imgs.push(`https://picsum.photos/seed/${product.slug}/800/800`)
    }
    return imgs
  }, [product, currentVariant])

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setLightboxImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
      } else if (e.key === 'ArrowRight') {
        setLightboxImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'Escape') {
        setLightboxOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, images.length])

  // Sync lightbox image with selected image when opening
  useEffect(() => {
    if (lightboxOpen) {
      setLightboxImage(selectedImage)
    }
  }, [lightboxOpen, selectedImage])

  const currentVariant = useMemo(() => {
    const selected = selectedOptions
    const slugs = Object.keys(selected)
    if (slugs.length === 0) {
      // No combination selected — use selectedVariant as fallback for backward compat
      return product?.variants?.find((v) => v.id === selectedVariant) || null
    }
    return (
      product?.variants?.find((v) =>
        slugs.every((slug) =>
          v.attributeValues?.some(
            (av) => av.attributeValue.attribute.slug === slug && av.attributeValue.value === selected[slug]
          )
        )
      ) || null
    )
  }, [product, selectedOptions, selectedVariant])

  // Group variant attributes with availability per value
  const variantAttributes = useMemo(() => {
    if (!product?.variants?.length) return {}
    const attrs: Record<string, { name: string; values: Set<string>; meta?: Record<string, string> }> = {}
    const allValuesBySlug: Record<string, Record<string, string[]>> = {}

    product.variants.forEach((v) => {
      v.attributeValues?.forEach((av) => {
        const attrSlug = av.attributeValue.attribute.slug
        if (!attrs[attrSlug]) {
          attrs[attrSlug] = { name: av.attributeValue.attribute.name, values: new Set(), meta: {} }
        }
        attrs[attrSlug].values.add(av.attributeValue.value)
        if (av.attributeValue.meta) attrs[attrSlug].meta![av.attributeValue.value] = av.attributeValue.meta
        // Track which variant IDs offer this value
        if (!allValuesBySlug[attrSlug]) allValuesBySlug[attrSlug] = {}
        if (!allValuesBySlug[attrSlug][av.attributeValue.value]) allValuesBySlug[attrSlug][av.attributeValue.value] = []
        allValuesBySlug[attrSlug][av.attributeValue.value].push(v.id)
      })
    })

    // Mark each value as available or disabled based on current selection
    const selected = selectedOptions
    const availability: Record<string, { available: boolean }> = {}
    for (const [slug, vals] of Object.entries(allValuesBySlug)) {
      for (const [value, variantIds] of Object.entries(vals)) {
        const otherSelected = { ...selected }
        delete otherSelected[slug]
        // A value is available if there exists a variant matching all OTHER selected options
        let available = true
        const otherEntries = Object.entries(otherSelected)
        if (otherEntries.length > 0) {
          available = variantIds.some((vid) =>
            otherEntries.every(([oslug, ovalue]) =>
              product.variants?.some(
                (pv) =>
                  pv.id === vid &&
                  pv.attributeValues?.some(
                    (pav) => pav.attributeValue.attribute.slug === oslug && pav.attributeValue.value === ovalue
                  )
              )
            )
          )
        }
        availability[`${slug}:${value}`] = { available }
      }
    }

    // Attach availability as a hidden property on the values set for lookups
    ;(attrs as any)._availability = availability
    return attrs
  }, [product, selectedOptions])

  const specifications = useMemo(() => {
    if (!product?.specifications) return []
    try {
      const parsed = JSON.parse(product.specifications)
      // Support both object format {"Driver":"46mm"} and array format [{label,value}]
      if (Array.isArray(parsed)) return parsed as Array<{ label: string; value: string }>
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.entries(parsed).map(([label, value]) => ({ label, value: String(value) }))
      }
      return []
    } catch {
      return []
    }
  }, [product])

  const featuresList = useMemo(() => {
    if (!product?.features) return []
    try {
      const parsed = JSON.parse(product.features)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [product])

  // Image Auto-Play state
  const [autoPlay, setAutoPlay] = useState(true)
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoPlayResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-play effect: cycle images every 4 seconds
  useEffect(() => {
    if (!autoPlay || images.length <= 1) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
      return
    }
    autoPlayTimerRef.current = setInterval(() => {
      setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }, 4000)
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
    }
  }, [autoPlay, images.length])

  // Pause auto-play when user manually selects an image, resume after 8 seconds
  const handleManualImageSelect = useCallback((idx: number) => {
    setSelectedImage(idx)
    setAutoPlay(false)
    if (autoPlayResumeTimerRef.current) clearTimeout(autoPlayResumeTimerRef.current)
    autoPlayResumeTimerRef.current = setTimeout(() => {
      setAutoPlay(true)
    }, 8000)
  }, [])

  // Rating distribution calculation
  const ratingDistribution = useMemo(() => {
    if (!product?.reviews || product.reviews.length === 0) {
      return [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percentage: 0 }))
    }
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    product.reviews.forEach((r) => {
      const rating = Math.round(r.rating)
      if (rating >= 1 && rating <= 5) counts[rating]++
    })
    const total = product.reviews.length
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      percentage: total > 0 ? Math.round((counts[star] / total) * 100) : 0,
    }))
  }, [product])

  const effectivePrice = currentVariant?.discountPrice || currentVariant?.price || product?.discountPrice || product?.sellingPrice || 0
  const originalPrice = currentVariant?.price || product?.sellingPrice || 0
  const discount = effectivePrice < originalPrice ? getDiscountPercentage(originalPrice, effectivePrice) : 0
  const stock = currentVariant?.inventory?.quantity ?? product?.inventory?.quantity ?? 0

  // Check if product is Clothing or Shoes for Size Guide
  const isSizeGuideVisible = useMemo(() => {
    if (!product?.category) return false
    const catName = product.category.name.toLowerCase()
    const catSlug = product.category.slug.toLowerCase()
    return catName.includes('clothing') || catName.includes('shoe') || catName.includes('apparel') || catName.includes('fashion') || catSlug.includes('clothing') || catSlug.includes('shoe') || catSlug.includes('apparel') || catSlug.includes('fashion')
  }, [product])

  const handleAddToCart = useCallback(() => {
    if (!product || stock === 0) return
    // Validate variant selection (combination-based or single)
    if (product.variants && product.variants.length > 0 && !currentVariant) {
      toast.error('Please select all options before adding to cart')
      return
    }
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      thumbnail: product.thumbnail || '',
      variantId: currentVariant?.id || undefined,
      variantName: currentVariant?.name || undefined,
      sku: currentVariant?.sku || product.sku,
      price: originalPrice,
      discountPrice: effectivePrice < originalPrice ? effectivePrice : undefined,
      quantity,
      stock,
    })
    toast.success(`${product.name} added to cart`)
    setOpen(true)
  }, [product, currentVariant, quantity, stock, addItem, setOpen, originalPrice, effectivePrice])

  const handleBuyNow = useCallback(() => {
    handleAddToCart()
    setOpen(false)
    navigateStore('checkout')
  }, [handleAddToCart, setOpen, navigateStore])

  const handleSubmitReview = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!product) return
      // Validation
      if (!reviewerName.trim()) {
        toast.error('Please enter your name')
        return
      }
      if (!reviewTitle.trim()) {
        toast.error('Please enter a review title')
        return
      }
      if (reviewComment.trim().length < 10) {
        toast.error('Review must be at least 10 characters')
        return
      }
      setSubmittingReview(true)
      try {
        // Prepend to local reviews list immediately
        const newReview = {
          id: `local-${Date.now()}`,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          createdAt: new Date().toISOString(),
          customer: {
            user: {
              name: reviewerName,
              avatar: null,
            },
          },
        }
        setProduct((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            reviews: [newReview as typeof prev.reviews[0], ...(prev.reviews || [])],
            reviewCount: prev.reviewCount + 1,
          }
        })
        toast.success('Review submitted successfully!')
        setReviewTitle('')
        setReviewComment('')
        setReviewerName('')
        setReviewRating(5)
        setReviewFormVisible(false)
        setTimeout(() => setReviewFormVisible(true), 300)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to submit review')
      } finally {
        setSubmittingReview(false)
      }
    },
    [product, reviewRating, reviewTitle, reviewComment, reviewerName]
  )

  // Spec icon mapping
  const getSpecIcon = (label: string) => {
    const l = label.toLowerCase()
    if (l.includes('weight')) return <Weight className="h-4 w-4 text-emerald-500" />
    if (l.includes('dimension') || l.includes('size') || l.includes('length') || l.includes('width') || l.includes('height')) return <Ruler className="h-4 w-4 text-emerald-500" />
    if (l.includes('material') || l.includes('color')) return <Tag className="h-4 w-4 text-emerald-500" />
    if (l.includes('warranty') || l.includes('delivery') || l.includes('shipping')) return <Clock className="h-4 w-4 text-emerald-500" />
    return <PackageIcon className="h-4 w-4 text-emerald-500" />
  }

  if (loading) return <ProductDetailSkeleton />
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => navigateStore('products')} className="bg-emerald-600 hover:bg-emerald-700">
          Browse Products
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6 overflow-x-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Breadcrumb */}
      <BreadcrumbNav items={[
        { label: 'Products', page: 'products' },
        ...(product.category ? [{ label: product.category.name, page: 'products' as const, params: { category: product.category.slug } }] : []),
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery with Zoom Lens */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="relative">
            {/* Main image with CSS zoom on hover */}
            <div
              ref={imageContainerRef}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}
              onMouseMove={handleImageMouseMove}
              onMouseEnter={handleImageMouseEnter}
              onMouseLeave={handleImageMouseLeave}
            >
              {/* Crossfade image transition */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={isZooming ? {
                    transform: 'scale(2)',
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  } : undefined}
                />
              </AnimatePresence>
              {!isZooming && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-80 transition-opacity duration-300 drop-shadow-lg" />
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-red-500/90 text-white border-0 text-sm shadow-lg shadow-red-500/20 backdrop-blur-sm">
                  -{discount}% OFF
                </Badge>
              )}

              {/* Image Counter Badge - top right */}
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {selectedImage + 1}/{images.length}
                </div>
              )}

              {/* Auto-play Toggle Button */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setAutoPlay(!autoPlay)
                    if (autoPlayResumeTimerRef.current) clearTimeout(autoPlayResumeTimerRef.current)
                  }}
                  className="absolute bottom-3 right-3 z-10 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
                  aria-label={autoPlay ? 'Pause auto-play' : 'Play auto-play'}
                >
                  {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                </button>
              )}

              {/* Left Arrow Navigation */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleManualImageSelect(selectedImage > 0 ? selectedImage - 1 : images.length - 1)
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Right Arrow Navigation */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleManualImageSelect(selectedImage < images.length - 1 ? selectedImage + 1 : 0)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filmstrip / Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleManualImageSelect(idx)}
                  className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                    selectedImage === idx
                      ? 'border-emerald-500 shadow-md shadow-emerald-500/20 scale-105 ring-emerald-glow'
                      : 'border-transparent hover:border-emerald-300/50 hover:scale-105'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {/* Active indicator overlay */}
                  {selectedImage === idx && (
                    <div className="absolute inset-0 bg-emerald-500/10" />
                  )}
                  {/* Video Support Badge on first thumbnail */}
                  {idx === 0 && (product as Product & { videos?: string }).videos && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-3 w-3 text-emerald-700 fill-emerald-700 ml-0.5" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Fullscreen Lightbox */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightboxOpen(false)}
            >
              {/* Close button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Image Counter at bottom */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
                {lightboxImage + 1} / {images.length}
              </div>

              {/* Left arrow */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Right arrow */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Main image */}
              <motion.img
                key={lightboxImage}
                src={images[lightboxImage]}
                alt={product.name}
                className="max-h-[85vh] max-w-[90vw] object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Info */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div>
            {product.brand && (
              <p className="text-sm text-emerald-600 font-medium mb-1">{product.brand.name}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              {product.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(product.averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
              <span className="text-sm text-muted-foreground">SKU: {currentVariant?.sku || product.sku}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className={`text-3xl font-bold ${discount > 0 ? 'price-shimmer' : 'text-emerald-600'}`}>{formatPrice(effectivePrice)}</span>
            {discount > 0 && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
            )}
            {discount > 0 && (
              <Badge className="bg-red-100 text-red-600 border-0">Save {formatPrice(originalPrice - effectivePrice)}</Badge>
            )}
          </div>

          <Separator />

          {/* Variant Selectors - Combination-based */}
          {Object.entries(variantAttributes).map(([slug, attr]) => {
            const availability = (variantAttributes as any)._availability || {}
            return (
              <div key={slug}>
                <p className="text-sm font-medium mb-2">
                  {attr.name}: <span className="text-muted-foreground font-normal">{selectedOptions[slug] ? selectedOptions[slug] : `Select ${attr.name.toLowerCase()}`}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(attr.values).map((value) => {
                    const isColor = slug === 'color'
                    const colorCode = attr.meta?.[value]
                    const isSelected = selectedOptions[slug] === value
                    const { available } = availability[`${slug}:${value}`] || { available: true }
                    return (
                      <motion.button
                        key={value}
                        disabled={!available}
                        className={
                          isColor && colorCode
                            ? `w-10 h-10 p-0 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'border-emerald-500 shadow-md shadow-emerald-500/20 variant-ring-pulse' : !available ? 'border-gray-200 opacity-40 cursor-not-allowed' : 'border-muted hover:border-emerald-300'}`
                            : `px-4 py-2 text-sm rounded-lg border-2 font-medium transition-all duration-200 ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-md shadow-emerald-500/10 variant-ring-pulse' : !available ? 'border-gray-200 opacity-40 cursor-not-allowed line-through' : 'border-muted hover:border-emerald-300 hover:text-emerald-600'}`
                        }
                        onClick={() => {
                          setSelectedOptions((prev) => {
                            // Toggle off if clicking the same value
                            if (prev[slug] === value) {
                              const next = { ...prev }
                              delete next[slug]
                              return next
                            }
                            return { ...prev, [slug]: value }
                          })
                        }}
                        whileHover={available ? { scale: 1.05 } : {}}
                        whileTap={available ? { scale: 0.95 } : {}}
                      >
                        {isColor && colorCode ? (
                          <div
                            className={`w-7 h-7 rounded-full transition-all duration-200 ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background' : ''}`}
                            style={{ backgroundColor: colorCode }}
                          />
                        ) : (
                          <span>
                            {value}
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Variant pills */}
          {product.variants && product.variants.length > 0 && Object.keys(variantAttributes).length === 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Options:</p>
                {isSizeGuideVisible && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 gap-1"
                    onClick={() => setSizeGuideOpen(true)}
                  >
                    <Ruler className="h-3 w-3" />
                    Size Guide
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <motion.button
                    key={variant.id}
                    className={`px-4 py-2 text-sm rounded-lg border-2 font-medium transition-all duration-200 ${
                      selectedVariant === variant.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 variant-ring-pulse'
                        : 'border-muted hover:border-emerald-300 hover:text-emerald-600'
                    }`}
                    onClick={() => {
                      setSelectedOptions({})
                      setSelectedVariant(variant.id)
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {variant.name}
                    {variant.discountPrice && variant.discountPrice < variant.price && (
                      <span className="ml-1 text-xs opacity-70">
                        {formatPrice(variant.discountPrice)}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Size Guide button for attribute-based variants */}
          {isSizeGuideVisible && Object.keys(variantAttributes).length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 gap-1"
                onClick={() => setSizeGuideOpen(true)}
              >
                <Ruler className="h-3 w-3" />
                Size Guide
              </Button>
            </div>
          )}

          {/* Size Guide Dialog */}
          <SizeGuide
            open={sizeGuideOpen}
            onOpenChange={setSizeGuideOpen}
            defaultTab={product.category?.slug?.toLowerCase().includes('shoe') ? 'shoes' : 'clothing'}
          />

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {stock > 0 ? (
                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="h-4 w-4" /> In Stock ({stock} available)
                </span>
              ) : (
                <span className="text-sm text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3">
            {stock === 0 ? (
              <motion.div
                className="flex-1"
                initial={false}
                animate={showNotifyForm ? {} : { scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Button
                  className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all duration-300"
                  onClick={() => setShowNotifyForm(true)}
                >
                  <Bell className="h-5 w-5 mr-2" />
                  Notify Me When Available
                </Button>
              </motion.div>
            ) : (
              <>
                <Button
                  className="flex-1 h-12 text-base bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all duration-300"
                  onClick={handleAddToCart}
                  disabled={product.variants && product.variants.length > 0 && !currentVariant}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.variants && product.variants.length > 0 && !currentVariant ? 'Select Options' : 'Add to Cart'}
                </Button>
                <Button
                  className="flex-1 h-12 text-base bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all duration-300"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </>
            )}
          </div>

          {/* Notify Me Form (shown when out of stock) */}
          <AnimatePresence>
            {showNotifyForm && stock === 0 && !notifySubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Get notified when back in stock</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="flex-1 h-9 bg-background border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500"
                    />
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="sm"
                      onClick={() => {
                        if (!notifyEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) {
                          toast.error('Please enter a valid email address')
                          return
                        }
                        // Store in localStorage
                        try {
                          const key = 'shophub-stock-notifications'
                          const stored = localStorage.getItem(key)
                          const notifications = stored ? JSON.parse(stored) as Array<{ productId: string; email: string }> : []
                          notifications.push({ productId: product.id, email: notifyEmail.trim() })
                          localStorage.setItem(key, JSON.stringify(notifications))
                        } catch { /* ignore */ }
                        toast.success("You'll be notified when this item is back in stock!")
                        setNotifySubmitted(true)
                        setNotifyEmail('')
                      }}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Notify Me
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notify Submitted Confirmation */}
          <AnimatePresence>
            {notifySubmitted && stock === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-700 dark:text-emerald-300">You&apos;ll be notified when this item is back in stock!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                toggleWishlist(product.id)
                toast.success(!isWishlisted ? 'Added to wishlist' : 'Removed from wishlist')
              }}
            >
              <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </Button>
            <SocialShare productName={product.name} />
          </div>

          <Separator />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-[11px] font-semibold">Free Shipping</span>
              <span className="text-[10px] text-muted-foreground">Over $50</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-[11px] font-semibold">Secure Payment</span>
              <span className="text-[10px] text-muted-foreground">100% Protected</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-[11px] font-semibold">Easy Returns</span>
              <span className="text-[10px] text-muted-foreground">30 Days</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Add to Cart Bar */}
      <AnimatePresence>
        {showStickyBar && stock > 0 && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t shadow-lg"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {product.thumbnail && (
                  <img src={product.thumbnail} alt={product.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-sm font-bold text-emerald-600">{formatPrice(effectivePrice)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center border rounded-lg shadow-sm">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                  onClick={handleAddToCart}
                  disabled={product.variants && product.variants.length > 0 && !currentVariant}
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5" />
                  {product.variants && product.variants.length > 0 && !currentVariant ? 'Select Options' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Frequently Bought Together</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {frequentlyBought.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* AI Recommended For You */}
      {aiRecommended.length > 0 && (
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-6 relative overflow-hidden">
            {/* Shimmer animation overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ animation: 'shimmer-slide 3s ease-in-out infinite' }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">AI Recommended For You</h2>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs px-2 py-0.5">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Pick
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Personalized picks based on your interests</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiRecommended.map((p) => (
                  <div key={p.id} className="relative">
                    <ProductCard product={p} />
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-[10px] px-1.5 py-0 z-10">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                      AI Pick
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Tabs: Description, Specs, Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Tabs defaultValue="description" className="mb-12" onValueChange={() => {
          // Smooth scroll to tabs section on tab change
          const tabsEl = document.querySelector('[data-tabs-section]')
          if (tabsEl) {
            tabsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }} data-tabs-section>
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 transition-all"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 transition-all"
            >
              <ClipboardList className="h-4 w-4 mr-1.5" />
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 transition-all"
            >
              Reviews ({product.reviewCount})
            </TabsTrigger>
            <TabsTrigger
              value="qa"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 transition-all"
            >
              <MessageCircleQuestion className="h-4 w-4 mr-1.5" />
              Q&A ({questions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }}
            />
          </TabsContent>

          <TabsContent value="specifications" className="pt-6">
            {specifications.length > 0 ? (
              <div className="max-w-2xl space-y-4">
                {/* Specifications Table */}
                <div className="border rounded-xl overflow-x-auto">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr className="bg-emerald-50 dark:bg-emerald-950/30">
                        <th className="text-left text-sm font-semibold px-4 py-3 w-2/5">Specification</th>
                        <th className="text-left text-sm font-semibold px-4 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specifications.map((spec, idx) => (
                        <tr
                          key={idx}
                          className={`${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'} hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-colors`}
                        >
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {getSpecIcon(spec.label)}
                              <span>{spec.label.replace(/_/g, ' ')}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Copy Specs Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 gap-1.5"
                  onClick={() => {
                    const specText = specifications.map((s) => `${s.label}: ${s.value}`).join('\n')
                    navigator.clipboard.writeText(specText).then(() => {
                      toast.success('Specifications copied to clipboard!')
                    }).catch(() => {
                      toast.error('Failed to copy specifications')
                    })
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Specs
                </Button>

                {/* Feature Badges */}
                {featuresList.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Key Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {featuresList.map((feature, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300 gap-1 py-1 px-3"
                        >
                          <Check className="h-3 w-3" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No specifications available.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Review summary with rating distribution */}
              <div className="space-y-4">
                {/* Enhanced rating summary card */}
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-emerald-600 mb-1">{product.averageRating.toFixed(1)}</div>
                    <div className="flex justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(product.averageRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on {product.reviewCount} reviews
                    </p>
                  </div>

                  {/* Rating Distribution Bars */}
                  <div className="space-y-2">
                    {ratingDistribution.map(({ star, count, percentage }) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs font-medium w-3 text-right">{star}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-1 h-2.5 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: (5 - star) * 0.1 }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{percentage}%</span>
                        <span className="text-xs text-muted-foreground w-5 text-right">({count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write review form */}
                <AnimatePresence>
                  {reviewFormVisible && (
                    <motion.div
                      className="border rounded-xl p-4 space-y-3"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <h4 className="font-semibold">Write a Review</h4>
                      <div>
                        <p className="text-sm mb-1">Rating</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setReviewRating(star)}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Star
                                className={`h-7 w-7 cursor-pointer transition-colors ${
                                  star <= (hoverRating || reviewRating) ? 'fill-emerald-500 text-emerald-500' : 'text-gray-300'
                                }`}
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Your Name *</Label>
                        <Input
                          placeholder="Enter your name"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Review Title *</Label>
                        <Input
                          placeholder="Summarize your experience"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Your Review * (min 10 chars)</Label>
                          <span className={`text-xs ${reviewComment.length > REVIEW_MAX_CHARS ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {reviewComment.length}/{REVIEW_MAX_CHARS}
                          </span>
                        </div>
                        <Textarea
                          placeholder="Share your experience with this product..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value.slice(0, REVIEW_MAX_CHARS))}
                          rows={4}
                        />
                      </div>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reviews list */}
              <div className="lg:col-span-2 space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border rounded-xl p-4 space-y-2 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 font-semibold text-xs ring-2 ring-emerald-200 ring-offset-1">
                            {review.customer?.user.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.customer?.user.name || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                              star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.title && <h4 className="text-sm font-medium">{review.title}</h4>}
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="qa" className="pt-6">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Questions & Answers</h3>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">
                  {questions.length} questions
                </Badge>
              </div>

              {/* Q&A List */}
              <Accordion type="single" collapsible className="mb-6">
                {questions.map((qa, idx) => (
                  <AccordionItem key={idx} value={`q-${idx}`} className="border rounded-lg mb-2 px-4 data-[state=open]:border-emerald-200 data-[state=open]:bg-emerald-50/30 transition-colors">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start gap-3 text-left">
                        <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <MessageCircleQuestion className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{qa.question}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Asked by {qa.askedBy} · {qa.date}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-start gap-3 pb-2 pl-10">
                        <div className="h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                          <UserIcon className="h-3.5 w-3.5 text-teal-600" />
                        </div>
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 flex-1">
                          <p className="text-sm text-foreground">{qa.answer}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Answered by {qa.askedBy === 'John D.' ? 'ShopHub Team' : qa.askedBy === 'Sarah M.' ? 'Customer Support' : 'ShopHub Support'}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Ask a Question Form */}
              <div className="border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-muted/10">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MessageCircleQuestion className="h-4 w-4 text-emerald-600" />
                  Ask a Question
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your question here..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="flex-1 h-10 bg-background border focus-visible:ring-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && questionText.trim()) {
                        setQuestions((prev) => [
                          {
                            question: questionText.trim(),
                            answer: 'Thank you for your question! Our team will answer it shortly.',
                            askedBy: 'You',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          },
                          ...prev,
                        ])
                        setQuestionText('')
                        toast.success('Question submitted!')
                      }
                    }}
                  />
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 px-4"
                    onClick={() => {
                      if (questionText.trim()) {
                        setQuestions((prev) => [
                          {
                            question: questionText.trim(),
                            answer: 'Thank you for your question! Our team will answer it shortly.',
                            askedBy: 'You',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          },
                          ...prev,
                        ])
                        setQuestionText('')
                        toast.success('Question submitted!')
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </motion.div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}
