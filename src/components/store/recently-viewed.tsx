'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store'
import { useNavStore } from '@/stores/nav-store'
import { useCartStore } from '@/stores/cart-store'
import { formatPrice } from '@/lib/api'
import { Clock, ChevronRight, ChevronLeft, X, ShoppingCart, Star, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export function RecentlyViewed() {
  const items = useRecentlyViewedStore((s) => s.items)
  const clearAll = useRecentlyViewedStore((s) => s.clearAll)
  const navigateStore = useNavStore((s) => s.navigateStore)
  const addItem = useCartStore((s) => s.addItem)
  const setOpen = useCartStore((s) => s.setOpen)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    const maxScroll = scrollWidth - clientWidth
    setScrollProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el.removeEventListener('scroll', checkScroll)
  }, [items, checkScroll])

  // Auto-scroll when hovering (optional hover-pause for manual control)
  useEffect(() => {
    if (isHovering || items.length <= 2) return
    const interval = setInterval(() => {
      if (!scrollRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      if (scrollLeft >= scrollWidth - clientWidth - 1) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isHovering, items.length])

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -220 : 220,
      behavior: 'smooth',
    })
  }

  const handleQuickAddToCart = useCallback((item: typeof items[0], e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      productId: item.id,
      productName: item.name,
      productSlug: item.slug,
      thumbnail: item.thumbnail,
      price: item.price,
      discountPrice: item.discountPrice && item.discountPrice < item.price ? item.discountPrice : undefined,
      quantity: 1,
      stock: 999,
    })
    toast.success(`${item.name} added to cart`)
    setOpen(true)
  }, [addItem, setOpen])

  const handleClearAll = useCallback(() => {
    clearAll()
    toast.success('Recently viewed cleared')
  }, [clearAll])

  if (items.length === 0) return null

  return (
    <motion.section
      className="container mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Recently Viewed</h2>
            <p className="text-xs text-muted-foreground">Pick up where you left off</p>
          </div>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          Clear All
        </button>
      </div>

      <div
        className="relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setHoveredItem(null) }}
      >
        {/* Left scroll arrow - always visible when scrollable */}
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onClick={() => scrollByAmount('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg border border-border flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-emerald-600" />
          </motion.button>
        )}

        {/* Right scroll arrow - always visible when scrollable */}
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => scrollByAmount('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg border border-border flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-emerald-600" />
          </motion.button>
        )}

        {/* Scrollable items */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin"
        >
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="min-w-[180px] sm:min-w-[200px] snap-start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => navigateStore('product-detail', { slug: item.slug, id: item.id })}
                  className="group/card w-full text-left rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-emerald-300 relative"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted/30">
                    <img
                      src={item.thumbnail || `https://picsum.photos/seed/${item.slug}/400/400`}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                    />
                    {/* Quick Add to Cart overlay on hover */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div
                          className="absolute inset-0 bg-black/30 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <motion.button
                            onClick={(e) => handleQuickAddToCart(item, e)}
                            className="h-10 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-2 shadow-lg transition-colors"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                            transition={{ duration: 0.15, delay: 0.05 }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium line-clamp-1 group-hover/card:text-emerald-600 transition-colors">
                      {item.name}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-sm font-bold text-emerald-600">
                        {formatPrice(item.discountPrice || item.price)}
                      </span>
                      {item.discountPrice && item.discountPrice < item.price && (
                        <span className="text-[11px] text-muted-foreground line-through">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                    {/* Rating indicator */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-0.5">4.0</span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Scroll progress indicator */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {items.length > 2 && (
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(15, scrollProgress * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
