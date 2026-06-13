'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, ShoppingCart, Trash2, ShoppingBag, ArrowRight, Share2, Facebook, Twitter, MessageCircle, Link2, Check, Copy, Calendar, MoveRight } from 'lucide-react'
import { toast } from 'sonner'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import { motion, AnimatePresence } from 'framer-motion'
import { type Product, formatPrice } from '@/lib/api'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface WishlistProduct {
  id: string
  name: string
  slug: string
  thumbnail: string
  price: number
  discountPrice?: number
  stock: number
  addedAt?: string
}

export function WishlistPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const addItem = useCartStore((s) => s.addItem)
  const wishlistItems = useWishlistStore((s) => s.items)
  const loading = useWishlistStore((s) => s.loading)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist)
  const user = useAuthStore((s) => s.user)

  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const wishlistShareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?wishlist=true` : ''
  const wishlistShareText = `Check out my wishlist on ShopHub! ${products.length} amazing items waiting to be discovered.`

  const handleCopyWishlistLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(wishlistShareUrl)
      setCopied(true)
      toast.success('Wishlist link copied to clipboard!', {
        description: 'Share it with your friends and family.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }, [wishlistShareUrl])

  const handleSocialShare = useCallback((platform: string) => {
    const url = wishlistShareUrl
    const text = wishlistShareText
    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} - ${url}`)}`
        break
    }
    window.open(shareUrl, '_blank', 'width=600,height=400')
    setShareOpen(false)
  }, [wishlistShareUrl, wishlistShareText])

  // Fetch wishlist from API when user is logged in
  useEffect(() => {
    if (user?.id) {
      fetchWishlist(user.id)
    }
  }, [user?.id, fetchWishlist])

  // Fetch product details for wishlist items
  useEffect(() => {
    async function fetchProducts() {
      if (wishlistItems.length === 0) {
        setProducts([])
        setProductsLoading(false)
        return
      }

      setProductsLoading(true)
      try {
        // Fetch product details for each wishlist item
        const productPromises = wishlistItems.map(async (productId) => {
          const res = await fetch(`/api/products/${productId}`)
          const data = await res.json()
          if (data.success && data.data) {
            const p: Product = data.data
            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              thumbnail: p.thumbnail || '',
              price: p.sellingPrice,
              discountPrice: p.discountPrice || undefined,
              stock: p.inventory?.quantity ?? 0,
              addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            }
          }
          return null
        })

        const results = await Promise.all(productPromises)
        setProducts(results.filter((p): p is WishlistProduct => p !== null))
      } catch (error) {
        console.error('Failed to fetch wishlist products:', error)
      } finally {
        setProductsLoading(false)
      }
    }

    fetchProducts()
  }, [wishlistItems])

  const handleRemove = useCallback(
    (productId: string) => {
      toggleWishlist(productId, user?.id)
      toast.success('Removed from wishlist')
    },
    [toggleWishlist, user?.id]
  )

  const handleMoveToCart = useCallback(
    (item: WishlistProduct) => {
      addItem({
        productId: item.id,
        productName: item.name,
        productSlug: item.slug,
        thumbnail: item.thumbnail,
        sku: item.slug,
        price: item.price,
        discountPrice: item.discountPrice || undefined,
        quantity: 1,
        stock: item.stock,
      })
      handleRemove(item.id)
      toast.success(`${item.name} moved to cart`)
    },
    [addItem, handleRemove]
  )

  const handleAddAllToCart = useCallback(() => {
    products.forEach((item) => {
      if (item.stock > 0) {
        addItem({
          productId: item.id,
          productName: item.name,
          productSlug: item.slug,
          thumbnail: item.thumbnail,
          sku: item.slug,
          price: item.price,
          discountPrice: item.discountPrice || undefined,
          quantity: 1,
          stock: item.stock,
        })
      }
    })
    toast.success(`${products.length} items added to cart`)
  }, [products, addItem])

  if (productsLoading && wishlistItems.length > 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mx-auto mb-4" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BreadcrumbNav />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center mt-12"
        >
          {/* Animated heart that beats */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1, 1.15, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 1,
            }}
            className="relative mb-8"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center">
              <Heart className="h-14 w-14 text-emerald-400 dark:text-emerald-500 fill-emerald-400 dark:fill-emerald-500" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-white text-sm font-bold">0</span>
            </motion.div>
          </motion.div>

          <h1 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Save your favorite products here to easily find them later. Click the heart icon on any product to add it to your wishlist.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              onClick={() => navigateStore('products')}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <BreadcrumbNav />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <Badge className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm shadow-emerald-500/20">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* Share Wishlist */}
            <Popover open={shareOpen} onOpenChange={setShareOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  Share Wishlist
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end" sideOffset={8}>
                <AnimatePresence>
                  {shareOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <p className="text-sm font-medium mb-3">Share your wishlist</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleSocialShare('facebook')}
                          className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium bg-[#1877F2] text-white hover:bg-[#166FE5] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                        >
                          <Facebook className="h-3.5 w-3.5" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleSocialShare('twitter')}
                          className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium bg-sky-500 text-white hover:bg-sky-600 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                        >
                          <Twitter className="h-3.5 w-3.5" />
                          Twitter
                        </button>
                        <button
                          onClick={() => handleSocialShare('whatsapp')}
                          className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium bg-[#25D366] text-white hover:bg-[#22C55E] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </button>
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <button
                          onClick={handleCopyWishlistLink}
                          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 transition-all duration-200 hover:scale-[1.01] active:scale-[0.97]"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Link2 className="h-3.5 w-3.5" />
                              Copy Link
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </PopoverContent>
            </Popover>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAddAllToCart}
              disabled={products.length === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add All to Cart
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {products.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <img
                      src={item.thumbnail || `https://picsum.photos/seed/${item.slug}/400/400`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-red-50 transition-colors"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    {item.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3
                      className="text-sm font-medium line-clamp-1 cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => navigateStore('product-detail', { id: item.id })}
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-600">
                        {formatPrice(item.discountPrice || item.price)}
                      </span>
                      {item.discountPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                    {/* Added on timestamp */}
                    {item.addedAt && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Added on {item.addedAt}</span>
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
                        onClick={() => handleMoveToCart(item)}
                        disabled={item.stock === 0}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                        {item.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => handleMoveToCart(item)}
                        disabled={item.stock === 0}
                        title="Move to Cart"
                      >
                        <MoveRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Continue Shopping CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <Button
          variant="outline"
          className="border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          onClick={() => navigateStore('products')}
        >
          Continue Shopping
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  )
}
