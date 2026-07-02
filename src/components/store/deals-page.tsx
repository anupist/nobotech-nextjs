'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { fetchProducts, formatPrice, getDiscountPercentage, type Product } from '@/lib/api'
import { subscribeNewsletter } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import {
  Zap,
  Clock,
  Tag,
  Copy,
  Gift,
  Package,
  ArrowRight,
  Mail,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Timer,
  Star,
  ShoppingCart,
  Percent,
  Flame,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

/* ── Countdown Hook ── */
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

/* ── Coupon Data ── */
interface Coupon {
  code: string
  description: string
  discount: string
  expiry: string
  terms: string
  color: string
}

const coupons: Coupon[] = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    discount: '10% OFF',
    expiry: 'Dec 31, 2025',
    terms: 'Valid for new customers only. Minimum purchase $25. Cannot be combined with other offers.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    code: 'SAVE20',
    description: '$20 off orders over $100',
    discount: '$20 OFF',
    expiry: 'Mar 31, 2026',
    terms: 'Minimum purchase $100. One use per customer. Excludes clearance items.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on any order',
    discount: 'FREE SHIP',
    expiry: 'Jun 30, 2025',
    terms: 'No minimum purchase required. Standard shipping only. Domestic orders only.',
    color: 'from-rose-500 to-pink-500',
  },
]

/* ── Bundle Deals Data ── */
interface BundleDeal {
  id: string
  title: string
  description: string
  savings: string
  items: string[]
  badge: string
  icon: React.ComponentType<{ className?: string }>
}

const bundleDeals: BundleDeal[] = [
  {
    id: '1',
    title: 'Buy 2 Get 1 Free',
    description: 'Mix and match any items from our Clothing collection. Add 3 items to cart and get the cheapest free!',
    savings: 'Up to 33% OFF',
    items: ['T-Shirts', 'Jeans', 'Jackets', 'Hoodies'],
    badge: 'Most Popular',
    icon: Gift,
  },
  {
    id: '2',
    title: 'Save $50 on Tech Bundle',
    description: 'Buy a laptop stand, wireless mouse, and keyboard together and save $50 instantly at checkout.',
    savings: '$50 OFF',
    items: ['Laptop Stand', 'Wireless Mouse', 'Keyboard'],
    badge: 'Best Value',
    icon: Package,
  },
  {
    id: '3',
    title: 'Home Essentials Pack',
    description: 'Get 4 home items for the price of 3. Perfect for upgrading your space on a budget.',
    savings: '25% OFF',
    items: ['Cushions', 'Lamps', 'Rugs', 'Vases'],
    badge: 'New Deal',
    icon: Sparkles,
  },
]

/* ── Animation Variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ── Deals Page Component ── */
export function DealsPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Midnight countdown
  const midnight = useMemo(() => {
    const now = new Date()
    const target = new Date(now)
    target.setHours(24, 0, 0, 0)
    return target
  }, [])
  const countdown = useCountdown(midnight)

  // Flash deal end times (6 hours from now for demo)
  const flashEnd = useMemo(() => {
    const d = new Date()
    d.setHours(d.getHours() + 6)
    return d
  }, [])
  const flashCountdown = useCountdown(flashEnd)

  useEffect(() => {
    fetchProducts({ limit: '20' })
      .then((res) => setProducts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const flashDeals = useMemo(
    () => products.filter((p) => p.discountPrice && p.discountPrice < p.sellingPrice).slice(0, 8),
    [products]
  )

  const clearanceDeals = useMemo(() => {
    return [...products]
      .filter((p) => p.discountPrice && p.discountPrice < p.sellingPrice)
      .sort((a, b) => {
        const discA = getDiscountPercentage(a.sellingPrice, a.discountPrice!)
        const discB = getDiscountPercentage(b.sellingPrice, b.discountPrice!)
        return discB - discA
      })
      .slice(0, 8)
  }, [products])

  const handleCopyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success(`Coupon code "${code}" copied to clipboard!`)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      toast.error('Failed to copy. Please copy manually.')
    }
  }, [])

  const handleNewsletter = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim()) return
      setSubscribing(true)
      try {
        await subscribeNewsletter(email)
        toast.success('Subscribed! You\'ll receive exclusive deals soon.')
        setEmail('')
      } catch {
        toast.error('Failed to subscribe. Please try again.')
      } finally {
        setSubscribing(false)
      }
    },
    [email]
  )

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ── */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-14 relative z-10">
          <BreadcrumbNav items={[{ label: 'Deals' }]} />
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="text-sm text-white/90 font-medium">Limited time offers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Today&apos;s Best Deals</h1>
            <p className="text-lg text-emerald-100/80 mb-8">
              Don&apos;t miss out on incredible savings. Deals refresh every day at midnight!
            </p>

            {/* Countdown Timer */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
              <Timer className="h-5 w-5 text-emerald-200 shrink-0" />
              <span className="text-sm text-emerald-100 font-medium mr-2">Ends in:</span>
              {[
                { value: countdown.hours, label: 'HRS' },
                { value: countdown.minutes, label: 'MIN' },
                { value: countdown.seconds, label: 'SEC' },
              ].map((unit, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="bg-white/20 rounded-lg px-3 py-1.5 text-xl font-bold text-white tabular-nums min-w-[3rem] text-center">
                    {pad(unit.value)}
                  </span>
                  <span className="text-xs text-emerald-200">{unit.label}</span>
                  {i < 2 && <span className="text-white/40 mx-0.5">:</span>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-16">
        {/* ── Flash Deals Section ── */}
        <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 fire-flicker">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">Flash Deals</h2>
                  {/* Pulsing LIVE indicator */}
                  <div className="flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-xs font-bold tracking-wider">LIVE</span>
                  </div>
                  {/* Sparkle decorations */}
                  <Sparkles className="h-4 w-4 text-amber-400 sparkle-twinkle" />
                </div>
                <p className="text-sm text-muted-foreground">Hurry, these won&apos;t last long!</p>
              </div>
            </div>
            {/* Flip-clock style countdown */}
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-xl">
              <Flame className="h-4 w-4 text-orange-500 fire-flicker" />
              {[
                { value: pad(flashCountdown.hours), label: 'HRS' },
                { value: pad(flashCountdown.minutes), label: 'MIN' },
                { value: pad(flashCountdown.seconds), label: 'SEC' },
              ].map((unit, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="flex flex-col items-center">
                    <div className="flip-digit px-2.5 py-1.5">
                      <span className="text-lg font-bold text-white tabular-nums">{unit.value}</span>
                    </div>
                    <span className="text-[9px] font-medium text-amber-600/70 dark:text-amber-400/70 mt-0.5">{unit.label}</span>
                  </div>
                  {i < 2 && <span className="text-amber-400/60 font-bold mx-0.5">:</span>}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[260px] h-72 rounded-xl skeleton-shimmer shrink-0 snap-start" />
                ))
              : flashDeals.map((product) => {
                  const discount = product.discountPrice
                    ? getDiscountPercentage(product.sellingPrice, product.discountPrice)
                    : 0
                  return (
                    <motion.div
                      key={product.id}
                      variants={itemVariants}
                      className="min-w-[260px] max-w-[280px] shrink-0 snap-start"
                    >
                      <Card
                        className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow h-full"
                        onClick={() => navigateStore('product-detail', { slug: product.slug, id: product.id })}
                      >
                        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                          )}
                          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs font-bold">
                            <Percent className="h-3 w-3 mr-0.5" />
                            {discount}% OFF
                          </Badge>
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-emerald-600 font-bold">
                              {formatPrice(product.discountPrice || product.sellingPrice)}
                            </span>
                            {product.discountPrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.sellingPrice)}
                              </span>
                            )}
                          </div>
                          {/* Selling fast progress bar */}
                          {product.inventory && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] text-red-500 font-medium">Selling fast!</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {Math.max(0, (product.inventory?.quantity ?? 0))}/50 sold
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-400 transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(10, ((50 - (product.inventory?.quantity ?? 25)) / 50) * 100))}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
          </div>
        </motion.section>

        {/* ── Coupon Section ── */}
        <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Coupon Codes</h2>
              <p className="text-sm text-muted-foreground">Copy and apply at checkout for instant savings</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <motion.div key={coupon.code} variants={itemVariants}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className={`h-2 bg-gradient-to-r ${coupon.color}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-gradient-to-r text-white border-0 text-xs font-bold" style={{ background: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))` }}>
                        {coupon.discount}
                      </Badge>
                      <Gift className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{coupon.description}</h3>

                    {/* Coupon Code Box */}
                    <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-lg p-3 my-4 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-2">
                      <code className="text-lg font-bold tracking-widest text-emerald-700 dark:text-emerald-400">
                        {coupon.code}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        {copiedCode === coupon.code ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      <span>Expires: {coupon.expiry}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{coupon.terms}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Clearance Section ── */}
        <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Clearance</h2>
                <p className="text-sm text-muted-foreground">Biggest discounts — while stock lasts</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => navigateStore('products', { sort: 'discount' })}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl skeleton-shimmer" />
                ))
              : clearanceDeals.map((product) => {
                  const discount = product.discountPrice
                    ? getDiscountPercentage(product.sellingPrice, product.discountPrice)
                    : 0
                  return (
                    <motion.div key={product.id} variants={itemVariants}>
                      <Card
                        className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow h-full"
                        onClick={() => navigateStore('product-detail', { slug: product.slug, id: product.id })}
                      >
                        <div className="relative aspect-square bg-muted overflow-hidden">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-xs font-bold">
                            -{discount}%
                          </Badge>
                          <div className="absolute bottom-2 right-2">
                            <div className="h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                              <ShoppingCart className="h-4 w-4 text-emerald-600" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-emerald-600 font-bold text-sm">
                              {formatPrice(product.discountPrice || product.sellingPrice)}
                            </span>
                            {product.discountPrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.sellingPrice)}
                              </span>
                            )}
                          </div>
                          {product.averageRating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs text-muted-foreground">{product.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
          </div>
        </motion.section>

        {/* ── Bundle Deals ── */}
        <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Bundle Deals</h2>
              <p className="text-sm text-muted-foreground">Save more when you buy together</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bundleDeals.map((bundle) => {
              const Icon = bundle.icon
              return (
                <motion.div key={bundle.id} variants={itemVariants}>
                  <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow group">
                    <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 p-6">
                      <Badge className="absolute top-3 right-3 bg-emerald-600 text-white border-0 text-[10px]">
                        {bundle.badge}
                      </Badge>
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{bundle.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{bundle.description}</p>
                      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                        {bundle.savings}
                      </div>
                    </div>
                    <CardContent className="p-4 border-t">
                      <div className="flex flex-wrap gap-1.5">
                        {bundle.items.map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                        onClick={() => navigateStore('products')}
                      >
                        Shop Bundle
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ── Newsletter Signup ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-0">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-8 sm:p-12 text-center relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-60 h-60 bg-teal-300 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Get Exclusive Deals in Your Inbox</h2>
                <p className="text-emerald-100/80 mb-6 max-w-md mx-auto">
                  Be the first to know about flash sales, new coupons, and member-only offers. No spam, unsubscribe anytime.
                </p>
                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/40"
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-lg h-11 shrink-0"
                    disabled={subscribing}
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
