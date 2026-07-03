'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Search,
  HelpCircle,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  Shirt,
  UserCircle,
  MessageCircle,
  ChevronRight,
  Info,
  Shield,
  Clock,
  DollarSign,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import { fetchFAQ, type FAQCategory as APIFAQCategory } from '@/lib/api'

interface FAQItemData {
  question: string
  answer: string
  icon: React.ComponentType<{ className?: string }>
}

interface FAQCategoryData {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: FAQItemData[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HelpCircle,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  Shirt,
  UserCircle,
  MessageCircle,
  Info,
  Shield,
  Clock,
  DollarSign,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function FAQPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [categories, setCategories] = useState<FAQCategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(false)
    fetchFAQ()
      .then((res) => {
        if (!mounted) return
        if (res.success && res.data) {
          const mapped: FAQCategoryData[] = res.data.map((cat: APIFAQCategory) => ({
            id: cat.id,
            label: cat.name,
            icon: iconMap[cat.icon ?? ''] ?? HelpCircle,
            items: cat.faqs.map((faq) => ({
              question: faq.question,
              answer: faq.answer,
              icon: HelpCircle,
            })),
          }))
          setCategories(mapped)
          if (mapped.length > 0) {
            setActiveCategory(mapped[0].id)
          }
        } else {
          setError(true)
        }
        setLoading(false)
      })
      .catch(() => {
        if (mounted) {
          setError(true)
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const query = searchQuery.toLowerCase()
    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.items.length > 0)
  }, [searchQuery, categories])

  const scrollToCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId)
    const el = categoryRefs.current[categoryId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchQuery('')
  }, [])

  useEffect(() => {
    categoryRefs.current[activeCategory] = categoryRefs.current[activeCategory]
  }, [activeCategory])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <BreadcrumbNav items={[{ label: 'FAQ' }]} />
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <HelpCircle className="h-4 w-4 text-emerald-200" />
              <span className="text-sm text-white/90 font-medium">Find answers quickly</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Help Center</h1>
            <p className="text-lg text-emerald-100/80 mb-8">
              Search our FAQ or browse by category to find the answers you need.
            </p>
            {/* Search Input */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-12 text-base bg-white dark:bg-gray-900 border-0 shadow-lg rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <HelpCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load FAQ</h3>
            <p className="text-muted-foreground mb-4">Something went wrong. Please try again later.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No FAQ data available</h3>
            <p className="text-muted-foreground">Check back later for updates.</p>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            {!searchQuery && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {filteredData.map((category) => {
                    const Icon = category.icon
                    const isActive = activeCategory === category.id
                    return (
                      <button
                        key={category.id}
                        onClick={() => scrollToCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Search Results Info */}
            {searchQuery && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-sm text-muted-foreground">
                  {filteredData.reduce((acc, cat) => acc + cat.items.length, 0)} result
                  {filteredData.reduce((acc, cat) => acc + cat.items.length, 0) !== 1 ? 's' : ''} for
                  &ldquo;{searchQuery}&rdquo;
                </p>
              </motion.div>
            )}

            {/* FAQ Content */}
            <motion.div
              className="space-y-10 max-w-3xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredData.length === 0 ? (
                <motion.div className="text-center py-16" variants={itemVariants}>
                  <HelpCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try a different search term or browse categories above.
                  </p>
                </motion.div>
              ) : (
                filteredData.map((category) => {
                  const CategoryIcon = category.icon
                  return (
                    <motion.div
                      key={category.id}
                      ref={(el) => {
                        categoryRefs.current[category.id] = el
                      }}
                      variants={itemVariants}
                    >
                      {!searchQuery && (
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center">
                            <CategoryIcon className="h-4 w-4 text-emerald-600" />
                          </div>
                          <h2 className="text-xl font-bold">{category.label}</h2>
                          <Badge variant="secondary" className="text-xs">
                            {category.items.length} questions
                          </Badge>
                        </div>
                      )}
                      <Card className="overflow-hidden">
                        <CardContent className="p-0">
                          <Accordion type="single" collapsible className="w-full">
                            {category.items.map((item, idx) => {
                              const ItemIcon = item.icon
                              return (
                                <AccordionItem
                                  key={idx}
                                  value={`${category.id}-${idx}`}
                                  className={
                                    idx === category.items.length - 1 ? 'border-b-0' : ''
                                  }
                                >
                                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors group text-left">
                                    <div className="flex items-center gap-3 text-left">
                                      <ItemIcon className="h-4 w-4 text-emerald-500 shrink-0 group-hover:text-emerald-600 transition-colors" />
                                      <span className="font-medium text-sm">
                                        {item.question}
                                      </span>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-5 pb-4">
                                    <div className="pl-7 text-sm text-muted-foreground leading-relaxed">
                                      {item.answer}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              )
                            })}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          </>
        )}

        {/* Still Need Help CTA */}
        <motion.section
          className="mt-16 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Can&apos;t find what you&apos;re looking for? Our support team is ready to assist
                you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                  onClick={() => navigateStore('contact')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
                <Button
                  variant="outline"
                  className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Browse All Topics
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
