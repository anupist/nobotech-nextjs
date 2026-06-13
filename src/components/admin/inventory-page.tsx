'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Warehouse, Search, ChevronLeft, ChevronRight, Package } from 'lucide-react'

interface InventoryItem {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  lowStockAlert: number
  product?: {
    id: string
    name: string
    sku: string
    thumbnail: string | null
  }
  variant?: {
    id: string
    name: string
    sku: string
  }
}

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [adjustDialog, setAdjustDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustType, setAdjustType] = useState('in')
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      // Use the products API with inventory include to build inventory list
      const params = new URLSearchParams({ limit: '50', status: 'all' })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      if (data.success) {
        const items: InventoryItem[] = []
        for (const product of data.data || []) {
          if (product.inventory) {
            items.push({
              id: product.inventory.id,
              productId: product.id,
              variantId: null,
              quantity: product.inventory.quantity,
              lowStockAlert: product.inventory.lowStockAlert,
              product: {
                id: product.id,
                name: product.name,
                sku: product.sku,
                thumbnail: product.thumbnail,
              },
            })
          }
        }
        setInventory(items)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const openAdjustDialog = useCallback((item: InventoryItem) => {
    setSelectedItem(item)
    setAdjustType('in')
    setAdjustQty('')
    setAdjustReason('')
    setAdjustDialog(true)
  }, [])

  const handleAdjust = useCallback(async () => {
    if (!selectedItem || !adjustQty) {
      toast.error('Please enter quantity')
      return
    }

    try {
      setSaving(true)
      const qty = parseInt(adjustQty)
      const newQuantity = adjustType === 'in'
        ? selectedItem.quantity + qty
        : Math.max(0, selectedItem.quantity - qty)

      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          quantity: newQuantity,
          type: adjustType,
          adjustmentQty: qty,
          reason: adjustReason,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Stock adjusted successfully')
        setAdjustDialog(false)
        fetchInventory()
      } else {
        toast.error(data.error || 'Failed to adjust stock')
      }
    } catch {
      toast.error('Failed to adjust stock')
    } finally {
      setSaving(false)
    }
  }, [selectedItem, adjustType, adjustQty, adjustReason, fetchInventory])

  const filteredInventory = lowStockOnly
    ? inventory.filter((item) => item.quantity <= item.lowStockAlert)
    : inventory

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-muted-foreground">Manage product stock levels</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={lowStockOnly ? 'default' : 'outline'}
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={lowStockOnly ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <Warehouse className="h-4 w-4 mr-2" />
              Low Stock Only
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Low Stock Alert</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const isLow = item.quantity <= item.lowStockAlert
                    const isOutOfStock = item.quantity === 0
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-gray-100 overflow-hidden shrink-0">
                              {item.product?.thumbnail ? (
                                <img src={item.product.thumbnail} alt={item.product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-3 w-3 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium">{item.product?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.product?.sku}</TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : isLow ? 'text-amber-600' : ''}`}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.lowStockAlert}</TableCell>
                        <TableCell>
                          {isOutOfStock ? (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">Out of Stock</Badge>
                          ) : isLow ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">Low Stock</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openAdjustDialog(item)}>
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table></div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustDialog} onOpenChange={setAdjustDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{selectedItem.product?.name}</p>
                <p className="text-xs text-muted-foreground">
                  Current Stock: <span className="font-semibold">{selectedItem.quantity}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={adjustType} onValueChange={setAdjustType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Add Stock</SelectItem>
                      <SelectItem value="out">Reduce Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Restock, correction, etc." />
              </div>
              {adjustQty && (
                <div className="p-3 bg-emerald-50 rounded-lg text-sm">
                  New stock level: <span className="font-bold">
                    {adjustType === 'in'
                      ? selectedItem.quantity + parseInt(adjustQty || '0')
                      : Math.max(0, selectedItem.quantity - parseInt(adjustQty || '0'))
                    }
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(false)}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? 'Saving...' : 'Adjust Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
