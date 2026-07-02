'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useCompareStore } from '@/stores/compare-store'
import { fetchProducts, fetchProduct, type Product, formatPrice, getDiscountPercentage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  GitCompareArrows,
  X,
  Search,
  Star,
  Package,
  Tag,
  BarChart3,
  Truck,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

export function ProductComparePage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const productIds = useCompareStore((s) => s.productIds)
  const removeProduct = useCompareStore((s) => s.removeProduct)
  const clearAll = useCompareStore((s) => s.clearAll)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const addProduct = useCompareStore((s) => s.addProduct)

  // Load compared products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const loaded: Product[] = []
        for (const id of productIds) {
          try {
            const res = await fetchProduct(id)
            loaded.push(res.data)
          } catch {
            // Product not found, skip
          }
        }
        setProducts(loaded)
      } catch {
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [productIds])

  // Search products to add
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await fetchProducts({ search: query, limit: '6' })
      setSearchResults(res.data.filter((p) => !productIds.includes(p.id)))
    } catch {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [productIds])

  const handleAddProduct = useCallback((product: Product) => {
    addProduct(product.id)
    toast.success(`${product.name} added to comparison`)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
  }, [addProduct])

  const handleRemoveProduct = useCallback((id: string, name: string) => {
    removeProduct(id)
    toast.success(`${name} removed from comparison`)
  }, [removeProduct])

  // Compare rows
  const compareRows = useMemo(() => {
    if (products.length === 0) return []
    return [
      { label: 'Image', key: 'image' },
      { label: 'Name', key: 'name' },
      { label: 'Price', key: 'price' },
      { label: 'Rating', key: 'rating' },
      { label: 'Category', key: 'category' },
      { label: 'Brand', key: 'brand' },
      { label: 'Stock', key: 'stock' },
      { label: 'Description', key: 'description' },
      { label: 'Specifications', key: 'specifications' },
    ]
  }, [products])

  // Check if values differ across products
  const getDiffClass = useCallback((key: string) => {
    if (products.length <= 1) return ''
    const values = products.map((p) => {
      switch (key) {
        case 'price': return String(p.discountPrice || p.sellingPrice)
        case 'rating': return String(p.averageRating)
        case 'category': return p.category?.name || ''
        case 'brand': return p.brand?.name || ''
        case 'stock': return String(p.inventory?.quantity ?? 0)
        case 'description': return (p.description || '').substring(0, 100)
        default: return ''
      }
    })
    const unique = new Set(values)
    if (unique.size > 1) return 'bg-amber-50/50'
    return ''
  }, [products])

  const parseSpecifications = (spec?: string | null): Array<{ label: string; value: string }> => {
    if (!spec) return []
    try {
      return JSON.parse(spec) as Array<{ label: string; value: string }>
    } catch {
      return []
    }
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <BreadcrumbNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitCompareArrows className="h-6 w-6 text-emerald-600" />
            Compare Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare up to 3 products side by side
          </p>
        </div>
        <div className="flex items-center gap-2">
          {products.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll} className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
          {products.length < 3 && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Search to add products */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <Card className="border-emerald-100 shadow-md">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products to compare..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    autoFocus
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <motion.button
                        key={product.id}
                        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-emerald-50 transition-colors text-left"
                        onClick={() => handleAddProduct(product)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ x: 4 }}
                      >
                        <img
                          src={product.thumbnail || `https://picsum.photos/seed/${product.slug}/60/60`}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-emerald-600 font-semibold">{formatPrice(product.discountPrice || product.sellingPrice)}</p>
                        </div>
                        <Plus className="h-4 w-4 text-emerald-600 shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                )}
                {searchQuery && !searchLoading && searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No products found</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {products.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="text-center p-12 border-dashed">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <GitCompareArrows className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Products to Compare</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add up to 3 products to compare their features, prices, and specifications side by side.
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
              onClick={() => navigateStore('products')}
            >
              <Search className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Loading */}
      {loading && products.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      )}

      {/* Comparison Table */}
      {products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-4 w-36 font-semibold text-sm text-muted-foreground sticky left-0 bg-muted/30 z-10">
                      Features
                    </th>
                    {products.map((product) => (
                      <th key={product.id} className="p-4 min-w-[200px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold line-clamp-1">{product.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500"
                            onClick={() => handleRemoveProduct(product.id, product.name)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </th>
                    ))}
                    {products.length < 3 && (
                      <th className="p-4 min-w-[160px]">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => setShowSearch(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Product
                        </Button>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row, rowIdx) => (
                    <tr
                      key={row.key}
                      className={`border-b last:border-0 ${rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/10'} ${getDiffClass(row.key)}`}
                    >
                      <td className="p-4 font-medium text-sm text-muted-foreground sticky left-0 bg-inherit z-10">
                        <div className="flex items-center gap-2">
                          {row.key === 'image' && <Package className="h-4 w-4 text-emerald-500" />}
                          {row.key === 'price' && <Tag className="h-4 w-4 text-emerald-500" />}
                          {row.key === 'rating' && <Star className="h-4 w-4 text-emerald-500" />}
                          {row.key === 'category' && <BarChart3 className="h-4 w-4 text-emerald-500" />}
                          {row.key === 'brand' && <Tag className="h-4 w-4 text-emerald-500" />}
                          {row.key === 'stock' && <Truck className="h-4 w-4 text-emerald-500" />}
                          {row.label}
                        </div>
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="p-4 text-sm align-top">
                          {row.key === 'image' && (
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 mb-2 group cursor-pointer"
                              onClick={() => navigateStore('product-detail', { slug: product.slug, id: product.id })}
                            >
                              <img
                                src={product.thumbnail || `https://picsum.photos/seed/${product.slug}/300/300`}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {(product.isNewArrival || product.isBestSeller) && (
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                  {product.isNewArrival && (
                                    <Badge className="bg-emerald-600 text-white text-[10px] border-0">New</Badge>
                                  )}
                                  {product.isBestSeller && (
                                    <Badge className="bg-amber-500 text-white text-[10px] border-0">Best Seller</Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {row.key === 'name' && (
                            <button
                              className="font-semibold text-left hover:text-emerald-600 transition-colors line-clamp-2"
                              onClick={() => navigateStore('product-detail', { slug: product.slug, id: product.id })}
                            >
                              {product.name}
                            </button>
                          )}
                          {row.key === 'price' && (
                            <div>
                              <span className="font-bold text-emerald-600">
                                {formatPrice(product.discountPrice || product.sellingPrice)}
                              </span>
                              {product.discountPrice && (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(product.sellingPrice)}
                                  </span>
                                  <Badge className="bg-red-100 text-red-600 border-0 text-[10px]">
                                    -{getDiscountPercentage(product.sellingPrice, product.discountPrice)}%
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}
                          {row.key === 'rating' && (
                            <div className="flex items-center gap-1.5">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= Math.round(product.averageRating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-gray-200 text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {product.averageRating.toFixed(1)} ({product.reviewCount})
                              </span>
                            </div>
                          )}
                          {row.key === 'category' && (
                            <span>{product.category?.name || 'N/A'}</span>
                          )}
                          {row.key === 'brand' && (
                            <span>{product.brand?.name || 'N/A'}</span>
                          )}
                          {row.key === 'stock' && (
                            <div>
                              {(product.inventory?.quantity ?? 0) > 0 ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                                  In Stock ({product.inventory?.quantity})
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-600 border-0 text-xs">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                          )}
                          {row.key === 'description' && (
                            <p className="text-muted-foreground text-xs line-clamp-3">
                              {product.description
                                ? product.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                                : 'No description available'}
                            </p>
                          )}
                          {row.key === 'specifications' && (
                            <div className="space-y-1">
                              {parseSpecifications(product.specifications).length > 0 ? (
                                parseSpecifications(product.specifications).slice(0, 4).map((spec, idx) => (
                                  <div key={idx} className="text-xs">
                                    <span className="font-medium">{spec.label}:</span>{' '}
                                    <span className="text-muted-foreground">{spec.value}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">No specs</span>
                              )}
                            </div>
                          )}
                        </td>
                      ))}
                      {products.length < 3 && (
                        <td className="p-4 text-center text-muted-foreground text-sm">
                          —
                        </td>
                      )}
                    </tr>
                  ))}
                  {/* Action row */}
                  <tr className="border-t">
                    <td className="p-4 sticky left-0 bg-background z-10" />
                    {products.map((product) => (
                      <td key={product.id} className="p-4">
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 text-sm"
                          size="sm"
                          onClick={() => navigateStore('product-detail', { slug: product.slug, id: product.id })}
                        >
                          View Details
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </td>
                    ))}
                    {products.length < 3 && <td className="p-4" />}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Difference highlight note */}
      {products.length > 1 && (
        <motion.p
          className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="inline-block w-3 h-3 rounded bg-amber-50/50 border border-amber-200" />
          Highlighted rows indicate differences between products
        </motion.p>
      )}
    </motion.div>
  )
}
