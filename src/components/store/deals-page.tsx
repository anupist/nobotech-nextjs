'use client'

import { useState, useEffect } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { fetchFlashSales, formatPrice, getDiscountPercentage, type FlashSale } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import {
  Zap,
  Clock,
  Tag,
  Package,
  ArrowRight,
  Timer,
  Percent,
  ShoppingCart,
} from 'lucide-react'
import { motion } from 'framer-motion'

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function DealsPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const [flashSales, setFlashSales] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlashSales()
      .then((res) => setFlashSales(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeSales = flashSales.filter((fs) => fs.isActive && new Date(fs.endsAt) > new Date())

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="min-h-screen">
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
              Don&apos;t miss out on incredible savings. Deals refresh regularly!
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : activeSales.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Active Deals</h2>
            <p className="text-muted-foreground mb-6">Check back soon for new flash sales and offers!</p>
            <Button onClick={() => navigateStore('products')}>
              Browse Products
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ) : (
          activeSales.map((sale) => {
            const endsAt = new Date(sale.endsAt)
            const countdown = useCountdown(endsAt)

            return (
              <motion.section
                key={sale.id}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">{sale.name}</h2>
                        <div className="flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full">
                          <span className="relative flex h-2 w-2">
                            <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                          </span>
                          <span className="text-xs font-bold tracking-wider">LIVE</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Hurry, these won&apos;t last long!</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-xl">
                    <Timer className="h-4 w-4" />
                    {[
                      { value: pad(countdown.hours), label: 'HRS' },
                      { value: pad(countdown.minutes), label: 'MIN' },
                      { value: pad(countdown.seconds), label: 'SEC' },
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

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sale.products.map((sp) => {
                    const product = sp.product
                    const discount = getDiscountPercentage(product.sellingPrice, sp.salePrice)
                    return (
                      <motion.div key={sp.id} variants={itemVariants}>
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
                            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs font-bold">
                              <Percent className="h-3 w-3 mr-0.5" />
                              {discount}% OFF
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
                              <span className="text-emerald-600 font-bold">
                                {formatPrice(sp.salePrice)}
                              </span>
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.sellingPrice)}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] text-red-500 font-medium">Selling fast!</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {sp.soldCount}/{sp.soldCount + sp.quantity} sold
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-400 transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(10, (sp.soldCount / (sp.soldCount + sp.quantity || 1)) * 100))}%` }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>
            )
          })
        )}
      </div>
    </div>
  )
}
