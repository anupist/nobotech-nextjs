'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavStore } from '@/stores/nav-store'
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchBanners,
  type Product,
  type Category,
  type Brand,
  type Banner,
  formatPrice,
  subscribeNewsletter,
} from '@/lib/api'
import { ProductCard } from './product-card'
import { RecentlyViewed } from './recently-viewed'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import {
  Star,
  ChevronRight,
  Clock,
  Zap,
  Sparkles,
  TrendingUp,
  Mail,
  ArrowRight,
  Quote,
  Laptop,
  Shirt,
  Home,
  Dumbbell,
  Book,
  Headphones,
  Camera,
  Footprints,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: 'easeOut' },
}

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-50px' },
  transition: { staggerChildren: 0.08 },
}

const staggerChild = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

export function HomePage() {
  const navigateStore = useNavStore((s) => s.navigateStore)

  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  // Flash sale countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [bannersRes, categoriesRes, featuredRes, newArrivalRes, bestSellerRes, brandsRes] =
          await Promise.all([
            fetchBanners('hero'),
            fetchCategories(),
            fetchProducts({ featured: 'true', limit: '10' }),
            fetchProducts({ newArrival: 'true', limit: '8' }),
            fetchProducts({ bestSeller: 'true', limit: '8' }),
            fetchBrands(),
          ])
        setBanners(bannersRes.data || [])
        setCategories(categoriesRes.data || [])
        setFeaturedProducts(featuredRes.data || [])
        setNewArrivals(newArrivalRes.data || [])
        setBestSellers(bestSellerRes.data || [])
        setBrands(brandsRes.data || [])
      } catch {
        // Silently handle errors - components will show empty state
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Flash sale countdown timer
  useEffect(() => {
    const endTime = new Date()
    endTime.setHours(endTime.getHours() + 23)
    endTime.setMinutes(endTime.getMinutes() + 59)

    const timer = setInterval(() => {
      const now = new Date()
      const diff = endTime.getTime() - now.getTime()
      if (diff <= 0) {
        clearInterval(timer)
        return
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleNewsletter = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newsletterEmail.trim()) return
      setSubscribing(true)
      try {
        await subscribeNewsletter(newsletterEmail)
        toast.success('Subscribed successfully!')
        setNewsletterEmail('')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to subscribe')
      } finally {
        setSubscribing(false)
      }
    },
    [newsletterEmail]
  )

  // Category icons mapping with Lucide icons and gradient backgrounds
  const categoryIconConfig = useMemo(
    () => [
      { Icon: Laptop, gradient: 'from-emerald-400 to-teal-500' },
      { Icon: Shirt, gradient: 'from-rose-400 to-pink-500' },
      { Icon: Home, gradient: 'from-amber-400 to-orange-500' },
      { Icon: Dumbbell, gradient: 'from-sky-400 to-cyan-500' },
      { Icon: Book, gradient: 'from-violet-400 to-purple-500' },
      { Icon: Headphones, gradient: 'from-indigo-400 to-blue-500' },
      { Icon: Camera, gradient: 'from-red-400 to-rose-500' },
      { Icon: Footprints, gradient: 'from-lime-400 to-green-500' },
    ],
    []
  )

  // Testimonials
  const testimonials = useMemo(
    () => [
      {
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/100?u=sarah',
        rating: 5,
        comment: 'Amazing shopping experience! The products are top quality and delivery was super fast. Will definitely shop here again.',
      },
      {
        name: 'Michael Chen',
        avatar: 'https://i.pravatar.cc/100?u=michael',
        rating: 5,
        comment: 'Great selection of products and competitive prices. The customer service team was very helpful when I had questions.',
      },
      {
        name: 'Emily Davis',
        avatar: 'https://i.pravatar.cc/100?u=emily',
        rating: 4,
        comment: 'Love the variety of products available. The flash sales are incredible - got some amazing deals! Highly recommended.',
      },
    ],
    []
  )

  if (loading) {
    return <HomePageSkeleton />
  }

  return (
    <div className="space-y-16 pb-12 hero-parallax-bg">
      {/* Hero Banner Carousel */}
      <motion.section
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Carousel opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {banners.length > 0 ? (
              banners.map((banner, bannerIdx) => (
                <CarouselItem key={banner.id}>
                  <div className="relative h-[300px] sm:h-[420px] lg:h-[540px] overflow-hidden">
                    <motion.div
                      className="absolute inset-0"
                      style={{ y: 0 }}
                    >
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover scale-105"
                      />
                    </motion.div>

                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10 hero-gradient-animated" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Floating shapes (CSS-only particles) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="hero-shape-1 absolute top-[15%] right-[15%] w-20 h-20 border border-white/10 rounded-full" />
                      <div className="hero-shape-2 absolute top-[60%] right-[25%] w-12 h-12 border border-white/8 rounded-lg rotate-45" />
                      <div className="hero-shape-3 absolute top-[30%] right-[40%] w-6 h-6 bg-white/5 rounded-full" />
                      <div className="hero-shape-1 absolute bottom-[20%] right-[10%] w-16 h-16 border border-white/6 rounded-full" style={{ animationDelay: '2s' }} />
                      <div className="hero-shape-2 absolute top-[45%] right-[55%] w-8 h-8 bg-emerald-400/5 rounded-full" style={{ animationDelay: '1s' }} />
                      <div className="hero-shape-3 absolute top-[10%] right-[35%] w-10 h-10 border border-white/5 rotate-12" style={{ animationDelay: '3s' }} />
                    </div>

                    <div className="absolute inset-0 flex items-center">
                      <div className="container mx-auto px-4">
                        <div className="max-w-lg space-y-5">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex items-center gap-2"
                          >
                            <Badge className="bg-emerald-500/90 text-white border-0 backdrop-blur-sm px-3 py-1 text-xs font-medium tracking-wide uppercase">
                              New Collection
                            </Badge>
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1 text-xs font-bold tracking-wider uppercase badge-pulse">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          </motion.div>
                          <motion.h1
                            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                          >
                            {banner.title}
                          </motion.h1>
                          <motion.p
                            className="text-sm sm:text-base text-white/80 max-w-md"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                          >
                            {banner.subtitle || 'Discover the latest trends with up to 50% off on selected items'}
                          </motion.p>
                          <motion.div
                            className="flex gap-3"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                          >
                            <Button
                              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-400/50 transition-all duration-300 px-7 hover:scale-[1.03] glow-pulse"
                              onClick={() => navigateStore('products')}
                            >
                              Shop Now
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="border-white/40 text-white hover:bg-white/15 backdrop-blur-sm transition-all duration-300 px-6 hover:border-white/60"
                              onClick={() => navigateStore('products', { featured: 'true' })}
                            >
                              View Featured
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Slide indicators with emerald gradient active state */}
                    {banners.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {banners.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              idx === bannerIdx
                                ? 'w-8 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-400/50'
                                : 'w-3 bg-white/40 hover:bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem>
                <div className="relative h-[300px] sm:h-[420px] lg:h-[540px] overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-600 to-emerald-800 hero-gradient-animated">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                  {/* Floating shapes */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="hero-shape-1 absolute top-20 right-20 w-24 h-24 bg-white/5 rounded-full" />
                    <div className="hero-shape-2 absolute bottom-10 left-10 w-16 h-16 bg-teal-400/10 rounded-full" />
                    <div className="hero-shape-3 absolute top-1/3 right-1/3 w-8 h-8 bg-white/5 rounded-lg rotate-45" />
                    <div className="hero-shape-1 absolute bottom-1/3 right-[15%] w-12 h-12 border border-white/10 rounded-full" style={{ animationDelay: '2s' }} />
                    <div className="hero-shape-2 absolute top-[20%] left-[30%] w-6 h-6 bg-emerald-300/10 rounded-full" style={{ animationDelay: '1s' }} />
                  </div>
                  <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-10 left-10 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-4">
                      <div className="max-w-lg space-y-5">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="flex items-center gap-2"
                        >
                          <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-3 py-1">Welcome</Badge>
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1 text-xs font-bold tracking-wider uppercase badge-pulse">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        </motion.div>
                        <motion.h1
                          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1]"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                        >
                          Discover Your Style
                        </motion.h1>
                        <motion.p
                          className="text-sm sm:text-base text-white/80"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          Shop the latest trends with incredible deals and free shipping on orders over $50
                        </motion.p>
                        <motion.div
                          className="flex gap-3"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                        >
                          <Button
                            className="bg-white text-emerald-700 hover:bg-white/90 shadow-lg shadow-black/10 transition-all duration-300 px-7 hover:scale-[1.03] glow-pulse"
                            onClick={() => navigateStore('products')}
                          >
                            Shop Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/15 backdrop-blur-md border-0 text-white hover:bg-white/25 transition-all" />
          <CarouselNext className="right-4 bg-white/15 backdrop-blur-md border-0 text-white hover:bg-white/25 transition-all" />
        </Carousel>
      </motion.section>

      {/* Category Grid */}
      {categories.length > 0 && (
        <motion.section
          className="container mx-auto px-4"
          {...fadeInUp}
        >
          <div className="flex items-center justify-between mb-8">
            <motion.div {...fadeInUp}>
              <h2 className="text-2xl font-bold">Shop by Category</h2>
              <p className="text-sm text-muted-foreground mt-1">Browse our wide range of categories</p>
            </motion.div>
            <Button variant="ghost" onClick={() => navigateStore('products')} className="text-emerald-600 hover:text-emerald-700">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            {...staggerContainer}
          >
            {categories.slice(0, 8).map((cat, idx) => {
              const iconConfig = categoryIconConfig[idx] || { Icon: Laptop, gradient: 'from-emerald-400 to-teal-500' }
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => navigateStore('products', { category: cat.slug })}
                  className="group flex flex-col items-center gap-3 p-5 rounded-xl border bg-card hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -4, scale: 1.02 }}
                  {...staggerChild}
                >
                  <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${iconConfig.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                    <iconConfig.Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center group-hover:text-emerald-600 transition-colors">
                    {cat.name}
                  </span>
                  {cat._count && (
                    <span className="text-[10px] text-muted-foreground">
                      {cat._count.products} products
                    </span>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        </motion.section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <motion.section
          className="relative"
          {...fadeInUp}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between mb-8">
              <motion.div className="flex items-center gap-3" {...fadeInUp}>
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Featured Products</h2>
                  <p className="text-xs text-muted-foreground">Handpicked just for you</p>
                </div>
              </motion.div>
              <Button variant="ghost" onClick={() => navigateStore('products', { featured: 'true' })} className="text-emerald-600">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
              {featuredProducts.map((product) => (
                <div key={product.id} className="min-w-[220px] sm:min-w-[240px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Flash Sale */}
      <motion.section
        className="relative overflow-hidden"
        {...fadeInUp}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
        <div className="container mx-auto px-4 py-10 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="h-7 w-7 text-yellow-300" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">Flash Sale</h2>
                <p className="text-sm text-white/80">Limited time deals - Don&apos;t miss out!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/80" />
              <span className="text-sm text-white/80">Ends in:</span>
              <div className="flex gap-2">
                {[
                  { value: timeLeft.hours, label: 'H' },
                  { value: timeLeft.minutes, label: 'M' },
                  { value: timeLeft.seconds, label: 'S' },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center shadow-lg shadow-black/10 min-w-[48px]"
                    style={{ boxShadow: '0 0 15px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                  >
                    <span className="text-lg font-bold text-white">{String(t.value).padStart(2, '0')}</span>
                    <span className="text-[10px] ml-0.5 text-white/70">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredProducts
              .filter((p) => p.discountPrice)
              .slice(0, 5)
              .map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden shadow-xl ring-1 ring-white/50"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            {featuredProducts.filter((p) => p.discountPrice).length === 0 && (
              <div className="col-span-full text-center py-12 text-white/80">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">Check back soon for amazing flash sale deals!</p>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <motion.section
          className="container mx-auto px-4"
          {...fadeInUp}
        >
          <div className="flex items-center justify-between mb-8">
            <motion.div className="flex items-center gap-4" {...fadeInUp}>
              <span className="text-5xl font-black text-emerald-100 select-none">01</span>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-2xl font-bold">New Arrivals</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Fresh from our collection</p>
              </div>
            </motion.div>
            <Button variant="ghost" onClick={() => navigateStore('products', { newArrival: 'true' })} className="text-emerald-600">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <motion.section
          className="container mx-auto px-4"
          {...fadeInUp}
        >
          <div className="flex items-center justify-between mb-8">
            <motion.div className="flex items-center gap-4" {...fadeInUp}>
              <span className="text-5xl font-black text-emerald-100 select-none">02</span>
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-2xl font-bold">Best Sellers</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Our most popular picks</p>
              </div>
            </motion.div>
            <Button variant="ghost" onClick={() => navigateStore('products', { bestSeller: 'true' })} className="text-emerald-600">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Brand Showcase */}
      {brands.length > 0 && (
        <motion.section
          className="container mx-auto px-4"
          {...fadeInUp}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Top Brands</h2>
            <p className="text-sm text-muted-foreground mt-1">Shop from your favorite brands</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {brands.slice(0, 12).map((brand) => (
              <motion.button
                key={brand.id}
                onClick={() => navigateStore('products', { brand: brand.slug })}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:border-emerald-300 hover:shadow-md transition-all duration-300"
                whileHover={{ y: -2 }}
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-10 w-10 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-600 font-bold text-sm grayscale group-hover:grayscale-0 transition-all duration-300">
                    {brand.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-medium text-center group-hover:text-emerald-600 transition-colors">{brand.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Testimonials */}
      <motion.section
        className="py-16 relative"
        {...fadeInUp}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />
        <div className="container mx-auto px-4 relative">
          <motion.div className="text-center mb-10" {...fadeInUp}>
            <h2 className="text-2xl font-bold">What Our Customers Say</h2>
            <p className="text-sm text-muted-foreground mt-1">Real reviews from real customers</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                className="relative rounded-xl p-[1px] bg-gradient-to-br from-emerald-200 via-teal-200 to-emerald-100"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-card rounded-xl p-6 shadow-sm h-full">
                  <Quote className="h-8 w-8 text-emerald-200 mb-3" />
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-200 ring-offset-2 ring-offset-card"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= t.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Newsletter CTA */}
      <motion.section
        className="container mx-auto px-4"
        {...fadeInUp}
      >
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-8 sm:p-14 text-white text-center overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-8 w-16 h-16 bg-white/5 rounded-full" />
          <div className="absolute bottom-4 left-12 w-12 h-12 bg-white/5 rounded-full" />
          <div className="relative">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block"
            >
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-80" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Stay in the Loop</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and special deals.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="h-11 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white backdrop-blur-sm"
                required
              />
              <Button
                type="submit"
                className="h-11 bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-lg shadow-black/10 transition-all duration-300"
                disabled={subscribing}
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

function HomePageSkeleton() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero skeleton */}
      <Skeleton className="h-[300px] sm:h-[400px] lg:h-[500px] w-full" />

      {/* Categories skeleton */}
      <div className="container mx-auto px-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Products skeleton */}
      <div className="container mx-auto px-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
