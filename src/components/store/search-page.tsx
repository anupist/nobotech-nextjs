'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { fetchProducts, type Product } from '@/lib/api'
import { ProductCard } from './product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, X, TrendingUp, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

const SEARCH_HISTORY_KEY = 'shophub-search-history'
const MAX_HISTORY = 5

function getSearchHistory(): string[] {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    return stored ? JSON.parse(stored) as string[] : []
  } catch {
    return []
  }
}

function addSearchHistory(query: string) {
  try {
    const history = getSearchHistory().filter((h) => h !== query)
    history.unshift(query)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
  } catch { /* ignore */ }
}

function clearSearchHistory() {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch { /* ignore */ }
}

// Highlight matching text with emerald color
function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, idx) =>
        regex.test(part) ? (
          <span key={idx} className="text-emerald-600 font-semibold">{part}</span>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  )
}

export function SearchPage() {
  const searchQuery = useNavStore((s) => s.searchQuery)
  const navigateStore = useNavStore((s) => s.navigateStore)

  const [query, setQuery] = useState(searchQuery)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [didYouMean, setDidYouMean] = useState<string | null>(null)

  // Instant results dropdown state
  const [instantResults, setInstantResults] = useState<Product[]>([])
  const [showInstantDropdown, setShowInstantDropdown] = useState(false)
  const [instantLoading, setInstantLoading] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const instantDropdownRef = useRef<HTMLDivElement>(null)

  const trendingSearches = useMemo(() => ['iPhone', 'Nike', 'Headphones', 'Laptop', 'Camera', 'Samsung'], [])

  // All available product names for "Did you mean" suggestions
  const [allProductNames, setAllProductNames] = useState<string[]>([])

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const res = await fetchProducts({ limit: '50' })
        setAllProductNames(res.data.map((p) => p.name))
      } catch { /* ignore */ }
    }
    fetchNames()
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (instantDropdownRef.current && !instantDropdownRef.current.contains(e.target as Node)) {
        setShowInstantDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Instant search with 300ms debounce
  const handleInputChange = useCallback((value: string) => {
    setQuery(value)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    if (!value.trim()) {
      setInstantResults([])
      setShowInstantDropdown(false)
      setDidYouMean(null)
      return
    }

    setInstantLoading(true)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetchProducts({ search: value, limit: '5' })
        setInstantResults(res.data)
        setShowInstantDropdown(true)

        // "Did you mean?" suggestion - find closest matching product name
        if (res.data.length === 0 && allProductNames.length > 0) {
          const lowerVal = value.toLowerCase()
          const suggestion = allProductNames.find((name) =>
            name.toLowerCase().includes(lowerVal) ||
            lowerVal.split('').filter((c) => name.toLowerCase().includes(c)).length > lowerVal.length * 0.6
          )
          setDidYouMean(suggestion || null)
        } else {
          setDidYouMean(null)
        }
      } catch {
        setInstantResults([])
      } finally {
        setInstantLoading(false)
      }
    }, 300)
  }, [allProductNames])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setTotal(0)
      return
    }
    setLoading(true)
    setShowInstantDropdown(false)
    try {
      const res = await fetchProducts({ search: q, limit: '24' })
      setResults(res.data)
      setTotal(res.meta.total)
      addSearchHistory(q.trim())
      setSearchHistory(getSearchHistory())

      // "Did you mean?" for no exact matches
      if (res.data.length === 0 && allProductNames.length > 0) {
        const lowerVal = q.toLowerCase()
        const suggestion = allProductNames.find((name) =>
          name.toLowerCase().includes(lowerVal) ||
          lowerVal.split('').filter((c) => name.toLowerCase().includes(c)).length > lowerVal.length * 0.6
        )
        setDidYouMean(suggestion || null)
      } else {
        setDidYouMean(null)
      }
    } catch {
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [allProductNames])

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery)
      doSearch(searchQuery)
    }
  }, [searchQuery, doSearch])

  useEffect(() => {
    setSearchHistory(getSearchHistory())
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      useNavStore.getState().setSearchQuery(query.trim())
      doSearch(query.trim())
      setShowInstantDropdown(false)
    }
  }

  const handleInstantClick = (product: Product) => {
    addSearchHistory(product.name)
    navigateStore('product-detail', { id: product.id })
    setShowInstantDropdown(false)
  }

  const handleTrendingClick = (searchTerm: string) => {
    setQuery(searchTerm)
    useNavStore.getState().setSearchQuery(searchTerm)
    doSearch(searchTerm)
    setShowInstantDropdown(false)
  }

  const handleHistoryClick = (searchTerm: string) => {
    setQuery(searchTerm)
    useNavStore.getState().setSearchQuery(searchTerm)
    doSearch(searchTerm)
    setShowInstantDropdown(false)
  }

  const handleClearHistory = () => {
    clearSearchHistory()
    setSearchHistory([])
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <BreadcrumbNav items={[{ label: 'Search Results' }]} />

      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-6" ref={instantDropdownRef}>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (instantResults.length > 0) setShowInstantDropdown(true)
            }}
            className="pl-11 pr-10 h-12 text-base rounded-xl border-2 focus-visible:ring-emerald-500"
            autoFocus
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => {
                setQuery('')
                setInstantResults([])
                setShowInstantDropdown(false)
                setDidYouMean(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>

        {/* Instant Results Dropdown */}
        <AnimatePresence>
          {showInstantDropdown && query.trim().length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 left-0 right-0 mt-1 bg-background border rounded-xl shadow-lg overflow-hidden max-h-[400px]"
            >
              {instantLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : instantResults.length > 0 ? (
                <>
                  <div className="p-2">
                    {instantResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleInstantClick(product)}
                        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            <HighlightedText text={product.name} highlight={query} />
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-emerald-600">${(product.discountPrice || product.sellingPrice).toFixed(2)}</span>
                            {product.category && (
                              <Badge variant="secondary" className="text-[10px] border-0">{product.category.name}</Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                  <div className="border-t">
                    <button
                      onClick={() => {
                        useNavStore.getState().setSearchQuery(query.trim())
                        doSearch(query.trim())
                        setShowInstantDropdown(false)
                      }}
                      className="flex items-center justify-center gap-2 w-full p-3 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-medium transition-colors"
                    >
                      View All Results for &ldquo;{query}&rdquo;
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No products found for &ldquo;{query}&rdquo;
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trending Searches & Search History (below search bar) */}
      {!loading && !query && (
        <div className="max-w-2xl mx-auto space-y-4 mb-8">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Recent Searches
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-6" onClick={handleClearHistory}>
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    className="text-sm border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 gap-1.5"
                    onClick={() => handleHistoryClick(term)}
                  >
                    <Clock className="h-3 w-3" />
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  className="text-sm border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 gap-1.5"
                  onClick={() => handleTrendingClick(term)}
                >
                  <TrendingUp className="h-3 w-3" />
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && query && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {total} result{total !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>

          {/* Did you mean? */}
          {didYouMean && results.length === 0 && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-muted-foreground">Did you mean?</span>
                <button
                  onClick={() => handleTrendingClick(didYouMean)}
                  className="text-sm font-semibold text-emerald-600 hover:underline"
                >
                  {didYouMean}
                </button>
              </div>
            </div>
          )}

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try searching with different keywords
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {trendingSearches.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => handleTrendingClick(suggestion)}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Initial state - no search yet */}
      {!loading && !query && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">Search for Products</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Find what you&apos;re looking for
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {trendingSearches.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => handleTrendingClick(suggestion)}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
