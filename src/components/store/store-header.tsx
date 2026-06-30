'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { fetchCategories, fetchProducts, type Category, type Product } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ShoppingCart,
  Heart,
  Search,
  User,
  Menu,
  ChevronDown,
  Package,
  LayoutDashboard,
  LogOut,
  X,
  Smartphone,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
  Sparkles,
  Gift,
  Megaphone,
  ArrowRight,
  Clock,
  TrendingUp,
  Command,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { NotificationCenter } from '@/components/store/notification-center'

const categoryIconMap: Record<string, LucideIcon> = {
  electronics: Smartphone,
  clothing: Shirt,
  'home-kitchen': Home,
  'sports-outdoors': Dumbbell,
  'books-media': BookOpen,
}

function getCategoryIcon(slug: string): LucideIcon {
  for (const [key, icon] of Object.entries(categoryIconMap)) {
    if (slug.toLowerCase().includes(key) || key.includes(slug.toLowerCase())) {
      return icon
    }
  }
  return Package
}

const SEARCH_HISTORY_KEY = 'shophub-search-history'
const MAX_HISTORY = 5

const TRENDING_SEARCHES = [
  'Wireless Headphones',
  'Running Shoes',
  'Smart Watch',
  'Laptop Stand',
  'Yoga Mat',
]

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

export function StoreHeader() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [announcementPaused, setAnnouncementPaused] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaMenuRef = useRef<HTMLDivElement>(null)

  const navigateStore = useNavStore((s) => s.navigateStore)
  const itemCount = useCartStore((s) => s.getItemCount())
  const prevItemCountRef = useRef(itemCount)
  const [cartBadgeBounce, setCartBadgeBounce] = useState(false)
  const setOpen = useCartStore((s) => s.setOpen)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)

  const isAdminUser = user && ['super_admin', 'admin', 'product_manager', 'order_manager', 'customer_support'].includes(user.role)

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {})
  }, [])

  // Detect scroll for shadow + scale
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cart badge bounce when item count changes
  useEffect(() => {
    if (itemCount !== prevItemCountRef.current && prevItemCountRef.current !== 0) {
      const timer = setTimeout(() => {
        setCartBadgeBounce(true)
        setTimeout(() => setCartBadgeBounce(false), 600)
      }, 0)
      return () => clearTimeout(timer)
    }
    prevItemCountRef.current = itemCount
  }, [itemCount])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (searchInputRef.current) {
          searchInputRef.current.focus()
          setSearchFocused(true)
        }
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false)
        setSearchFocused(false)
        searchInputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load search history when search input gets focus
  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true)
    setSearchHistory(getSearchHistory())
    if (searchSuggestions.length > 0) setShowSuggestions(true)
  }, [searchSuggestions.length])

  // Debounced search suggestions
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      if (!value.trim() || value.length < 2) {
        setSearchSuggestions([])
        setShowSuggestions(false)
        return
      }
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetchProducts({ search: value, limit: '5' })
          setSearchSuggestions(res.data || [])
          setShowSuggestions(true)
        } catch {
          setSearchSuggestions([])
        }
      }, 300)
    },
    []
  )

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchValue.trim()) {
        addSearchHistory(searchValue.trim())
        useNavStore.getState().setSearchQuery(searchValue.trim())
        navigateStore('search')
        setSearchOpen(false)
        setShowSuggestions(false)
        setSearchFocused(false)
      }
    },
    [searchValue, navigateStore]
  )

  const handleSuggestionClick = useCallback(
    (product: Product) => {
      addSearchHistory(product.name)
      navigateStore('product-detail', { id: product.id })
      setShowSuggestions(false)
      setSearchFocused(false)
      handleSearchChange('')
    },
    [navigateStore, handleSearchChange]
  )

  const handleHistoryClick = useCallback(
    (query: string) => {
      setSearchValue(query)
      useNavStore.getState().setSearchQuery(query)
      navigateStore('search')
      setShowSuggestions(false)
      setSearchFocused(false)
    },
    [navigateStore]
  )

  const handleTrendingClick = useCallback(
    (query: string) => {
      setSearchValue(query)
      addSearchHistory(query)
      useNavStore.getState().setSearchQuery(query)
      navigateStore('search')
      setShowSuggestions(false)
      setSearchFocused(false)
    },
    [navigateStore]
  )

  // Mega menu hover handlers with delay
  const handleMegaMenuEnter = useCallback(() => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current)
    setMegaMenuOpen(true)
  }, [])

  const handleMegaMenuLeave = useCallback(() => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false)
    }, 200)
  }, [])

  const wishlistCount = 0

  // Filter top-level categories for mega menu
  const topLevelCategories = categories.filter((c) => !c.parentId)
  const childrenCategories = categories.filter((c) => c.parentId)

  // Whether to show the search dropdown (suggestions, history, or trending)
  const showDropdown = searchFocused && (searchSuggestions.length > 0 || !searchValue.trim())

  return (
    <header
      className={`sticky top-0 z-50 w-full header-border-gradient ${scrolled ? 'scrolled' : ''} bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
        scrolled ? 'shadow-lg shadow-black/5 backdrop-blur-lg' : ''
      }`}
    >
      {/* Enhanced Announcement Bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white text-xs py-1.5">
        <div
          className="flex whitespace-nowrap"
          onMouseEnter={() => setAnnouncementPaused(true)}
          onMouseLeave={() => setAnnouncementPaused(false)}
        >
          <div
            className={`flex items-center gap-8 ${
              announcementPaused ? '' : 'animate-marquee'
            }`}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 shrink-0" />
                <span>Free shipping on orders over $50!</span>
                <span className="mx-2 opacity-40">|</span>
                <Gift className="h-3 w-3 shrink-0" />
                <span>Use code <span className="font-bold">FREESHIP</span> at checkout</span>
                <span className="mx-2 opacity-40">|</span>
                <Megaphone className="h-3 w-3 shrink-0" />
                <span>New arrivals every week — Shop now!</span>
                <span className="mx-2 opacity-40">|</span>
                <span className="font-bold">20% OFF</span>
                <span>with code SAVE20</span>
                <span className="mx-8" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                  <button
                    onClick={() => { navigateStore('home'); setMobileMenuOpen(false) }}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-7 w-7 text-emerald-600" />
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                      ShopHub
                    </span>
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  <button
                    onClick={() => { navigateStore('home'); setMobileMenuOpen(false) }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => { navigateStore('products'); setMobileMenuOpen(false) }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    Products
                  </button>
                  <div className="pt-2 pb-1 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Categories
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        navigateStore('products', { category: cat.slug })
                        setMobileMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                  <button
                    onClick={() => { navigateStore('wishlist'); setMobileMenuOpen(false) }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </button>
                  <button
                    onClick={() => { navigateStore('blog'); setMobileMenuOpen(false) }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    Blog
                  </button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo with gradient */}
          <button
            onClick={() => navigateStore('home')}
            className="flex items-center gap-2 shrink-0 group logo-glow transition-filter duration-300"
          >
            <Package className="h-7 w-7 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              ShopHub
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            <button
              onClick={() => navigateStore('home')}
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            >
              Home
            </button>
            <span className="w-px h-4 bg-border/60" aria-hidden="true" />
            <button
              onClick={() => navigateStore('products')}
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            >
              Products
            </button>
            <span className="w-px h-4 bg-border/60" aria-hidden="true" />

            {/* Mega Menu Categories */}
            <div
              className="relative"
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  megaMenuOpen ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                Categories
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    ref={megaMenuRef}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[min(95vw,900px)] bg-background border rounded-b-xl shadow-xl z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{ transformOrigin: 'top center' }}
                  >
                    <div className="flex">
                      {/* Left: Category Grid */}
                      <div className="flex-1 p-6">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Browse Categories</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {topLevelCategories.map((cat) => {
                            const Icon = getCategoryIcon(cat.slug)
                            const catChildren = childrenCategories.filter((c) => c.parentId === cat.id)
                            return (
                              <div key={cat.id} className="group/cat">
                                <button
                                  onClick={() => {
                                    navigateStore('products', { category: cat.slug })
                                    setMegaMenuOpen(false)
                                  }}
                                  className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 hover:bg-emerald-50 transition-colors text-left"
                                >
                                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0 group-hover/cat:from-emerald-200 group-hover/cat:to-teal-200 transition-colors">
                                    <Icon className="h-4.5 w-4.5 text-emerald-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium group-hover/cat:text-emerald-600 transition-colors">{cat.name}</p>
                                    {cat._count && (
                                      <p className="text-xs text-muted-foreground">{cat._count.products} products</p>
                                    )}
                                  </div>
                                </button>
                                {catChildren.length > 0 && (
                                  <div className="ml-12 mt-0.5 space-y-0.5">
                                    {catChildren.slice(0, 3).map((child) => (
                                      <button
                                        key={child.id}
                                        onClick={() => {
                                          navigateStore('products', { category: child.slug })
                                          setMegaMenuOpen(false)
                                        }}
                                        className="block text-xs text-muted-foreground hover:text-emerald-600 py-0.5 transition-colors"
                                      >
                                        {child.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Right: Featured Promotion */}
                      <div className="w-72 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-6 flex flex-col justify-between shrink-0">
                        <div>
                          <Badge className="bg-white/20 text-white border-0 mb-3 text-xs">Featured</Badge>
                          <h4 className="text-white font-bold text-lg mb-2">Summer Sale</h4>
                          <p className="text-emerald-100 text-sm mb-4">Up to 40% off on selected items. Limited time offer!</p>
                        </div>
                        <button
                          onClick={() => {
                            navigateStore('products', { sort: 'popularity' })
                            setMegaMenuOpen(false)
                          }}
                          className="inline-flex items-center gap-2 text-white text-sm font-semibold hover:gap-3 transition-all duration-200"
                        >
                          Shop Now <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => navigateStore('deals')}
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            >
              Deals
            </button>
            <span className="w-px h-4 bg-border/60" aria-hidden="true" />
            <button
              onClick={() => navigateStore('blog')}
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            >
              Blog
            </button>
          </nav>

          {/* Enhanced Search bar with suggestions, history, and trending */}
          <div className="hidden md:flex flex-1 max-w-md mx-4" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search products… ⌘K"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleSearchFocus}
                className="pl-9 pr-16 w-full h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-lg"
              />
              {/* Keyboard shortcut hint */}
              {!searchFocused && !searchValue && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
                  <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                    <Command className="h-2.5 w-2.5" />K
                  </kbd>
                </div>
              )}
              {searchValue && (
                <button
                  type="button"
                  onClick={() => { handleSearchChange('') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              )}

              {/* Enhanced Search Dropdown with gradient border */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-1 search-dropdown-border bg-background rounded-lg shadow-lg z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="max-h-80 overflow-y-auto">
                      {/* Product Suggestions grouped by category (when typing) */}
                      {searchValue.trim().length >= 2 && searchSuggestions.length > 0 && (
                        <div className="p-2">
                          {/* Group suggestions by category */}
                          {(() => {
                            const grouped = searchSuggestions.reduce<Record<string, Product[]>>((acc, product) => {
                              const catName = product.category?.name || 'Other'
                              if (!acc[catName]) acc[catName] = []
                              acc[catName].push(product)
                              return acc
                            }, {})

                            return Object.entries(grouped).map(([category, products]) => (
                              <div key={category} className="mb-2 last:mb-0">
                                <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5">
                                  <Package className="h-2.5 w-2.5" />
                                  {category}
                                </p>
                                {products.map((product) => (
                                  <button
                                    key={product.id}
                                    onClick={() => handleSuggestionClick(product)}
                                    className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-muted transition-colors text-left"
                                  >
                                    {product.thumbnail ? (
                                      <img src={product.thumbnail} alt={product.name} className="h-10 w-10 rounded object-cover shrink-0 border" />
                                    ) : (
                                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium truncate">{product.name}</p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-emerald-600 font-semibold">
                                          ${(product.discountPrice || product.sellingPrice).toFixed(2)}
                                        </p>
                                        {product.discountPrice && (
                                          <span className="text-[10px] text-muted-foreground line-through">
                                            ${product.sellingPrice.toFixed(2)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ))
                          })()}
                        </div>
                      )}

                      {/* No results found with suggestion to browse categories */}
                      {searchValue.trim().length >= 2 && searchSuggestions.length === 0 && (
                        <div className="p-6 text-center">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                            <Search className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium mb-1">No results found</p>
                          <p className="text-xs text-muted-foreground mb-3">
                            No products match &quot;{searchValue}&quot;
                          </p>
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            <button
                              onClick={() => {
                                useNavStore.getState().setSearchQuery('')
                                navigateStore('products')
                                setShowSuggestions(false)
                                setSearchFocused(false)
                              }}
                              className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors font-medium"
                            >
                              Browse All Products
                            </button>
                            <button
                              onClick={() => {
                                useNavStore.getState().setSearchQuery('')
                                navigateStore('products', { category: categories[0]?.slug })
                                setShowSuggestions(false)
                                setSearchFocused(false)
                              }}
                              className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 transition-colors font-medium"
                            >
                              Browse Categories
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Search History (when focused with no query or short query) */}
                      {!searchValue.trim() && searchHistory.length > 0 && (
                        <div className="p-2 border-b">
                          <div className="flex items-center justify-between px-2 py-1">
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              Recent Searches
                            </p>
                            <button
                              onClick={() => { clearSearchHistory(); setSearchHistory([]) }}
                              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Clear
                            </button>
                          </div>
                          {searchHistory.map((query, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleHistoryClick(query)}
                              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-left text-sm"
                            >
                              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{query}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Trending Searches (when focused with no query) */}
                      {!searchValue.trim() && (
                        <div className="p-2">
                          <p className="text-xs text-muted-foreground px-2 py-1 font-medium flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3" />
                            Trending Searches
                          </p>
                          <div className="flex flex-wrap gap-1.5 px-2 pt-1">
                            {TRENDING_SEARCHES.map((term) => (
                              <button
                                key={term}
                                onClick={() => handleTrendingClick(term)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-muted/80 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-transparent hover:border-emerald-200"
                              >
                                <TrendingUp className="h-2.5 w-2.5 text-muted-foreground" />
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* View all results link (when typing) */}
                      {searchValue.trim().length >= 2 && searchSuggestions.length > 0 && (
                        <div className="border-t p-2">
                          <button
                            onClick={() => {
                              if (searchValue.trim()) {
                                addSearchHistory(searchValue.trim())
                                useNavStore.getState().setSearchQuery(searchValue.trim())
                                navigateStore('search')
                              }
                              setShowSuggestions(false)
                              setSearchFocused(false)
                            }}
                            className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium py-1 rounded-md hover:bg-emerald-50 transition-colors"
                          >
                            View all results for &quot;{searchValue}&quot;
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden sm:flex"
              onClick={() => navigateStore('wishlist')}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-emerald-600 text-white border-0">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className={`absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-emerald-600 text-white border-0 ${cartBadgeBounce ? 'cart-badge-bounce' : ''}`}>
                  {itemCount}
                </Badge>
              )}
            </Button>

            {/* Admin Dashboard Button */}
            {isAuthenticated && isAdminUser && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
                onClick={() => window.location.href = '/admin'}
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
              >
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateStore('account')}>
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateStore('account-orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateStore('wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isAdminUser && (
                    <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateStore('auth')}
                aria-label="Login"
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="md:hidden pb-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-4 w-full h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-emerald-500"
                  autoFocus
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
