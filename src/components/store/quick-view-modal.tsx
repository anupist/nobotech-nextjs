'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import {
  fetchProduct,
  type Product,
  type ProductVariant,
  formatPrice,
  getDiscountPercentage,
} from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  X,
  Package,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface QuickViewModalProps {
  productId: string | null
  open: boolean
  onClose: () => void
}

export function QuickViewModal({ productId, open, onClose }: QuickViewModalProps) {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const addItem = useCartStore((s) => s.addItem)
  const setOpen = useCartStore((s) => s.setOpen)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [heartAnimating, setHeartAnimating] = useState(false)

  const isWishlisted = useWishlistStore((s) => (product ? s.isWishlisted(product.id) : false))
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const user = useAuthStore((s) => s.user)

  // Fetch product when productId changes
  useEffect(() => {
    if (!productId || !open) {
      setProduct(null)
      setSelectedImage(0)
      setQuantity(1)
      setSelectedVariant(null)
      setSelectedOptions({})
      return
    }
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetchProduct(productId)
        setProduct(res.data)
        setSelectedImage(0)
        setQuantity(1)
        setSelectedVariant(null)
        setSelectedOptions({})
      } catch {
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId, open])

  const currentVariant = useMemo(() => {
    const selected = selectedOptions
    const slugs = Object.keys(selected)
    if (slugs.length === 0) {
      return product?.variants?.find((v: ProductVariant) => v.id === selectedVariant) || null
    }
    return (
      product?.variants?.find((v: ProductVariant) =>
        slugs.every((slug) =>
          v.attributeValues?.some(
            (av) => av.attributeValue.attribute.slug === slug && av.attributeValue.value === selected[slug]
          )
        )
      ) || null
    )
  }, [product, selectedOptions, selectedVariant])

  // Images — filters by variant when selected
  const images = useMemo(() => {
    if (!product) return []
    const variantId = currentVariant?.id
    const imgs: string[] = []

    if (product.thumbnail && !variantId) imgs.push(product.thumbnail)
    else if (currentVariant?.thumbnail && !imgs.includes(currentVariant.thumbnail)) {
      imgs.push(currentVariant.thumbnail)
    } else if (product.thumbnail) imgs.push(product.thumbnail)

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

  // Group variant attributes with availability per value
  const variantAttributes = useMemo(() => {
    if (!product?.variants?.length) return {}
    const attrs: Record<string, { name: string; values: Set<string>; meta?: Record<string, string> }> = {}
    const allValuesBySlug: Record<string, Record<string, string[]>> = {}

    product.variants.forEach((v: ProductVariant) => {
      v.attributeValues?.forEach((av) => {
        const attrSlug = av.attributeValue.attribute.slug
        if (!attrs[attrSlug]) {
          attrs[attrSlug] = { name: av.attributeValue.attribute.name, values: new Set(), meta: {} }
        }
        attrs[attrSlug].values.add(av.attributeValue.value)
        if (av.attributeValue.meta) attrs[attrSlug].meta![av.attributeValue.value] = av.attributeValue.meta
        if (!allValuesBySlug[attrSlug]) allValuesBySlug[attrSlug] = {}
        if (!allValuesBySlug[attrSlug][av.attributeValue.value]) allValuesBySlug[attrSlug][av.attributeValue.value] = []
        allValuesBySlug[attrSlug][av.attributeValue.value].push(v.id)
      })
    })

    const selected = selectedOptions
    const availability: Record<string, { available: boolean }> = {}
    for (const [slug, vals] of Object.entries(allValuesBySlug)) {
      for (const [value, variantIds] of Object.entries(vals)) {
        const otherSelected = { ...selected }
        delete otherSelected[slug]
        let available = true
        const otherEntries = Object.entries(otherSelected)
        if (otherEntries.length > 0) {
          available = variantIds.some((vid) =>
            otherEntries.every(([oslug, ovalue]) =>
              product.variants?.some(
                (pv: ProductVariant) =>
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

    ;(attrs as any)._availability = availability
    return attrs
  }, [product, selectedOptions])

  const effectivePrice = currentVariant?.discountPrice || currentVariant?.price || product?.discountPrice || product?.sellingPrice || 0
  const originalPrice = currentVariant?.price || product?.sellingPrice || 0
  const discount = effectivePrice < originalPrice ? getDiscountPercentage(originalPrice, effectivePrice) : 0
  const stock = currentVariant?.inventory?.quantity ?? product?.inventory?.quantity ?? 0

  const handleAddToCart = useCallback(() => {
    if (!product || stock === 0) return
    if (product.variants && product.variants.length > 0 && !currentVariant) {
      toast.error('Please select all options')
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
    onClose()
  }, [product, currentVariant, quantity, stock, addItem, setOpen, onClose, originalPrice, effectivePrice])

  const handleBuyNow = useCallback(() => {
    handleAddToCart()
    setOpen(false)
    navigateStore('checkout')
  }, [handleAddToCart, setOpen, navigateStore])

  const handleWishlist = useCallback(() => {
    if (!product) return
    setHeartAnimating(true)
    setTimeout(() => setHeartAnimating(false), 400)
    toggleWishlist(product.id, user?.id)
    toast.success(!isWishlisted ? 'Added to wishlist' : 'Removed from wishlist')
  }, [product, isWishlisted, toggleWishlist, user?.id])

  const handleViewFullDetails = useCallback(() => {
    if (!product) return
    onClose()
    navigateStore('product-detail', { slug: product.slug, id: product.id })
  }, [product, onClose, navigateStore])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        className="sm:max-w-3xl p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {product?.name || 'Quick view'}
        </DialogTitle>
        <AnimatePresence>
          {loading ? (
            <motion.div
              key="loading"
              className="flex items-center justify-center min-h-[400px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </motion.div>
          ) : product ? (
            <motion.div
              key="content"
              className="flex flex-col md:flex-row max-h-[85dvh]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Left: Image Gallery */}
              <div className="md:w-1/2 bg-muted/20 relative">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col-reverse md:flex-row">
                  {/* Thumbnail strip */}
                  {images.length > 1 && (
                    <div className="flex md:flex-col gap-1.5 p-2 overflow-x-auto md:overflow-y-auto md:max-h-[400px] max-w-full">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImage === idx
                              ? 'border-emerald-600 shadow-md'
                              : 'border-transparent hover:border-muted-foreground/30 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Main image */}
                  <div className="relative aspect-square flex-1 overflow-hidden">
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {discount > 0 && (
                      <Badge className="absolute top-3 left-3 bg-red-500/90 text-white border-0 text-xs shadow-sm backdrop-blur-sm">
                        -{discount}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Product Info */}
              <ScrollArea className="md:w-1/2 md:max-h-[500px]">
                <div className="p-5 space-y-4">
                  {/* Brand + Name */}
                  <div>
                    {product.brand && (
                      <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">
                        {product.brand.name}
                      </p>
                    )}
                    <h2 className="text-lg font-bold leading-tight">{product.name}</h2>
                  </div>

                  {/* Rating */}
                  {product.averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= Math.round(product.averageRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {product.averageRating.toFixed(1)} ({product.reviewCount})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPrice(effectivePrice)}
                    </span>
                    {discount > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                    {discount > 0 && (
                      <Badge className="bg-red-100 text-red-600 border-0 text-xs">
                        Save {formatPrice(originalPrice - effectivePrice)}
                      </Badge>
                    )}
                  </div>

                  {/* Short Description */}
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {product.description.replace(/<[^>]*>/g, '').slice(0, 200)}
                      {product.description.length > 200 ? '...' : ''}
                    </p>
                  )}

                  <Separator />

                  {/* Variant Selectors - Combination-based */}
                  {Object.entries(variantAttributes).map(([slug, attr]) => {
                    const availability = (variantAttributes as any)._availability || {}
                    return (
                      <div key={slug}>
                        <p className="text-xs font-medium mb-1.5">
                          {attr.name}:{' '}
                          <span className="text-muted-foreground font-normal">
                            {selectedOptions[slug] ? selectedOptions[slug] : `Select ${(attr?.name || slug).toLowerCase()}`}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
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
                                    ? `w-8 h-8 p-0 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'border-emerald-500 shadow-sm' : !available ? 'border-gray-200 opacity-40 cursor-not-allowed' : 'border-muted hover:border-emerald-300'}`
                                    : `px-3 py-1.5 text-xs rounded-lg border font-medium transition-all duration-200 ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm' : !available ? 'border-gray-200 opacity-40 cursor-not-allowed line-through' : 'hover:border-emerald-300 hover:text-emerald-600'}`
                                }
                                onClick={() => {
                                  setSelectedOptions((prev) => {
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
                                    className={`w-6 h-6 rounded-full transition-all duration-200 ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-background' : ''}`}
                                    style={{ backgroundColor: colorCode }}
                                  />
                                ) : (
                                  <span>{value}</span>
                                )}
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {/* Variant pills for products without grouped attributes */}
                  {product.variants && product.variants.length > 0 && Object.keys(variantAttributes).length === 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1.5">Options:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.variants.map((variant: ProductVariant) => (
                          <motion.button
                            key={variant.id}
                            className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                              selectedVariant === variant.id
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'hover:border-emerald-300 hover:text-emerald-600'
                            }`}
                            onClick={() => {
                              setSelectedOptions({})
                              setSelectedVariant(variant.id)
                            }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            {variant.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <p className="text-xs font-medium mb-1.5">Quantity</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                          disabled={quantity >= stock}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {stock > 0 ? (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> In Stock ({stock})
                        </span>
                      ) : (
                        <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                      onClick={handleAddToCart}
                      disabled={stock === 0 || (product.variants && product.variants.length > 0 && !currentVariant)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1.5" />
                      {stock === 0
                        ? 'Out of Stock'
                        : product.variants && product.variants.length > 0 && !currentVariant
                          ? 'Select Options'
                          : 'Add to Cart'}
                    </Button>
                    <Button
                      className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20"
                      onClick={handleBuyNow}
                      disabled={stock === 0}
                    >
                      Buy Now
                    </Button>
                  </div>

                  {/* Wishlist + View Details row */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-9"
                      onClick={handleWishlist}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isWishlisted ? 'filled' : 'empty'}
                          initial={heartAnimating ? { scale: 1.3 } : { scale: 1 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                          className="flex items-center gap-1.5"
                        >
                          <Heart
                            className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          <span className="text-xs">
                            {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-9"
                      onClick={handleViewFullDetails}
                    >
                      <Package className="h-4 w-4 mr-1.5" />
                      <span className="text-xs">Full Details</span>
                    </Button>
                  </div>

                  <Separator />

                  {/* Trust badges */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center text-center gap-1 p-2 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Truck className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-semibold">Free Shipping</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1 p-2 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Shield className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-semibold">Secure Pay</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1 p-2 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <RefreshCw className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-semibold">Easy Returns</span>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
