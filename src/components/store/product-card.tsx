'use client'

import { useCallback, useState } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { type Product, formatPrice, getDiscountPercentage } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Heart, ShoppingCart, Eye, GitCompareArrows, Sparkles, Zap, Award } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useCompareStore } from '@/stores/compare-store'
import { QuickViewModal } from './quick-view-modal'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const addItem = useCartStore((s) => s.addItem)
  const isInCompare = useCompareStore((s) => s.isInCompare)
  const addCompareProduct = useCompareStore((s) => s.addProduct)
  const removeCompareProduct = useCompareStore((s) => s.removeProduct)
  const compareCount = useCompareStore((s) => s.productIds.length)
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id))
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const user = useAuthStore((s) => s.user)
  const [heartAnimating, setHeartAnimating] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<string | null>(null)
  const inCompare = isInCompare(product.id)

  const discount = product.discountPrice
    ? getDiscountPercentage(product.sellingPrice, product.discountPrice)
    : 0

  const effectivePrice = product.discountPrice || product.sellingPrice
  const stock = product.inventory?.quantity ?? 0

  const stockColor = stock === 0 ? 'bg-red-500' : stock <= 5 ? 'bg-amber-400' : 'bg-emerald-500'

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (stock === 0) return
      addItem({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        thumbnail: product.thumbnail || '',
        sku: product.sku,
        price: product.sellingPrice,
        discountPrice: product.discountPrice || undefined,
        quantity: 1,
        stock,
      })
      toast.success(`${product.name} added to cart`)
    },
    [product, addItem, stock]
  )

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setHeartAnimating(true)
      setTimeout(() => setHeartAnimating(false), 400)
      toggleWishlist(product.id, user?.id)
      toast.success(!isWishlisted ? 'Added to wishlist' : 'Removed from wishlist')
    },
    [product.id, isWishlisted, toggleWishlist, user?.id]
  )

  const handleView = useCallback(() => {
    navigateStore('product-detail', { slug: product.slug, id: product.id })
  }, [navigateStore, product.slug, product.id])

  const handleCompare = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (inCompare) {
        removeCompareProduct(product.id)
        toast.success('Removed from comparison')
      } else {
        if (compareCount >= 3) {
          toast.error('You can compare up to 3 products')
          return
        }
        addCompareProduct(product.id)
        toast.success('Added to comparison')
      }
    },
    [inCompare, product.id, compareCount, addCompareProduct, removeCompareProduct]
  )

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setQuickViewProduct(product.id)
    },
    [product.id]
  )

  // Determine product label badge with icon
  const productLabel = product.isNewArrival
    ? { text: 'New', className: 'bg-emerald-600 text-white', Icon: Sparkles }
    : product.isBestSeller
    ? { text: 'Best Seller', className: 'bg-amber-500 text-white', Icon: Award }
    : discount > 0
    ? { text: 'Sale', className: 'bg-red-500 text-white', Icon: Zap }
    : null

  return (
    <>
      <div className="transition-transform duration-300 hover:-translate-y-1">
        <div className="gradient-border rounded-xl">
          <Card
            className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden relative bg-card"
            onClick={handleView}
            style={{ touchAction: 'manipulation' }}
          >
            <CardContent className="p-0">
                {/* Image container */}
                <div className="relative aspect-square overflow-hidden bg-muted/30">
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                  )}
                  <img
                    src={product.thumbnail || `https://picsum.photos/seed/${product.slug}/400/400`}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                  />

                  {/* Gradient overlay that rises from bottom on hover */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-900/40 via-emerald-800/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  </div>

                  {/* Static bottom gradient for text readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                  {/* Product Label Badge with animated entrance (scale from 0) */}
                  {productLabel && (
                    <div className="absolute top-2 left-2 z-10">
                      <motion.span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-md ${productLabel.className}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 15,
                          delay: 0.1,
                        }}
                      >
                        <productLabel.Icon className="h-2.5 w-2.5 mr-1" />
                        {productLabel.text}
                      </motion.span>
                    </div>
                  )}

                  {/* Discount Badge with shimmer effect */}
                  {discount > 0 && (
                    <div className="absolute top-2 right-10">
                      <Badge className="discount-shimmer-bg text-white text-[10px] border-0 shadow-sm shadow-red-500/20 backdrop-blur-sm font-bold">
                        -{discount}%
                      </Badge>
                    </div>
                  )}

                  {/* Wishlist & Compare buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm transition-transform duration-200"
                      onClick={handleWishlist}
                      aria-label="Add to wishlist"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isWishlisted ? 'filled' : 'empty'}
                          initial={heartAnimating ? { scale: 1.4 } : { scale: 1 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                          className={heartAnimating ? 'heart-bounce' : ''}
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full backdrop-blur-sm shadow-sm transition-all duration-200 ${inCompare ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white/80 hover:bg-white text-gray-600'}`}
                      onClick={handleCompare}
                      aria-label="Compare product"
                    >
                      <GitCompareArrows className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick add to cart - slide-up on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-9 text-xs shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02]"
                      onClick={handleAddToCart}
                      disabled={stock === 0}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>

                  {/* Quick View button - appears on hover */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 scale-90 group-hover:scale-100 transition-all duration-300 ease-out">
                    <Button
                      variant="ghost"
                      className="h-auto px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:scale-105 transition-transform duration-200"
                      onClick={handleQuickView}
                      aria-label="Quick view"
                    >
                      <Eye className="h-4 w-4 mr-1.5 text-gray-700" />
                      <span className="text-xs font-medium text-gray-700">Quick View</span>
                    </Button>
                  </div>

                  {/* Stock indicator bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 group-hover:h-0 transition-all duration-300">
                    <div className={`h-full w-full ${stockColor}`} />
                  </div>
                </div>

                {/* Product info */}
                <div className="p-3 space-y-1.5">
                  {product.category && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {product.category.name}
                    </p>
                  )}
                  <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-emerald-600 transition-colors duration-200">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= Math.round(product.averageRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${discount > 0 ? 'price-shimmer' : 'text-emerald-600'}`}>
                      {formatPrice(effectivePrice)}
                    </span>
                    {product.discountPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.sellingPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stock status */}
                  {stock > 0 && stock <= 5 && (
                    <p className="text-[10px] text-amber-600 font-medium">
                      Only {stock} left in stock!
                    </p>
                  )}
                </div>

                {/* Bottom stock indicator bar (visible always) */}
                <div className="px-3 pb-3">
                  <div className="h-0.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stockColor} transition-all duration-300`}
                      style={{ width: stock === 0 ? '5%' : stock <= 5 ? '30%' : '100%' }}
                    />
                  </div>
                </div>
              </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        productId={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  )
}
