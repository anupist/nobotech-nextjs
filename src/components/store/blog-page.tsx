'use client'

import { useEffect, useState, useMemo } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  ArrowRight,
  Tag,
  Search,
  BookOpen,
  Mail,
  Sparkles,
  TrendingUp,
  PenTool,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { subscribeNewsletter } from '@/lib/api'
import { toast } from 'sonner'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  thumbnail: string | null
  category: string | null
  tags: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export function BlogPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/blog')
        const data = await res.json()
        if (data.success) {
          setPosts(data.data)
        }
      } catch {
        toast.error('Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    posts.forEach((p) => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats)
  }, [posts])

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts
    return posts.filter((p) => p.category === activeCategory)
  }, [posts, activeCategory])

  const featuredPost = filteredPosts[0]
  const gridPosts = filteredPosts.slice(1, 5)
  const recentPosts = posts.slice(0, 5)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribing(true)
    try {
      await subscribeNewsletter(email)
      toast.success('Subscribed! Check your inbox for confirmation.')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  const handleReadMore = (post: BlogPost) => {
    navigateStore('blog-detail', { slug: post.slug })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-emerald-100 text-emerald-700'
    const l = category.toLowerCase()
    if (l.includes('tech') || l.includes('technology')) return 'bg-blue-100 text-blue-700'
    if (l.includes('lifestyle')) return 'bg-pink-100 text-pink-700'
    if (l.includes('guide') || l.includes('how')) return 'bg-amber-100 text-amber-700'
    if (l.includes('news')) return 'bg-red-100 text-red-700'
    return 'bg-emerald-100 text-emerald-700'
  }

  const getEstimatedReadTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-80 bg-muted rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <BreadcrumbNav items={[{ label: 'Blog' }]} />

      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">
            <BookOpen className="h-3 w-3 mr-1" />
            Our Blog
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Insights &{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Stories
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the latest tips, trends, and stories from the world of e-commerce and beyond.
          </p>
        </motion.div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              !activeCategory
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All Posts
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Post (Hero) */}
          {featuredPost && (
            <motion.article
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleReadMore(featuredPost)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image */}
                <div className="aspect-video md:aspect-auto relative overflow-hidden">
                  {featuredPost.thumbnail ? (
                    <img
                      src={featuredPost.thumbnail}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[240px] flex items-center justify-center bg-emerald-500/20">
                      <PenTool className="h-16 w-16 text-white/40" />
                    </div>
                  )}
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </div>
                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col justify-center text-white">
                  {featuredPost.category && (
                    <Badge className={`w-fit mb-3 ${getCategoryColor(featuredPost.category)} border-0 text-xs`}>
                      <Tag className="h-2.5 w-2.5 mr-1" />
                      {featuredPost.category}
                    </Badge>
                  )}
                  <h2 className="text-xl md:text-2xl font-bold mb-3 leading-tight group-hover:text-emerald-100 transition-colors">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-emerald-100/80 text-sm mb-4 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-emerald-200/70 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(featuredPost.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getEstimatedReadTime(featuredPost.content)} min read
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white group-hover:gap-2.5 transition-all duration-200">
                      Read Article
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          )}

          {/* Grid Posts */}
          {gridPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {gridPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  className="group rounded-xl overflow-hidden border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  onClick={() => handleReadMore(post)}
                >
                  {/* Image */}
                  <div className="aspect-video relative overflow-hidden">
                    {post.thumbnail ? (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                        <BookOpen className="h-10 w-10 text-emerald-300" />
                      </div>
                    )}
                    {post.category && (
                      <Badge className={`absolute top-3 left-3 ${getCategoryColor(post.category)} border-0 text-[10px]`}>
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.createdAt)}
                      </span>
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        Read More <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">
                {activeCategory ? `No posts in "${activeCategory}" category.` : 'No blog posts available yet.'}
              </p>
              {activeCategory && (
                <Button
                  variant="outline"
                  className="mt-4 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => setActiveCategory(null)}
                >
                  View All Posts
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <div className="rounded-xl border p-5 bg-card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-600" />
              Search
            </h3>
            <Input
              placeholder="Search articles..."
              className="focus-visible:ring-emerald-500"
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="rounded-xl border p-5 bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-600" />
                Categories
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    !activeCategory ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-muted/50'
                  }`}
                >
                  <span>All Categories</span>
                  <Badge variant="secondary" className="text-[10px]">{posts.length}</Badge>
                </button>
                {categories.map((cat) => {
                  const count = posts.filter((p) => p.category === cat).length
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === cat ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-muted/50'
                      }`}
                    >
                      <span>{cat}</span>
                      <Badge variant="secondary" className="text-[10px]">{count}</Badge>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent Posts */}
          {recentPosts.length > 0 && (
            <div className="rounded-xl border p-5 bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Recent Posts
              </h3>
              <div className="space-y-3">
                {recentPosts.slice(0, 4).map((post) => (
                  <button
                    key={post.id}
                    onClick={() => handleReadMore(post)}
                    className="flex items-start gap-3 w-full text-left group/post hover:bg-muted/30 p-2 rounded-lg transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                          <BookOpen className="h-5 w-5 text-emerald-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-2 group-hover/post:text-emerald-600 transition-colors">
                        {post.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="rounded-xl border p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <div className="text-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Newsletter</h3>
              <p className="text-xs text-muted-foreground">
                Get the latest articles delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/80 dark:bg-background/80 focus-visible:ring-emerald-500"
              />
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={subscribing}
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
