'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice, fetchProducts, type Product } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useNavStore } from '@/stores/nav-store'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Animated Cart Count Badge
function AnimatedCartBadge({ count }: { count: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="ml-1.5 h-5 min-w-[20px] px-1 rounded-full bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center"
      >
        {count}
      </motion.span>
    </AnimatePresence>
  )
}

// Empty Cart Illustration
function EmptyCartIllustration() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const setOpen = useCartStore((s) => s.setOpen)

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      {/* SVG Shopping Bag Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mb-6"
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="56" fill="#ecfdf5" stroke="#d1fae5" strokeWidth="2" />
          <path d="M42 44H78L74 88H46L42 44Z" fill="#d1fae5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 44V38C50 32.4772 54.4772 28 60 28C65.5228 28 70 32.4772 70 38V44" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="52" cy="58" r="3" fill="#059669" />
          <circle cx="68" cy="58" r="3" fill="#059669" />
          <path d="M50 68C50 68 54 74 60 74C66 74 70 68 70 68" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold mb-2"
      >
        Your cart is empty
      </motion.h3>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-muted-foreground mb-6"
      >
        Looks like you haven&apos;t added anything yet. Start exploring our products!
      </motion.p>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
          onClick={() => {
            setOpen(false)
            navigateStore('products')
          }}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Start Shopping
        </Button>
      </motion.div>
    </div>
  )
}

// Recommended Product Card
function RecommendedProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const navigateStore = useNavStore((s) => s.navigateStore)
  const setOpen = useCartStore((s) => s.setOpen)

  return (
    <div className="flex gap-2 p-2 rounded-lg border bg-card hover:border-emerald-300 transition-colors cursor-pointer"
      onClick={() => {
        setOpen(false)
        navigateStore('product', { id: product.id, slug: product.slug })
      }}
    >
      <img
        src={product.thumbnail || `https://picsum.photos/seed/${product.slug}/80/80`}
        alt={product.name}
        className="w-12 h-12 rounded-md object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium line-clamp-1">{product.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs font-bold text-emerald-600">
            {formatPrice(product.discountPrice || product.sellingPrice)}
          </span>
          {product.discountPrice && product.discountPrice < product.sellingPrice && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPrice(product.sellingPrice)}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            addItem({
              productId: product.id,
              productName: product.name,
              productSlug: product.slug,
              thumbnail: product.thumbnail || '',
              sku: product.sku,
              price: product.sellingPrice,
              discountPrice: product.discountPrice && product.discountPrice < product.sellingPrice ? product.discountPrice : undefined,
              quantity: 1,
              stock: product.inventory?.quantity ?? 99,
            })
          }}
          className="mt-1 text-[10px] text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-0.5"
        >
          + Add
        </button>
      </div>
    </div>
  )
}

export function CartSidebar() {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const setOpen = useCartStore((s) => s.setOpen)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getDiscount = useCartStore((s) => s.getDiscount)
  const getTotal = useCartStore((s) => s.getTotal)
  const navigateStore = useNavStore((s) => s.navigateStore)

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const total = getTotal()
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  // Fetch recommended products
  useEffect(() => {
    if (!isOpen) return
    const fetchRecommended = async () => {
      try {
        const res = await fetchProducts({ limit: '3' })
        setRecommendedProducts(res.data.slice(0, 3))
      } catch {
        // Silently fail
      }
    }
    fetchRecommended()
  }, [isOpen])

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:w-[420px] sm:max-w-[420px] h-full p-0 gap-0 flex flex-col overflow-hidden" >
        <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <AnimatedCartBadge count={itemCount} />
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyCartIllustration />
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.variantId || 'default'}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    {/* Item Thumbnail - 40x40px */}
                    <img
                      src={item.thumbnail || `https://picsum.photos/seed/${item.productSlug}/100/100`}
                      alt={item.productName}
                      className="w-10 h-10 rounded-md object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-1">{item.productName}</h4>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatPrice(item.discountPrice || item.price)}
                        </span>
                        {item.discountPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.variantId)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.variantId)
                            }
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeItem(item.productId, item.variantId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
              <div className="border-t px-4 py-3 shrink-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-muted-foreground">You might also like</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recommendedProducts
                    .filter((rp) => !items.some((i) => i.productId === rp.id))
                    .slice(0, 3)
                    .map((product) => (
                      <RecommendedProductCard key={product.id} product={product} />
                    ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t p-4 space-y-3 shrink-0" >
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Discount</span>
                    <span className="text-emerald-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-emerald-600">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setOpen(false)
                  navigateStore('cart')
                }}
              >
                View Cart
              </Button>
              <Button
                variant="outline"
                className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                onClick={() => {
                  setOpen(false)
                  navigateStore('checkout')
                }}
              >
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
