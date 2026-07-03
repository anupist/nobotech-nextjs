'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { fetchAboutSections, type AboutSection, subscribeNewsletter } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import {
  Heart,
  Lightbulb,
  Users,
  Leaf,
  TrendingUp,
  Headphones,
  Package,
  Star,
  Mail,
  ArrowRight,
  Clock,
  Rocket,
  Globe2,
  Sparkles,
  Award,
  Shield,
  Zap,
  Target,
  Smile,
  Truck,
  RefreshCw,
  CheckCircle,
  BookOpen,
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { toast } from 'sonner'

/* ── Icon name → component map ── */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Lightbulb, Users, Leaf, TrendingUp, Headphones, Package,
  Star, Mail, ArrowRight, Clock, Rocket, Globe2, Sparkles, Award,
  Shield, Zap, Target, Smile, Truck, RefreshCw, CheckCircle, BookOpen,
}

function getIcon(name?: string): React.ComponentType<{ className?: string }> {
  if (!name) return Heart
  return iconMap[name] || Heart
}

function getItems(section: AboutSection): unknown[] {
  if (!section.items) return []
  if (Array.isArray(section.items)) return section.items
  return []
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function parseNumberValue(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const num = parseFloat(cleaned)
  if (isNaN(num)) return 0
  if (raw.toUpperCase().includes('K')) return Math.round(num * 1000)
  if (raw.toUpperCase().includes('M')) return Math.round(num * 1000000)
  return Math.round(num)
}

function extractSuffix(raw: string, explicitSuffix?: string): string {
  if (explicitSuffix) return explicitSuffix
  const s = raw.replace(/[0-9.]/g, '').trim()
  return s || '+'
}

/* ── Animated Counter ── */
function AnimatedCounter({ value, suffix, prefix }: { value: number; suffix: string; prefix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = Math.max(1, Math.floor(value / (duration / 16)))
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  const formatNum = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K'
    return String(n)
  }

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{formatNum(count)}{suffix}
    </span>
  )
}

/* ── Default fallback sections ── */
const defaultSections: AboutSection[] = [
  {
    id: 'default-hero',
    type: 'hero',
    title: 'Our Story',
    description: 'We started with a simple mission: make online shopping delightful, accessible, and sustainable. Today, we\'re a community of 50,000+ customers who trust us to deliver quality and value every day.',
    items: null, sortOrder: 0, isActive: true,
  },
  {
    id: 'default-values',
    type: 'values',
    title: 'What We Stand For',
    description: 'Our core values guide everything we do',
    items: [
      { icon: 'Award', title: 'Quality', description: 'We source only the finest products and rigorously test everything we sell. Quality is non-negotiable.', gradient: 'from-emerald-400 to-teal-500', bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30' },
      { icon: 'Lightbulb', title: 'Innovation', description: 'We constantly push boundaries with AI-powered recommendations, smart search, and seamless UX.', gradient: 'from-amber-400 to-orange-500', bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' },
      { icon: 'Users', title: 'Community', description: 'We build lasting relationships with our customers, listening and evolving together.', gradient: 'from-sky-400 to-blue-500', bg: 'from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30' },
      { icon: 'Leaf', title: 'Sustainability', description: 'Eco-friendly packaging, carbon-neutral shipping, and partnerships with green suppliers.', gradient: 'from-green-400 to-emerald-500', bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' },
    ],
    sortOrder: 1, isActive: true,
  },
  {
    id: 'default-stats',
    type: 'stats',
    title: null, description: null,
    items: [
      { number: '50000', label: 'Customers', icon: 'Users', suffix: '+', prefix: '' },
      { number: '10000', label: 'Products', icon: 'Package', suffix: '+', prefix: '' },
      { number: '99', label: 'Satisfaction', icon: 'Star', suffix: '%', prefix: '' },
      { number: '24', label: 'Support', icon: 'Headphones', suffix: '/7', prefix: '' },
    ],
    sortOrder: 2, isActive: true,
  },
  {
    id: 'default-team',
    type: 'team',
    title: 'Meet Our Team',
    description: 'The people behind ShopHub',
    items: [
      { name: 'Sarah Kim', role: 'CEO & Co-Founder', bio: 'Former Amazon PM with 10+ years in e-commerce. Passionate about building customer-first platforms.' },
      { name: 'Marcus Rivera', role: 'CTO', bio: 'Full-stack engineer and AI enthusiast. Previously led engineering at two Y Combinator startups.' },
      { name: 'Jessica Liu', role: 'Head of Design', bio: 'Award-winning UX designer. Believes great design is invisible — it just works.' },
      { name: 'David Patel', role: 'VP of Operations', bio: 'Supply chain expert with a passion for sustainable logistics and fast delivery.' },
    ],
    sortOrder: 3, isActive: true,
  },
  {
    id: 'default-timeline',
    type: 'timeline',
    title: 'Our Journey',
    description: 'Key milestones along the way',
    items: [
      { year: '2020', title: 'Founded', description: 'ShopHub was born from a simple idea: make online shopping delightful, not frustrating.', icon: 'Rocket' },
      { year: '2021', title: '10K Customers', description: 'Hit our first major milestone — 10,000 happy customers and growing fast.', icon: 'Users' },
      { year: '2022', title: 'Expanded Globally', description: 'Launched international shipping to 50+ countries across 6 continents.', icon: 'Globe2' },
      { year: '2023', title: 'AI Integration', description: 'Introduced AI-powered recommendations and our smart ShopBot assistant.', icon: 'Sparkles' },
      { year: '2024', title: '50K Community', description: 'Celebrated 50,000 community members with our biggest sale event ever.', icon: 'Heart' },
    ],
    sortOrder: 4, isActive: true,
  },
  {
    id: 'default-cta',
    type: 'cta',
    title: 'Join Our Journey',
    description: 'Subscribe to our newsletter and be part of the ShopHub community. Get exclusive deals and behind-the-scenes updates.',
    items: null, sortOrder: 5, isActive: true,
  },
]

/* ── Animation Variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ── Section Renderers ── */

function HeroSection({ section }: { section: AboutSection }) {
  return (
    <section className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-teal-300 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 py-14 relative z-10">
        <BreadcrumbNav items={[{ label: 'About Us' }]} />
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Heart className="h-4 w-4 text-emerald-200" />
            <span className="text-sm text-white/90 font-medium">Since 2020</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{section.title || 'Our Story'}</h1>
          <p className="text-lg text-emerald-100/80 leading-relaxed">
            {section.description || 'We started with a simple mission: make online shopping delightful, accessible, and sustainable.'}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function ValuesSection({ section }: { section: AboutSection }) {
  const items = getItems(section) as {
    icon?: string; title?: string; description?: string
    gradient?: string; bg?: string
  }[]
  if (!items.length) return null

  return (
    <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{section.title || 'What We Stand For'}</h2>
        <p className="text-muted-foreground">{section.description || 'Our core values guide everything we do'}</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((v, i) => {
          const Icon = getIcon(v.icon)
          const gradient = v.gradient || 'from-emerald-400 to-teal-500'
          const bg = v.bg || 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30'
          return (
            <motion.div key={v.title || i} variants={itemVariants}>
              <Card className={`overflow-hidden h-full hover:shadow-xl transition-shadow border-0 bg-gradient-to-br ${bg}`}>
                <CardContent className="p-6 text-center">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

function StatsSection({ section }: { section: AboutSection }) {
  const items = getItems(section) as {
    number?: string; label?: string; icon?: string
    suffix?: string; prefix?: string
  }[]
  if (!items.length) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700">
        <CardContent className="p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((s, i) => {
              const Icon = getIcon(s.icon)
              const numStr = String(s.number || '0')
              const numericValue = parseNumberValue(numStr)
              const suffix = extractSuffix(numStr, s.suffix)
              const prefix = s.prefix || ''
              return (
                <div key={s.label || i} className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                    <AnimatedCounter value={numericValue} suffix={suffix} prefix={prefix} />
                  </div>
                  <p className="text-sm text-emerald-100/80">{s.label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  )
}

function TeamSection({ section }: { section: AboutSection }) {
  const items = getItems(section) as { name?: string; role?: string; bio?: string; avatar?: string }[]
  if (!items.length) return null

  if (!items.length) return null

  return (
    <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{section.title || 'Meet Our Team'}</h2>
        <p className="text-muted-foreground">{section.description || 'The people behind ShopHub'}</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((m, i) => (
          <motion.div key={m.name || i} variants={itemVariants}>
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
              <CardContent className="p-6 text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">{getInitials(m.name || '?')}</span>
                </div>
                <h3 className="text-lg font-bold">{m.name}</h3>
                <p className="text-sm text-emerald-600 font-medium mb-2">{m.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.bio}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function TimelineSection({ section }: { section: AboutSection }) {
  const items = getItems(section) as { year?: string; title?: string; description?: string; icon?: string }[]
  if (!items.length) return null

  return (
    <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{section.title || 'Our Journey'}</h2>
        <p className="text-muted-foreground">{section.description || 'Key milestones along the way'}</p>
      </motion.div>
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-400 to-emerald-300 sm:-translate-x-0.5" />
        <div className="space-y-8">
          {items.map((item, i) => {
            const Icon = getIcon(item.icon)
            const isEven = i % 2 === 0
            return (
              <motion.div
                key={item.year || i}
                variants={itemVariants}
                className={`relative flex items-start gap-6 ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
              >
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-10">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 ring-4 ring-background">
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div className={`ml-14 sm:ml-0 sm:w-[calc(50%-2rem)] ${isEven ? 'sm:pr-0 sm:text-right' : 'sm:pl-0 sm:text-left'}`}>
                  <Card className="inline-block hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <Badge className="bg-emerald-600 text-white border-0 text-xs mb-2">{item.year}</Badge>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

function CtaSection({ section }: { section: AboutSection }) {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleNewsletter = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim()) return
      setSubscribing(true)
      try {
        await subscribeNewsletter(email)
        toast.success('Welcome aboard! You\'ll hear from us soon.')
        setEmail('')
      } catch {
        toast.error('Failed to subscribe. Please try again.')
      } finally {
        setSubscribing(false)
      }
    },
    [email]
  )

  return (
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
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{section.title || 'Join Our Journey'}</h2>
            <p className="text-emerald-100/80 mb-6 max-w-md mx-auto">
              {section.description || 'Subscribe to our newsletter and be part of the ShopHub community. Get exclusive deals and behind-the-scenes updates.'}
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
  )
}

/* ── Component ── */
export function AboutPage() {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const navigateStore = useNavStore((s) => s.navigateStore)

  useEffect(() => {
    fetchAboutSections()
      .then((res) => {
        setSections(res.data || [])
      })
      .catch(() => {
        setSections([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const displaySections = sections.length > 0 ? sections : defaultSections

  const sorted = [...displaySections].sort((a, b) => a.sortOrder - b.sortOrder)
  const hero = sorted.find((s) => s.type === 'hero')
  const rest = sorted.filter((s) => s.type !== 'hero')

  const renderSection = (section: AboutSection) => {
    switch (section.type) {
      case 'hero':
        return <HeroSection key={section.id} section={section} />
      case 'values':
        return <ValuesSection key={section.id} section={section} />
      case 'stats':
        return <StatsSection key={section.id} section={section} />
      case 'team':
        return <TeamSection key={section.id} section={section} />
      case 'timeline':
        return <TimelineSection key={section.id} section={section} />
      case 'cta':
        return <CtaSection key={section.id} section={section} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800">
          <div className="container mx-auto px-4 py-14">
            <BreadcrumbNav items={[{ label: 'About Us' }]} />
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <Skeleton className="h-8 w-48 mx-auto rounded-full" />
              <Skeleton className="h-12 w-72 mx-auto" />
              <Skeleton className="h-6 w-full max-w-lg mx-auto" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-10 space-y-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-6">
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-5 w-64 mx-auto" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-40 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {hero && renderSection(hero)}
      <div className="container mx-auto px-4 py-10 space-y-16">
        {rest.map(renderSection)}
      </div>
    </div>
  )
}
