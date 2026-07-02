'use client'

import { useState, useCallback } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { useNavStore } from '@/stores/nav-store'
import { validateCoupon, formatPrice, type CouponData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Tag,
  Truck,
  Heart,
  ShieldCheck,
  RotateCcw,
  Lock,
  Calendar,
  PiggyBank,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import { motion, AnimatePresence } from 'framer-motion'

const FREE_SHIPPING_THRESHOLD = 50

export function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getDiscount = useCartStore((s) => s.getDiscount)
  const getTotal = useCartStore((s) => s.getTotal)
  const navigateStore = useNavStore((s) => s.navigateStore)

  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const [bouncingKey, setBouncingKey] = useState<string | null>(null)

  const subtotal = getSubtotal()
  const cartDiscount = getDiscount()
  const couponDiscount = appliedCoupon?.discountAmount || 0
  const shippingCost = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 9.99
  const taxRate = 0.08
  const taxAmount = (getTotal() - couponDiscount) * taxRate
  const total = getTotal() - couponDiscount + shippingCost + taxAmount

  // Total savings calculation
  const totalSavings = cartDiscount + couponDiscount

  // Free shipping progress
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const amountForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)

  // Estimated delivery date
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)
  const deliveryDateString = estimatedDelivery.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await validateCoupon(couponCode, subtotal)
      setAppliedCoupon(res.data)
      toast.success(`Coupon applied! You save ${formatPrice(res.data.discountAmount)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }, [couponCode, subtotal])

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.info('Coupon removed')
  }, [])

  const handleRemoveItem = useCallback((productId: string, variantId?: string) => {
    const key = `${productId}-${variantId || 'default'}`
    setRemovingItems((prev) => new Set(prev).add(key))
    setTimeout(() => {
      removeItem(productId, variantId)
      setRemovingItems((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, 400)
  }, [removeItem])

  const handleQuantityChange = useCallback((productId: string, newQty: number, variantId?: string, stock?: number) => {
    if (stock !== undefined && newQty > stock) return
    const key = `${productId}-${variantId || 'default'}`
    setBouncingKey(key)
    updateQuantity(productId, newQty, variantId)
    setTimeout(() => setBouncingKey(null), 300)
  }, [updateQuantity])

  const handleSaveForLater = useCallback((productId: string) => {
    const userId = useAuthStore.getState().user?.id
    useWishlistStore.getState().toggleWishlist(productId, userId)
    toast.success('Saved to wishlist!')
  }, [])

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="text-8xl mb-6">🛒</div>
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => navigateStore('products')}
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <BreadcrumbNav />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-600">
          <Trash2 className="h-4 w-4 mr-1" />
          Clear Cart
        </Button>
      </div>

      {/* You Saved Banner */}
      {totalSavings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center gap-3 shadow-lg shadow-emerald-500/20"
        >
          <div className="p-1.5 rounded-full bg-white/20">
            <PiggyBank className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">You saved {formatPrice(totalSavings)}!</p>
            <p className="text-xs text-emerald-100">Great deals on your cart items</p>
          </div>
          <Sparkles className="h-5 w-5 text-emerald-200 animate-pulse" />
        </motion.div>
      )}

      {/* Free Shipping Progress Bar with sparkle effect */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-xl border bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          {subtotal >= FREE_SHIPPING_THRESHOLD ? (
            <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
              <span className="text-lg">🎉</span>
              You&apos;ve earned free shipping!
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>
                Add <span className="font-semibold text-emerald-600">{formatPrice(amountForFreeShipping)}</span> more for free shipping!
              </span>
            </div>
          )}
          <span className="text-xs text-muted-foreground">{formatPrice(subtotal)} / {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden relative">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${shippingProgress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Animated sparkle particles when > 80% */}
            {shippingProgress > 80 && (
              <>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.2, 0],
                      x: [0, (i - 2) * 8],
                      y: [0, (i % 2 === 0 ? -6 : 6)],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeOut',
                    }}
                    style={{ right: `${10 + i * 5}%` }}
                  />
                ))}
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const itemKey = `${item.productId}-${item.variantId || 'default'}`
              const isRemoving = removingItems.has(itemKey)
              const isBouncing = bouncingKey === itemKey
              return (
                <motion.div
                  key={itemKey}
                  layout
                  initial={{ opacity: 0, x: -30 }}
                  animate={{
                    opacity: isRemoving ? 0 : 1,
                    x: isRemoving ? -80 : 0,
                    scale: isRemoving ? 0.95 : 1,
                  }}
                  exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="group rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div
                      className="shrink-0 cursor-pointer"
                      onClick={() => navigateStore('product-detail', { slug: item.productSlug, id: item.productId })}
                    >
                      <img
                        src={item.thumbnail || `https://picsum.photos/seed/${item.productSlug}/160/160`}
                        alt={item.productName}
                        className="w-20 h-20 rounded-lg object-cover border hover:border-emerald-300 transition-colors"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => navigateStore('product-detail', { slug: item.productSlug, id: item.productId })}
                          >
                            {item.productName}
                          </h3>
                          {item.variantName && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.sku}</p>
                        </div>

                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveItem(item.productId, item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price, Quantity, Subtotal Row */}
                      <div className="flex items-end justify-between mt-3 gap-3 flex-wrap">
                        {/* Price */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-emerald-600">
                            {formatPrice(item.discountPrice || item.price)}
                          </span>
                          {item.discountPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(item.price)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls with bounce effect */}
                        <div className="flex items-center border rounded-lg bg-muted/30">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.variantId)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <motion.span
                            key={`${itemKey}-${item.quantity}`}
                            initial={isBouncing ? { scale: 1.3, color: '#10b981' } : { scale: 1 }}
                            animate={{ scale: 1, color: 'inherit' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            className="w-10 text-center text-sm font-semibold"
                          >
                            {item.quantity}
                          </motion.span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.variantId, item.stock)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <span className="font-bold text-sm">
                            {formatPrice((item.discountPrice || item.price) * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Save for Later */}
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-emerald-600"
                          onClick={() => handleSaveForLater(item.productId)}
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Save for Later
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <Button
            variant="ghost"
            onClick={() => navigateStore('products')}
            className="text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Continue Shopping
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-xl p-6 space-y-4 sticky top-24">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            {/* Coupon */}
            <div className="space-y-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">{appliedCoupon.code}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-emerald-700 hover:text-red-600"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="h-9 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Product Discounts</span>
                  <span>-{formatPrice(cartDiscount)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Free</Badge>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-emerald-600">{formatPrice(total)}</span>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
              <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Estimated delivery: <span className="font-medium text-foreground">{deliveryDateString}</span></span>
            </div>

            {/* Proceed to Checkout with pulse */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(16, 185, 129, 0)',
                  '0 0 0 6px rgba(16, 185, 129, 0.15)',
                  '0 0 0 0 rgba(16, 185, 129, 0)',
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="rounded-lg"
            >
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                onClick={() => navigateStore('checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">SSL Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">Buyer Protection</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">30-Day Returns</span>
              </div>
            </div>

            <Separator />

            {/* Continue Shopping */}
            <button
              onClick={() => navigateStore('products')}
              className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium py-1 hover:underline transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
