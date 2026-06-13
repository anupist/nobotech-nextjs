'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Copy,
  Archive,
  TrendingUp,
  TrendingDown,
  PackageX,
  Eye,
  Download,
  ExternalLink,
  Trash,
  Archive as ArchiveIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  thumbnail: string | null
  costPrice: number
  sellingPrice: number
  discountPrice: number | null
  status: string
  totalSold: number
  category: { id: string; name: string } | null
  brand: { id: string; name: string } | null
  inventory: { quantity: number; lowStockAlert: number } | null
}

interface Category {
  id: string
  name: string
  children?: Category[]
}

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  inactive: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
}

const categoryBadgeColors: Record<string, string> = {
  'Electronics': 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
  'Clothing': 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
  'Home & Garden': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Sports': 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
  'Books': 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
}

function StockIndicator({ quantity, lowStockAlert }: { quantity: number; lowStockAlert: number }) {
  if (quantity === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-red-200 dark:bg-red-900 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
        </div>
        <span className="text-xs font-medium text-red-600 dark:text-red-400">Out of stock</span>
      </div>
    )
  }
  if (quantity <= lowStockAlert) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-yellow-200 dark:bg-yellow-900 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '50%' }} />
        </div>
        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Low ({quantity})</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-emerald-200 dark:bg-emerald-900 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
      </div>
      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{quantity}</span>
    </div>
  )
}

export function ProductsPage() {
  const navigateAdmin = useNavStore((s) => s.navigateAdmin)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [totalProducts, setTotalProducts] = useState(0)
  const limit = 10

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set('search', search)
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data || [])
        setTotalPages(data.meta?.totalPages || 1)
        setTotalProducts(data.meta?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter, statusFilter])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Product deleted successfully')
        fetchProducts()
      } else {
        toast.error(data.error || 'Failed to delete product')
      }
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchProducts])

  const handleDuplicate = useCallback(async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`)
      const data = await res.json()
      if (data.success && data.data) {
        const product = data.data
        const createRes = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...product,
            name: `${product.name} (Copy)`,
            slug: `${product.slug}-copy-${Date.now()}`,
            sku: `${product.sku}-COPY`,
            status: 'draft',
          }),
        })
        const createData = await createRes.json()
        if (createData.success) {
          toast.success('Product duplicated successfully')
          fetchProducts()
        } else {
          toast.error('Failed to duplicate product')
        }
      }
    } catch {
      toast.error('Failed to duplicate product')
    }
  }, [fetchProducts])

  const handleArchive = useCallback(async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Product archived')
        fetchProducts()
      } else {
        toast.error('Failed to archive product')
      }
    } catch {
      toast.error('Failed to archive product')
    }
  }, [fetchProducts])

  const flattenedCategories = useMemo(() => {
    const result: Array<{ id: string; name: string; depth: number }> = []
    const flatten = (cats: Category[], depth = 0) => {
      for (const cat of cats) {
        result.push({ id: cat.id, name: cat.name, depth })
        if (cat.children) flatten(cat.children, depth + 1)
      }
    }
    flatten(categories)
    return result
  }, [categories])

  // Export CSV
  const handleExportCSV = useCallback(() => {
    if (products.length === 0) {
      toast.error('No products to export')
      return
    }

    const headers = ['Name', 'SKU', 'Category', 'Brand', 'Cost Price', 'Selling Price', 'Discount Price', 'Stock', 'Status']
    const rows = products.map((product) => [
      `"${product.name}"`,
      product.sku,
      product.category?.name || '',
      product.brand?.name || '',
      (product.costPrice || 0).toFixed(2),
      product.sellingPrice.toFixed(2),
      product.discountPrice ? product.discountPrice.toFixed(2) : '',
      product.inventory ? String(product.inventory.quantity) : '0',
      product.status,
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const today = new Date().toISOString().split('T')[0]
    const filename = `shophub-products-${today}.csv`

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)

    toast.success('Products exported successfully!', {
      description: `File saved as ${filename}`,
    })
  }, [products])

  // Stats calculations
  const productStats = useMemo(() => {
    const total = products.length
    const active = products.filter(p => p.status === 'active').length
    const draft = products.filter(p => p.status === 'draft').length
    const outOfStock = products.filter(p => p.inventory?.quantity === 0).length
    return { total, active, draft, outOfStock }
  }, [products])

  // Bulk actions
  const toggleSelectAll = useCallback(() => {
    if (selectedProducts.size === products.length && products.length > 0) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)))
    }
  }, [products, selectedProducts])

  const toggleSelectProduct = useCallback((id: string) => {
    setSelectedProducts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBulkArchive = useCallback(async () => {
    if (selectedProducts.size === 0) return
    try {
      let count = 0
      for (const id of selectedProducts) {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'inactive' }),
        })
        const data = await res.json()
        if (data.success) count++
      }
      toast.success(`${count} product(s) archived`)
      setSelectedProducts(new Set())
      fetchProducts()
    } catch {
      toast.error('Failed to archive products')
    }
  }, [selectedProducts, fetchProducts])

  const handleBulkDelete = useCallback(async () => {
    if (selectedProducts.size === 0) return
    try {
      let count = 0
      for (const id of selectedProducts) {
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) count++
      }
      toast.success(`${count} product(s) deleted`)
      setSelectedProducts(new Set())
      fetchProducts()
    } catch {
      toast.error('Failed to delete products')
    }
  }, [selectedProducts, fetchProducts])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => navigateAdmin('add-product')} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600" onClick={handleExportCSV} disabled={products.length === 0}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Product Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60">
                <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{productStats.total}</p>
                <p className="text-[11px] text-muted-foreground">Total Products</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/60">
                <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{productStats.active}</p>
                <p className="text-[11px] text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60">
                <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{productStats.draft}</p>
                <p className="text-[11px] text-muted-foreground">Draft</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60">
                <PackageX className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{productStats.outOfStock}</p>
                <p className="text-[11px] text-muted-foreground">Out of Stock</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedProducts.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-600 text-white border-0 hover:bg-emerald-700">
                    {selectedProducts.size} selected
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                    onClick={() => setSelectedProducts(new Set())}
                  >
                    Clear selection
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-amber-200 hover:bg-amber-50 hover:text-amber-600 dark:border-amber-800 dark:hover:bg-amber-950"
                    onClick={handleBulkArchive}
                  >
                    <Archive className="h-3.5 w-3.5 mr-1.5" />
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {flattenedCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {'  '.repeat(cat.depth)}{cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products List/Grid View */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto"><Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={products.length > 0 && selectedProducts.size === products.length}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-12">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">SKU</TableHead>
                        <TableHead className="hidden sm:table-cell">Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="hidden lg:table-cell">Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No products found
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product, rowIdx) => (
                          <TableRow
                            key={product.id}
                            className={`group ${rowIdx % 2 === 1 ? 'bg-muted/20' : ''} hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors`}
                          >
                            <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedProducts.has(product.id)}
                                onCheckedChange={() => toggleSelectProduct(product.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-muted overflow-hidden">
                                {product.thumbnail ? (
                                  <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Package className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                {product.brand && (
                                  <p className="text-xs text-muted-foreground">{product.brand.name}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                              {product.sku}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {product.category ? (
                                <Badge variant="secondary" className={`text-[10px] border-0 ${categoryBadgeColors[product.category.name] || 'bg-muted/50'}`}>
                                  {product.category.name}
                                </Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">${product.sellingPrice.toFixed(2)}</p>
                                {product.discountPrice && (
                                  <p className="text-xs text-emerald-600">${product.discountPrice.toFixed(2)}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {product.inventory ? (
                                <StockIndicator quantity={product.inventory.quantity} lowStockAlert={product.inventory.lowStockAlert} />
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={statusColors[product.status] || ''}>
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigateAdmin('edit-product', { id: product.id })}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    const navState = useNavStore.getState()
                                    navState.setViewMode('store')
                                    navState.navigateStore('product-detail', { slug: product.slug })
                                  }}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View on Store
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicate(product.id)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleArchive(product.id)}>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => setDeleteId(product.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table></div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <Skeleton className="h-40 w-full rounded-t-lg" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-12 text-muted-foreground">
                  No products found
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card
                      className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                      onClick={() => navigateAdmin('edit-product', { id: product.id })}
                    >
                      {/* Product Image */}
                      <div className="relative h-40 bg-muted overflow-hidden">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <Package className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Stock Badge */}
                        <div className="absolute top-2 right-2">
                          {product.inventory && product.inventory.quantity === 0 ? (
                            <Badge className="bg-red-500 text-white border-0 text-[10px]">Out of Stock</Badge>
                          ) : product.inventory && product.inventory.quantity <= product.inventory.lowStockAlert ? (
                            <Badge className="bg-yellow-500 text-white border-0 text-[10px]">Low Stock</Badge>
                          ) : (
                            <Badge className="bg-emerald-500 text-white border-0 text-[10px]">In Stock</Badge>
                          )}
                        </div>
                        {/* Status Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className={`${statusColors[product.status] || ''} text-[10px]`}>
                            {product.status}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm truncate">{product.name}</h3>
                        {product.category && (
                          <Badge variant="secondary" className={`text-[9px] mt-1 border-0 ${categoryBadgeColors[product.category.name] || 'bg-muted/50'}`}>
                            {product.category.name}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              ${product.discountPrice ? product.discountPrice.toFixed(2) : product.sellingPrice.toFixed(2)}
                            </span>
                            {product.discountPrice && (
                              <span className="text-xs text-muted-foreground line-through ml-1">
                                ${product.sellingPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {product.inventory && (
                            <span className="text-xs text-muted-foreground">
                              {product.inventory.quantity} units
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} of {totalProducts} products
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
