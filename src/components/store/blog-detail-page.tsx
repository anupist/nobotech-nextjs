'use client'

import { useEffect, useState, useMemo } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  ArrowLeft,
  Tag,
  BookOpen,
  Share2,
  Facebook,
  Twitter,
  Link2,
  MessageCircle,
  Check,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import { SocialShare } from '@/components/store/social-share'

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
  authorId: string | null
  createdAt: string
  updatedAt: string
}

export function BlogDetailPage() {
  const pageParams = useNavStore((s) => s.pageParams)
  const navigateStore = useNavStore((s) => s.navigateStore)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    if (!pageParams.slug) return
    const loadPost = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/blog?slug=${encodeURIComponent(pageParams.slug)}`)
        const data = await res.json()
        if (data.success && data.data) {
          setPost(data.data)
          // Load related posts (same category)
          if (data.data.category) {
            const relRes = await fetch('/api/blog')
            const relData = await relRes.json()
            if (relData.success) {
              setRelatedPosts(
                relData.data
                  .filter((p: BlogPost) => p.id !== data.data.id && p.category === data.data.category)
                  .slice(0, 3)
              )
            }
          }
        } else {
          // Try loading all posts and find by slug
          const allRes = await fetch('/api/blog')
          const allData = await allRes.json()
          if (allData.success) {
            const found = allData.data.find((p: BlogPost) => p.slug === pageParams.slug)
            if (found) {
              setPost(found)
              if (found.category) {
                setRelatedPosts(
                  allData.data
                    .filter((p: BlogPost) => p.id !== found.id && p.category === found.category)
                    .slice(0, 3)
                )
              }
            }
          }
        }
      } catch {
        toast.error('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [pageParams.slug])

  const postTags = useMemo(() => {
    if (!post?.tags) return []
    try {
      return JSON.parse(post.tags) as string[]
    } catch {
      return post.tags.split(',').map((t) => t.trim())
    }
  }, [post])

  const getEstimatedReadTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="h-8 w-32 bg-muted rounded mb-8" />
          <div className="h-64 bg-muted rounded-xl mb-8" />
          <div className="h-8 w-3/4 bg-muted rounded mb-4" />
          <div className="h-4 w-1/4 bg-muted rounded mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-muted rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-4">The blog post you&apos;re looking for doesn&apos;t exist.</p>
        <Button
          onClick={() => navigateStore('blog')}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Hero Image */}
      <div className="relative w-full h-64 sm:h-80 md:h-[420px] overflow-hidden">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center">
            <BookOpen className="h-20 w-20 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back button overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white text-foreground backdrop-blur-sm"
            onClick={() => navigateStore('blog')}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Blog
          </Button>
        </div>

        {/* Category badge overlay */}
        {post.category && (
          <div className="absolute bottom-6 left-6 z-10">
            <Badge className={`${getCategoryColor(post.category)} border-0`}>
              <Tag className="h-3 w-3 mr-1" />
              {post.category}
            </Badge>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav items={[
          { label: 'Blog', page: 'blog' },
          { label: post.title },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Title & Meta */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-xs">
                      {post.authorId ? post.authorId.charAt(0).toUpperCase() : 'S'}
                    </span>
                  </div>
                  <span className="font-medium text-foreground">
                    {post.authorId ? `Author` : 'ShopHub Team'}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {getEstimatedReadTime(post.content)} min read
                </span>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-sm text-muted-foreground">Share:</span>
                <SocialShare productName={post.title} />
              </div>

              <Separator className="mb-8" />

              {/* Article Content */}
              <div
                className="prose prose-emerald max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-emerald-600 prose-strong:text-foreground prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }}
              />

              {/* Tags */}
              {postTags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    {postTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Share at Bottom */}
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Enjoyed this article? Share it!</span>
                <SocialShare productName={post.title} />
              </div>
            </motion.article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <div className="rounded-xl border p-5 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-lg">
                    {post.authorId ? post.authorId.charAt(0).toUpperCase() : 'S'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{post.authorId ? 'Author' : 'ShopHub Team'}</p>
                  <p className="text-xs text-muted-foreground">Content Writer</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Bringing you the latest insights and tips from the world of e-commerce.
              </p>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="rounded-xl border p-5 bg-card">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  Related Posts
                </h3>
                <div className="space-y-3">
                  {relatedPosts.map((relPost) => (
                    <button
                      key={relPost.id}
                      onClick={() => navigateStore('blog-detail', { slug: relPost.slug })}
                      className="flex items-start gap-3 w-full text-left group/rel hover:bg-muted/30 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                        {relPost.thumbnail ? (
                          <img src={relPost.thumbnail} alt={relPost.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                            <BookOpen className="h-4 w-4 text-emerald-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium line-clamp-2 group-hover/rel:text-emerald-600 transition-colors">
                          {relPost.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(relPost.createdAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog */}
            <Button
              variant="outline"
              className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              onClick={() => navigateStore('blog')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Blog Posts
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
