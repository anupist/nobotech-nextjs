'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Zap, Search, X, Calendar, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/api'

interface FlashSaleProduct {
  id: string
  salePrice: number
  quantity: number
  soldCount: number
  product: {
    id: string
    name: string
    slug: string
    thumbnail: string | null
    sellingPrice: number
    discountPrice: number | null
  }
}

interface FlashSale {
  id: string
  name: string
  slug: string
  startsAt: string
  endsAt: string
  isActive: boolean
  isFeatured: boolean
  products: FlashSaleProduct[]
}

interface SearchProduct {
  id: string
  name: string
  thumbnail: string | null
  sellingPrice: number
  discountPrice: number | null
}

interface SelectedProduct {
  productId: string
  productName: string
  thumbnail: string | null
  salePrice: number
  quantity: number
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toDatetimeLocal(dateStr: string) {
  const d = new Date(dateStr)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null)
  const [activeTab, setActiveTab] = useState('basic')

  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formStartsAt, setFormStartsAt] = useState('')
  const [formEndsAt, setFormEndsAt] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)
  const [formIsFeatured, setFormIsFeatured] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchFlashSales = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/flash-sales')
      const data = await res.json()
      if (data.success) {
        setFlashSales(data.data || [])
      }
    } catch {
      toast.error('Failed to fetch flash sales')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFlashSales()
  }, [fetchFlashSales])

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    try {
      setSearching(true)
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(query)}&limit=10`)
      const data = await res.json()
      if (data.success) {
        setSearchResults(data.data || [])
      }
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) searchProducts(searchQuery)
      else setSearchResults([])
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchProducts])

  const isProductSelected = (productId: string) =>
    selectedProducts.some((p) => p.productId === productId)

  const addProduct = (product: SearchProduct) => {
    if (isProductSelected(product.id)) return
    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        thumbnail: product.thumbnail,
        salePrice: product.discountPrice || product.sellingPrice,
        quantity: 1,
      },
    ])
    setSearchQuery('')
    setSearchResults([])
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId))
  }

  const updateProductSalePrice = (productId: string, salePrice: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, salePrice } : p))
    )
  }

  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, quantity } : p))
    )
  }

  const openCreateDialog = useCallback(() => {
    setEditingSale(null)
    setFormName('')
    setFormSlug('')
    setFormStartsAt('')
    setFormEndsAt('')
    setFormIsActive(true)
    setFormIsFeatured(false)
    setSelectedProducts([])
    setSearchQuery('')
    setSearchResults([])
    setActiveTab('basic')
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((sale: FlashSale) => {
    setEditingSale(sale)
    setFormName(sale.name)
    setFormSlug(sale.slug)
    setFormStartsAt(toDatetimeLocal(sale.startsAt))
    setFormEndsAt(toDatetimeLocal(sale.endsAt))
    setFormIsActive(sale.isActive)
    setFormIsFeatured(sale.isFeatured)
    setSelectedProducts(
      sale.products.map((p) => ({
        productId: p.product.id,
        productName: p.product.name,
        thumbnail: p.product.thumbnail,
        salePrice: p.salePrice,
        quantity: p.quantity,
      }))
    )
    setSearchQuery('')
    setSearchResults([])
    setActiveTab('basic')
    setDialogOpen(true)
  }, [])

  const handleNameChange = useCallback((value: string) => {
    setFormName(value)
    if (!editingSale) {
      setFormSlug(slugify(value))
    }
  }, [editingSale])

  const handleSave = useCallback(async () => {
    if (!formName || !formSlug || !formStartsAt || !formEndsAt) {
      toast.error('Name, slug, start and end dates are required')
      return
    }
    if (new Date(formEndsAt) <= new Date(formStartsAt)) {
      toast.error('End date must be after start date')
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: formName,
        slug: formSlug,
        startsAt: formStartsAt,
        endsAt: formEndsAt,
        isActive: formIsActive,
        isFeatured: formIsFeatured,
      }

      if (editingSale) {
        payload.id = editingSale.id
        payload.products = selectedProducts.map((p) => ({
          productId: p.productId,
          salePrice: p.salePrice,
          quantity: p.quantity,
        }))
      }

      const res = await fetch('/api/admin/flash-sales', {
        method: editingSale ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        if (!editingSale && selectedProducts.length > 0) {
          await fetch('/api/admin/flash-sales', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.data.id,
              products: selectedProducts.map((p) => ({
                productId: p.productId,
                salePrice: p.salePrice,
                quantity: p.quantity,
              })),
            }),
          })
        }
        toast.success(editingSale ? 'Flash sale updated' : 'Flash sale created')
        setDialogOpen(false)
        fetchFlashSales()
      } else {
        toast.error(data.error || 'Failed to save flash sale')
      }
    } catch {
      toast.error('Failed to save flash sale')
    } finally {
      setSaving(false)
    }
  }, [
    formName, formSlug, formStartsAt, formEndsAt, formIsActive, formIsFeatured,
    selectedProducts, editingSale, fetchFlashSales,
  ])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/flash-sales?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Flash sale deleted')
        fetchFlashSales()
      } else {
        toast.error(data.error || 'Failed to delete flash sale')
      }
    } catch {
      toast.error('Failed to delete flash sale')
    } finally {
      setDeleteId(null)
    }
  }, [deleteId, fetchFlashSales])

  const isExpired = (endsAt: string) => new Date(endsAt) < new Date()
  const isUpcoming = (startsAt: string) => new Date(startsAt) > new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Flash Sales</h1>
          <p className="text-sm text-muted-foreground">Manage time-limited sale events</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Flash Sale
        </Button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        ) : flashSales.length === 0 ? (
          <CardContent className="p-8 text-center">
            <Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No flash sales created yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a flash sale to offer time-limited deals
            </p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Dates</TableHead>
                  <TableHead className="hidden md:table-cell">Featured</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Products</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flashSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">{sale.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(sale.startsAt)}</span>
                        <span className="mx-1">–</span>
                        <span>{formatDate(sale.endsAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {sale.isFeatured ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          <Star className="h-3 w-3 mr-1 fill-amber-500" />
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isExpired(sale.endsAt) ? (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">Expired</Badge>
                      ) : isUpcoming(sale.startsAt) ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">Upcoming</Badge>
                      ) : sale.isActive ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {sale.products.length} product{sale.products.length !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(sale)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDeleteId(sale.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              {editingSale ? 'Edit Flash Sale' : 'Create Flash Sale'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Summer Sale 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="summer-sale-2025"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Starts At *</Label>
                    <Input
                      type="datetime-local"
                      value={formStartsAt}
                      onChange={(e) => setFormStartsAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ends At *</Label>
                    <Input
                      type="datetime-local"
                      value={formEndsAt}
                      onChange={(e) => setFormEndsAt(e.target.value)}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">Make this flash sale visible to customers</p>
                  </div>
                  <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Featured</Label>
                    <p className="text-xs text-muted-foreground">
                      Show this flash sale prominently. Only one flash sale can be featured at a time.
                    </p>
                  </div>
                  <Switch checked={formIsFeatured} onCheckedChange={setFormIsFeatured} />
                </div>
                {formIsFeatured && (
                  <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    <Star className="h-4 w-4 inline mr-1 fill-amber-500" />
                    Setting this as featured will un-feature any other featured flash sale.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {searching && (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                                {product.thumbnail ? (
                                  <img
                                    src={product.thumbnail}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                    N/A
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium truncate max-w-[200px]">
                                {product.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {product.discountPrice ? (
                              <span className="text-muted-foreground line-through mr-1">
                                {formatPrice(product.sellingPrice)}
                              </span>
                            ) : (
                              formatPrice(product.sellingPrice)
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              disabled={isProductSelected(product.id)}
                              onClick={() => addProduct(product)}
                            >
                              {isProductSelected(product.id) ? 'Added' : 'Add'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No products found
                </p>
              )}

              <Separator />

              <div>
                <Label className="mb-2 block">
                  Selected Products ({selectedProducts.length})
                </Label>
                {selectedProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No products added yet. Search and add products above.
                  </p>
                ) : (
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-2">
                      {selectedProducts.map((sp) => (
                        <div
                          key={sp.productId}
                          className="flex items-center gap-3 rounded-md border p-3"
                        >
                          <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                            {sp.thumbnail ? (
                              <img
                                src={sp.thumbnail}
                                alt={sp.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                N/A
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{sp.productName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <Label className="text-xs">Sale Price</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={sp.salePrice}
                                onChange={(e) =>
                                  updateProductSalePrice(sp.productId, parseFloat(e.target.value) || 0)
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="w-20">
                              <Label className="text-xs">Qty</Label>
                              <Input
                                type="number"
                                min="0"
                                value={sp.quantity}
                                onChange={(e) =>
                                  updateProductQuantity(sp.productId, parseInt(e.target.value) || 0)
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 mt-4 flex-shrink-0"
                              onClick={() => removeProduct(sp.productId)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab(activeTab === 'basic' ? 'products' : 'basic')}
              >
                {activeTab === 'basic' ? 'Next: Products' : 'Back: Basic Info'}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? 'Saving...' : editingSale ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flash Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flash sale? This action cannot be undone.
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
