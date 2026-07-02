'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useCartStore } from '@/stores/cart-store'
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  type Product,
  type Category,
  type Brand,
  formatPrice,
  getDiscountPercentage,
} from '@/lib/api'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  Filter,
  ShoppingCart,
  Star,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

interface FilterState {
  category: string
  brands: string[]
  priceRange: [number, number]
  minRating: number
  inStock: boolean
  sort: string
  page: number
  pageSize: number
}

type ViewMode = 'grid' | 'list'

const pageSizeOptions = [12, 24, 48]

export function ProductListPage() {
  const pageParams = useNavStore((s) => s.pageParams)
  const navigateStore = useNavStore((s) => s.navigateStore)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const [filters, setFilters] = useState<FilterState>({
    category: pageParams.category || '',
    brands: pageParams.brand ? [pageParams.brand] : [],
    priceRange: [0, 2000],
    minRating: 0,
    inStock: false,
    sort: pageParams.sort || 'newest',
    page: 1,
    pageSize: 12,
  })

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data)).catch(() => {})
    fetchBrands().then((res) => setBrands(res.data)).catch(() => {})
  }, [])

  // Sync pageParams.category → local filters.category when navigation comes from menu/URL
  const prevCategoryRef = useRef(pageParams.category || '')
  useEffect(() => {
    const cat = pageParams.category || ''
    if (cat !== prevCategoryRef.current) {
      prevCategoryRef.current = cat
      setFilters((prev) => ({ ...prev, category: cat, page: 1 }))
    }
  }, [pageParams.category])

  const buildQueryParams = useCallback((f: FilterState): Record<string, string> => {
    const params: Record<string, string> = {
      page: String(f.page),
      limit: String(f.pageSize),
      sort: f.sort,
    }
    if (f.category) params.category = f.category
    if (f.brands.length > 0) params.brand = f.brands[0]
    if (f.priceRange[0] > 0) params.minPrice = String(f.priceRange[0])
    if (f.priceRange[1] < 2000) params.maxPrice = String(f.priceRange[1])
    if (f.minRating > 0) params.rating = String(f.minRating)
    if (f.inStock) params.inStock = 'true'
    if (pageParams.featured) params.featured = pageParams.featured
    if (pageParams.newArrival) params.newArrival = pageParams.newArrival
    if (pageParams.bestSeller) params.bestSeller = pageParams.bestSeller
    return params
  }, [pageParams])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const params = buildQueryParams(filters)
        const res = await fetchProducts(params)
        setProducts(res.data)
        setTotalPages(res.meta.totalPages)
        setTotalProducts(res.meta.total)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [filters, buildQueryParams])

  const updateFilter = useCallback(
    (key: keyof FilterState, value: unknown) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
      if (key === 'category') {
        prevCategoryRef.current = value as string
        navigateStore('products', { category: value as string })
      }
    },
    [navigateStore]
  )

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      brands: [],
      priceRange: [0, 2000],
      minRating: 0,
      inStock: false,
      sort: 'newest',
      page: 1,
      pageSize: 12,
    })
    prevCategoryRef.current = ''
    navigateStore('products', {})
  }, [navigateStore])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.category) count++
    if (filters.brands.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) count++
    if (filters.minRating > 0) count++
    if (filters.inStock) count++
    return count
  }, [filters])

  // Results range calculation
  const resultRange = useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize + 1
    const end = Math.min(filters.page * filters.pageSize, totalProducts)
    return { start, end }
  }, [filters.page, filters.pageSize, totalProducts])

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter('category', '')}
            className={`w-full text-left text-sm px-2 py-1.5 rounded ${
              !filters.category ? 'bg-emerald-50 text-emerald-600 font-medium dark:bg-emerald-950/30 dark:text-emerald-400' : 'hover:bg-muted'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => updateFilter('category', cat.slug)}
                className={`w-full text-left text-sm px-2 py-1.5 rounded flex items-center justify-between ${
                  filters.category === cat.slug
                    ? 'bg-emerald-50 text-emerald-600 font-medium dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'hover:bg-muted'
                }`}
              >
                {cat.name}
                {cat._count && (
                  <span className="text-xs text-muted-foreground">{cat._count.products}</span>
                )}
              </button>
              {cat.children?.map((child) => (
                <button
                  key={child.id}
                  onClick={() => updateFilter('category', child.slug)}
                  className={`w-full text-left text-sm pl-6 py-1 rounded ${
                    filters.category === child.slug
                      ? 'bg-emerald-50 text-emerald-600 font-medium dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Brands</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted px-2 py-1 rounded"
            >
              <Checkbox
                checked={filters.brands.includes(brand.slug)}
                onCheckedChange={(checked) => {
                  const newBrands = checked
                    ? [...filters.brands, brand.slug]
                    : filters.brands.filter((b) => b !== brand.slug)
                  updateFilter('brands', newBrands)
                }}
              />
              <span className="flex-1">{brand.name}</span>
              {brand._count && (
                <span className="text-xs text-muted-foreground">{brand._count.products}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Price Range</h3>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
          min={0}
          max={2000}
          step={10}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Minimum Rating</h3>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilter('minRating', filters.minRating === rating ? 0 : rating)}
              className={`flex items-center gap-1.5 w-full text-left text-sm px-2 py-1.5 rounded ${
                filters.minRating === rating
                  ? 'bg-emerald-50 text-emerald-600 font-medium dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'hover:bg-muted'
              }`}
            >
              <span className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={s <= rating ? 'text-amber-400' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
              </span>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* In Stock Toggle */}
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={filters.inStock}
            onCheckedChange={(checked) => updateFilter('inStock', !!checked)}
          />
          In Stock Only
        </label>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6 overflow-x-hidden">
      <BreadcrumbNav items={
        filters.category
          ? [{ label: 'Products', page: 'products' as const }, { label: categories.find((c) => c.slug === filters.category)?.name || 'Category' }]
          : undefined
      } />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {filters.category
              ? categories.find((c) => c.slug === filters.category)?.name || 'Products'
              : pageParams.featured
                ? 'Featured Products'
                : pageParams.newArrival
                  ? 'New Arrivals'
                  : pageParams.bestSeller
                    ? 'Best Sellers'
                    : 'All Products'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalProducts} products found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Filter */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-emerald-600 text-white border-0">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetTitle className="sr-only">Filters</SheetTitle>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort */}
          <Select
            value={filters.sort}
            onValueChange={(value) => updateFilter('sort', value)}
          >
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="popularity">Best Selling</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters - Enhanced with pill-shaped gradient badges */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2 mb-4 items-center"
          >
            {filters.category && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Badge className="gap-1 py-1.5 px-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm shadow-emerald-500/20 text-xs font-medium">
                  {categories.find((c) => c.slug === filters.category)?.name}
                  <motion.button
                    onClick={() => updateFilter('category', '')}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </Badge>
              </motion.div>
            )}
            {filters.brands.map((b) => (
              <motion.div
                key={b}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Badge className="gap-1 py-1.5 px-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm shadow-emerald-500/20 text-xs font-medium">
                  {brands.find((br) => br.slug === b)?.name || b}
                  <motion.button
                    onClick={() => updateFilter('brands', filters.brands.filter((x) => x !== b))}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </Badge>
              </motion.div>
            ))}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Badge className="gap-1 py-1.5 px-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm shadow-emerald-500/20 text-xs font-medium">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <motion.button
                    onClick={() => updateFilter('priceRange', [0, 2000])}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </Badge>
              </motion.div>
            )}
            {filters.minRating > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Badge className="gap-1 py-1.5 px-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm shadow-emerald-500/20 text-xs font-medium">
                  {filters.minRating}+ Stars
                  <motion.button
                    onClick={() => updateFilter('minRating', 0)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </Badge>
              </motion.div>
            )}
            {filters.inStock && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Badge className="gap-1 py-1.5 px-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm shadow-emerald-500/20 text-xs font-medium">
                  In Stock
                  <motion.button
                    onClick={() => updateFilter('inStock', false)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </Badge>
              </motion.div>
            )}

            {/* Clear All Filters Button with shake animation on hover */}
            {activeFilterCount > 1 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors px-2 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 group"
              >
                <span className="inline-flex items-center gap-1 group-hover:animate-[shake_0.4s_ease-in-out]">
                  <X className="h-3 w-3" />
                  Clear all
                </span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Showing X of Y products counter with emerald highlight */}
      <div className="flex items-center justify-between mb-4">
        <motion.p
          className="text-sm"
          key={`${resultRange.start}-${resultRange.end}-${totalProducts}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-muted-foreground">Showing </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalProducts > 0 ? resultRange.start : 0}-{resultRange.end}</span>
          <span className="text-muted-foreground"> of </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalProducts}</span>
          <span className="text-muted-foreground"> products</span>
        </motion.p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Per page:</span>
          <Select
            value={String(filters.pageSize)}
            onValueChange={(value) => updateFilter('pageSize', Number(value))}
          >
            <SelectTrigger className="w-[70px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <FilterContent />
          </div>
        </aside>

        {/* Product Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-3'}>
              {Array.from({ length: filters.pageSize }).map((_, i) => (
                <div key={i} className={viewMode === 'grid' ? 'space-y-2' : 'flex gap-4'}>
                  <div className={viewMode === 'grid' ? 'skeleton-image aspect-square rounded-lg' : 'skeleton-image h-24 w-24 rounded-lg shrink-0'} />
                  <div className={viewMode === 'grid' ? '' : 'flex-1 space-y-2'}>
                    <div className="skeleton-rect h-4 w-3/4 rounded" />
                    <div className="skeleton-rect h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters or search criteria
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {products.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.05,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.05,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                        >
                          <ProductListItem product={product} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Enhanced Pagination with gradient active page */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <p className="text-sm text-muted-foreground">
                    Showing {resultRange.start}-{resultRange.end} of {totalProducts} products
                  </p>
                  <div className="flex items-center gap-1.5">
                    {/* First Page */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={filters.page <= 1}
                      onClick={() => updateFilter('page', 1)}
                      aria-label="First page"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    {/* Previous */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={filters.page <= 1}
                      onClick={() => updateFilter('page', filters.page - 1)}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - filters.page) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-1 text-muted-foreground text-xs">...</span>
                          )}
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant={p === filters.page ? 'default' : 'outline'}
                              size="icon"
                              className={`h-8 w-8 text-sm transition-all duration-200 ${
                                p === filters.page
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20'
                                  : ''
                              }`}
                              onClick={() => updateFilter('page', p)}
                            >
                              {p}
                            </Button>
                          </motion.div>
                        </span>
                      ))}
                    {/* Next */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={filters.page >= totalPages}
                      onClick={() => updateFilter('page', filters.page + 1)}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {/* Last Page */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={filters.page >= totalPages}
                      onClick={() => updateFilter('page', totalPages)}
                      aria-label="Last page"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductListItem({ product }: { product: Product }) {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const addItem = useCartStore((s) => s.addItem)

  const discount = product.discountPrice
    ? getDiscountPercentage(product.sellingPrice, product.discountPrice)
    : 0
  const effectivePrice = product.discountPrice || product.sellingPrice
  const stock = product.inventory?.quantity ?? 0

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (stock === 0) return
      addItem({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        thumbnail: product.thumbnail || '',
        sku: product.sku,
        price: product.sellingPrice,
        discountPrice: product.discountPrice || undefined,
        quantity: 1,
        stock,
      })
      toast.success(`${product.name} added to cart`)
    },
    [product, addItem, stock]
  )

  const handleClick = useCallback(() => {
    navigateStore('product-detail', { slug: product.slug, id: product.id })
  }, [navigateStore, product.slug, product.id])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="group flex items-center gap-4 p-3 bg-card rounded-lg border hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden hover:border-l-4 hover:border-l-emerald-500"
        onClick={handleClick}
      >
        {/* Thumbnail */}
        <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted/30 shrink-0">
          <img
            src={product.thumbnail || `https://picsum.photos/seed/${product.slug}/200/200`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {product.category && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                  {product.category.name}
                </p>
              )}
              <h3 className="text-sm font-medium line-clamp-1 group-hover:text-emerald-600 transition-colors">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= Math.round(product.averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-600">{formatPrice(effectivePrice)}</span>
              {product.discountPrice && (
                <span className="text-xs text-muted-foreground line-through">{formatPrice(product.sellingPrice)}</span>
              )}
              {discount > 0 && (
                <Badge className="bg-red-500/90 text-white text-[9px] border-0 px-1 py-0 h-4">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Stock status */}
            {stock > 0 ? (
              stock <= 5 ? (
                <span className="text-[10px] text-amber-600 font-medium">Only {stock} left</span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-medium">In Stock</span>
              )
            ) : (
              <span className="text-[10px] text-red-500 font-medium">Out of Stock</span>
            )}
          </div>
        </div>

        {/* Add to Cart button */}
        <div className="shrink-0">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 h-9"
            onClick={handleAddToCart}
            disabled={stock === 0}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
