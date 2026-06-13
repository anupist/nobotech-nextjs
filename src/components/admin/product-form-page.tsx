'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  DollarSign,
  Package,
  ImageIcon,
  Search,
  ChevronDown,
  Upload,
  X,
  Star,
  ShoppingCart,
  Check,
  Settings2,
  Wand2,
} from 'lucide-react'
import { MediaGallery } from '@/components/shared/media-gallery'
import { MediaPickerButton } from '@/components/shared/media-picker-button'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchAttributes, type AttributeValue, type Attribute } from '@/lib/api'

interface Category {
  id: string
  name: string
  children?: Category[]
}

interface Brand {
  id: string
  name: string
}

interface VariantRow {
  attributeValues: { slug: string; value: string; valueId: string }[]
  sku: string
  name: string
  price: number
  discountPrice: number | null
  thumbnail: string
  stock: number
  isActive: boolean
}

interface Spec {
  key: string
  value: string
}

interface UploadedImage {
  id: string
  url: string
  isThumbnail: boolean
}

const SECTIONS = [
  { key: 'basic', label: 'Basic Info', icon: FileText, color: 'border-l-emerald-500' },
  { key: 'pricing', label: 'Pricing', icon: DollarSign, color: 'border-l-amber-500' },
  { key: 'inventory', label: 'Inventory', icon: Package, color: 'border-l-sky-500' },
  { key: 'images', label: 'Images', icon: ImageIcon, color: 'border-l-purple-500' },
  { key: 'seo', label: 'SEO', icon: Search, color: 'border-l-rose-500' },
] as const

export function ProductFormPage() {
  const { navigateAdmin, pageParams } = useNavStore()
  const isEditing = pageParams?.id && useNavStore.getState().adminPage === 'edit-product'
  const productId = pageParams?.id || ''

  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEditing)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sku, setSku] = useState('')
  const [barcode, setBarcode] = useState('')
  const [description, setDescription] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [gallery, setGallery] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [status, setStatus] = useState('draft')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isNewArrival, setIsNewArrival] = useState(false)
  const [isBestSeller, setIsBestSeller] = useState(false)
  const [stockQuantity, setStockQuantity] = useState('0')
  const [lowStockAlert, setLowStockAlert] = useState('10')
  const [specifications, setSpecifications] = useState<Spec[]>([])
  const [variantRows, setVariantRows] = useState<VariantRow[]>([])
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([])
  const [selectedAttrSlugs, setSelectedAttrSlugs] = useState<string[]>([])
  const [selectedAttrValues, setSelectedAttrValues] = useState<Record<string, string[]>>({})
  const [fetchingAttrs, setFetchingAttrs] = useState(false)
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkStock, setBulkStock] = useState('')

  // New state
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['basic', 'pricing', 'inventory', 'images']))
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false)

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Margin calculator
  const marginInfo = useMemo(() => {
    const cost = parseFloat(costPrice) || 0
    const selling = parseFloat(sellingPrice) || 0
    const discount = discountPrice ? parseFloat(discountPrice) : selling
    const finalPrice = discount || selling
    if (cost <= 0 || finalPrice <= 0) return { margin: 0, markup: 0, profit: 0 }
    const profit = finalPrice - cost
    const margin = (profit / finalPrice) * 100
    const markup = (profit / cost) * 100
    return { margin: Math.round(margin * 10) / 10, markup: Math.round(markup * 10) / 10, profit: Math.round(profit * 100) / 100 }
  }, [costPrice, sellingPrice, discountPrice])

  const generateSlug = useCallback((val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }, [])

  const handleNameChange = useCallback((val: string) => {
    setName(val)
    setSlug(generateSlug(val))
  }, [generateSlug])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/brands')
      const data = await res.json()
      if (data.success) setBrands(data.data || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }, [])

  const fetchProduct = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/products?id=${id}`)
      const data = await res.json()
      if (data.success && data.data) {
        const p = data.data
        setName(p.name || '')
        setSlug(p.slug || '')
        setSku(p.sku || '')
        setBarcode(p.barcode || '')
        setDescription(p.description || '')
        setCostPrice(String(p.costPrice || ''))
        setSellingPrice(String(p.sellingPrice || ''))
        setDiscountPrice(p.discountPrice ? String(p.discountPrice) : '')
        setCategoryId(p.categoryId || '')
        setBrandId(p.brandId || '')
        setThumbnail(p.thumbnail || '')
        setGallery(p.gallery || '')
        setMetaTitle(p.metaTitle || '')
        setMetaDescription(p.metaDescription || '')
        setMetaKeywords(p.metaKeywords || '')
        setStatus(p.status || 'draft')
        setIsFeatured(p.isFeatured || false)
        setIsNewArrival(p.isNewArrival || false)
        setIsBestSeller(p.isBestSeller || false)
        if (p.inventory) {
          setStockQuantity(String(p.inventory.quantity || 0))
          setLowStockAlert(String(p.inventory.lowStockAlert || 10))
        }
        if (p.specifications) {
          try {
            const specs = typeof p.specifications === 'string'
              ? JSON.parse(p.specifications)
              : p.specifications
            setSpecifications(Array.isArray(specs) ? specs : [])
          } catch {
            setSpecifications([])
          }
        }
        if (p.variants) {
          const hasAttrValues = p.variants.some((v: any) => v.attributeValues?.length > 0)
          if (hasAttrValues) {
            setVariantRows(
              p.variants.map((v: any) => {
                const avs = (v.attributeValues || []).map((pvv: any) => ({
                  slug: pvv.attributeValue?.attribute?.slug || '',
                  value: pvv.attributeValue?.value || '',
                  valueId: pvv.attributeValueId || '',
                }))
                return {
                  attributeValues: avs,
                  sku: v.sku || '',
                  name: v.name || '',
                  price: v.price || 0,
                  discountPrice: v.discountPrice || null,
                  thumbnail: v.images && v.images.length > 0 ? v.images[0].url : v.thumbnail || '',
                  stock: v.inventory?.quantity || 0,
                  isActive: v.isActive !== false,
                }
              })
            )
          } else {
            setVariantRows(
              p.variants.map((v: any) => ({
                attributeValues: [],
                sku: v.sku || '',
                name: v.name || '',
                price: v.price || 0,
                discountPrice: v.discountPrice || null,
                thumbnail: v.thumbnail || '',
                stock: 0,
                isActive: v.isActive !== false,
              }))
            )
          }
        }
        // Set uploaded images from thumbnail/gallery
        const imgs: UploadedImage[] = []
        if (p.thumbnail) {
          imgs.push({ id: `img-0`, url: p.thumbnail, isThumbnail: true })
        }
        if (p.gallery) {
          const galleryUrls = String(p.gallery).split(',').map((u: string) => u.trim()).filter(Boolean)
          galleryUrls.forEach((url: string, i: number) => {
            imgs.push({ id: `img-${i + 1}`, url, isThumbnail: false })
          })
        }
        setUploadedImages(imgs)
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchBrands()
    if (isEditing && productId) {
      fetchProduct(productId)
    }
  }, [fetchCategories, fetchBrands, fetchProduct, isEditing, productId])

  const addSpec = useCallback(() => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }])
  }, [])

  const removeSpec = useCallback((index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateSpec = useCallback((index: number, field: 'key' | 'value', val: string) => {
    setSpecifications((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)))
  }, [])

  // Fetch attributes on mount
  useEffect(() => {
    const load = async () => {
      setFetchingAttrs(true)
      try {
        const res = await fetchAttributes()
        if (res.success) setAllAttributes(res.data)
      } catch {
        console.error('Failed to fetch attributes')
      } finally {
        setFetchingAttrs(false)
      }
    }
    load()
  }, [])

  const toggleAttrSlug = useCallback((slug: string) => {
    setSelectedAttrSlugs((prev) => {
      if (prev.includes(slug)) {
        setSelectedAttrValues((v) => {
          const next = { ...v }
          delete next[slug]
          return next
        })
        return prev.filter((s) => s !== slug)
      }
      return [...prev, slug]
    })
    setVariantRows([])
  }, [])

  const toggleAttrValue = useCallback((slug: string, valueId: string) => {
    setSelectedAttrValues((prev) => {
      const current = prev[slug] || []
      const next = current.includes(valueId)
        ? current.filter((id) => id !== valueId)
        : [...current, valueId]
      return { ...prev, [slug]: next }
    })
    setVariantRows([])
  }, [])

  const generateVariants = useCallback(() => {
    const attrEntries = selectedAttrSlugs
      .map((slug) => ({
        slug,
        values: (allAttributes.find((a) => a.slug === slug)?.values || []).filter((v) =>
          selectedAttrValues[slug]?.includes(v.id)
        ),
      }))
      .filter((e) => e.values.length > 0)

    if (attrEntries.length === 0) {
      toast.error('Select at least one attribute and value')
      return
    }

    const cartesian = attrEntries.reduce<{ slug: string; value: string; valueId: string }[][]>(
      (acc, attr) =>
        acc.flatMap((combo) =>
          attr.values.map((val) => [
            ...combo,
            { slug: attr.slug, value: val.value, valueId: val.id },
          ])
        ),
      [[]] as any
    )

    setVariantRows(
      cartesian.map((combo) => {
        const nameParts = combo.map((c) => c.value)
        const slugParts = nameParts.map((v) => v.toLowerCase().replace(/\s+/g, '-'))
        return {
          attributeValues: combo,
          sku: `${slug}-${slugParts.join('-')}`,
          name: nameParts.join(' / '),
          price: parseFloat(sellingPrice) || 0,
          discountPrice: null,
          thumbnail: '',
          stock: 0,
          isActive: true,
        }
      })
    )

    toast.success(`Generated ${cartesian.length} variants`)
  }, [selectedAttrSlugs, selectedAttrValues, allAttributes, slug, sellingPrice])

  const updateVariantRow = useCallback((index: number, field: string, val: string | number | boolean | null) => {
    setVariantRows((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: val } : v)))
  }, [])

  const removeVariantRow = useCallback((index: number) => {
    setVariantRows((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const applyBulkPrice = useCallback(() => {
    const price = parseFloat(bulkPrice)
    if (isNaN(price)) return
    setVariantRows((prev) => prev.map((v) => ({ ...v, price })))
    setBulkPrice('')
    toast.success(`Set all variant prices to $${price.toFixed(2)}`)
  }, [bulkPrice])

  const applyBulkStock = useCallback(() => {
    const stock = parseInt(bulkStock)
    if (isNaN(stock)) return
    setVariantRows((prev) => prev.map((v) => ({ ...v, stock })))
    setBulkStock('')
    toast.success(`Set all variant stock to ${stock}`)
  }, [bulkStock])

  // Image handling
  const addPlaceholderImage = useCallback(() => {
    const seed = Math.random().toString(36).substring(2, 10)
    const newImg: UploadedImage = {
      id: `img-${Date.now()}`,
      url: `https://picsum.photos/seed/${seed}/400/400`,
      isThumbnail: uploadedImages.length === 0,
    }
    setUploadedImages((prev) => [...prev, newImg])
    // Update thumbnail/gallery fields
    const updatedImgs = [...uploadedImages, newImg]
    syncImageFields(updatedImgs)
  }, [uploadedImages])

  const removeImage = useCallback((imgId: string) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((img) => img.id !== imgId)
      // If removing thumbnail, set first remaining as thumbnail
      if (prev.find((i) => i.id === imgId)?.isThumbnail && updated.length > 0) {
        updated[0] = { ...updated[0], isThumbnail: true }
      }
      syncImageFields(updated)
      return updated
    })
  }, [])

  const setAsThumbnail = useCallback((imgId: string) => {
    setUploadedImages((prev) => {
      const updated = prev.map((img) => ({ ...img, isThumbnail: img.id === imgId }))
      syncImageFields(updated)
      return updated
    })
  }, [])

  const syncImageFields = useCallback((imgs: UploadedImage[]) => {
    const thumbImg = imgs.find((i) => i.isThumbnail)
    const galleryImgs = imgs.filter((i) => !i.isThumbnail)
    setThumbnail(thumbImg?.url || '')
    setGallery(galleryImgs.map((i) => i.url).join(', '))
  }, [])

  // Media Gallery handler - add selected URLs as images
  const handleMediaSelect = useCallback((urls: string[]) => {
    const newImgs: UploadedImage[] = urls.map((url, i) => ({
      id: `img-${Date.now()}-${i}`,
      url,
      isThumbnail: uploadedImages.length === 0 && i === 0,
    }))
    setUploadedImages((prev) => {
      const updated = [...prev, ...newImgs]
      // If no thumbnail exists, set first new image as thumbnail
      if (!prev.some((img) => img.isThumbnail) && newImgs.length > 0) {
        newImgs[0].isThumbnail = true
      }
      syncImageFields(updated)
      return updated
    })
  }, [uploadedImages, syncImageFields])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    // Visual only - add placeholder images on "drop"
    addPlaceholderImage()
  }, [addPlaceholderImage])

  const handleSave = useCallback(async (saveAsDraft = false) => {
    if (!name || !slug || !sku) {
      toast.error('Name, slug, and SKU are required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...(isEditing ? { id: productId } : {}),
        name,
        slug,
        sku,
        barcode: barcode || null,
        description: description || null,
        specifications: specifications.length > 0 ? JSON.stringify(specifications) : null,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        thumbnail: thumbnail || null,
        gallery: gallery || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        status: saveAsDraft ? 'draft' : status,
        isFeatured,
        isNewArrival,
        isBestSeller,
        categoryId: categoryId || null,
        brandId: brandId || null,
        variants:
          variantRows.length > 0
            ? variantRows.map((vr) => ({
                attributeValueIds: vr.attributeValues.map((av) => av.valueId),
                sku: vr.sku,
                name: vr.name,
                price: vr.price,
                stock: vr.stock,
                thumbnail: vr.thumbnail || null,
                discountPrice: vr.discountPrice,
                isActive: vr.isActive,
              }))
            : undefined,
        inventory: {
          quantity: parseInt(stockQuantity) || 0,
          lowStockAlert: parseInt(lowStockAlert) || 10,
        },
      }

      const res = await fetch('/api/admin/products', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(saveAsDraft ? 'Draft saved successfully' : isEditing ? 'Product updated successfully' : 'Product created successfully')
        navigateAdmin('products')
      } else {
        toast.error(data.error || 'Failed to save product')
      }
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }, [name, slug, sku, barcode, description, specifications, costPrice, sellingPrice, discountPrice, thumbnail, gallery, metaTitle, metaDescription, metaKeywords, status, isFeatured, isNewArrival, isBestSeller, categoryId, brandId, variantRows, stockQuantity, lowStockAlert, isEditing, productId, navigateAdmin])

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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigateAdmin('products')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update product details' : 'Create a new product'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Main Form (3 cols) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Basic Info Section */}
          <Collapsible open={openSections.has('basic')} onOpenChange={() => toggleSection('basic')}>
            <Card className={`border-l-4 ${SECTIONS[0].color}`}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-emerald-600" />
                      </div>
                      <CardTitle className="text-base">Basic Information</CardTitle>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.has('basic') ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Enter product name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug * <span className="text-xs text-muted-foreground">(auto-generated)</span></Label>
                      <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="product-slug" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU *</Label>
                      <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input id="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Barcode" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description</Label>
                      <span className="text-xs text-muted-foreground">{description.length} chars</span>
                    </div>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." rows={5} />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Pricing Section */}
          <Collapsible open={openSections.has('pricing')} onOpenChange={() => toggleSection('pricing')}>
            <Card className={`border-l-4 ${SECTIONS[1].color}`}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-amber-600" />
                      </div>
                      <CardTitle className="text-base">Pricing</CardTitle>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.has('pricing') ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Cost Price</Label>
                      <Input id="costPrice" type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice">Selling Price</Label>
                      <Input id="sellingPrice" type="number" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPrice">Discount Price</Label>
                      <Input id="discountPrice" type="number" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="0.00" />
                    </div>
                  </div>

                  {/* Margin Calculator */}
                  {(parseFloat(sellingPrice) > 0 || parseFloat(costPrice) > 0) && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-3">Margin Calculator</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Profit</p>
                          <p className={`text-lg font-bold ${marginInfo.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ${marginInfo.profit.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Margin</p>
                          <p className={`text-lg font-bold ${marginInfo.margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {marginInfo.margin}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Markup</p>
                          <p className={`text-lg font-bold ${marginInfo.markup >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {marginInfo.markup}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Inventory Section */}
          <Collapsible open={openSections.has('inventory')} onOpenChange={() => toggleSection('inventory')}>
            <Card className={`border-l-4 ${SECTIONS[2].color}`}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center">
                        <Package className="h-4 w-4 text-sky-600" />
                      </div>
                      <CardTitle className="text-base">Inventory</CardTitle>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.has('inventory') ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stockQty">Stock Quantity</Label>
                      <Input id="stockQty" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowStock">Low Stock Alert</Label>
                      <Input id="lowStock" type="number" value={lowStockAlert} onChange={(e) => setLowStockAlert(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock Status</Label>
                      <div className="h-9 flex items-center">
                        {parseInt(stockQuantity) <= parseInt(lowStockAlert) ? (
                          <Badge className="bg-red-100 text-red-700 border-0">Low Stock</Badge>
                        ) : parseInt(stockQuantity) === 0 ? (
                          <Badge className="bg-gray-100 text-gray-700 border-0">Out of Stock</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0">In Stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Images Section */}
          <Collapsible open={openSections.has('images')} onOpenChange={() => toggleSection('images')}>
            <Card className={`border-l-4 ${SECTIONS[3].color}`}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <CardTitle className="text-base">Images</CardTitle>
                      <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">{uploadedImages.length}</Badge>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.has('images') ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Drag and Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragOver
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                        : 'border-muted-foreground/25 hover:border-emerald-300 hover:bg-muted/20'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Drag & drop images here</p>
                    <p className="text-xs text-muted-foreground mb-3">or click to browse (PNG, JPG up to 5MB)</p>
                    <Button variant="outline" size="sm" onClick={addPlaceholderImage} className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Placeholder Image
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMediaGalleryOpen(true)} className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Choose from Gallery
                    </Button>
                  </div>

                  {/* Image Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <AnimatePresence>
                        {uploadedImages.map((img) => (
                          <motion.div
                            key={img.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group rounded-lg border overflow-hidden bg-muted"
                          >
                            <img
                              src={img.url}
                              alt="Product"
                              className="w-full aspect-square object-cover"
                            />
                            {img.isThumbnail && (
                              <Badge className="absolute top-1.5 left-1.5 bg-emerald-600 text-white border-0 text-[10px]">
                                Thumbnail
                              </Badge>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              {!img.isThumbnail && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setAsThumbnail(img.id)}
                                >
                                  Set Thumbnail
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeImage(img.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Thumbnail & Gallery pickers */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Thumbnail</Label>
                      <MediaPickerButton
                        value={thumbnail}
                        onChange={(url) => {
                          setThumbnail(url)
                          if (url && uploadedImages.length > 0 && !uploadedImages.some(img => img.isThumbnail)) {
                            setUploadedImages(prev => {
                              const updated = [{ id: `img-thumb-${Date.now()}`, url, isThumbnail: true }, ...prev.filter(i => !i.isThumbnail)]
                              syncImageFields(updated)
                              return updated
                            })
                          }
                        }}
                        folder="products"
                        label="Choose Thumbnail"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Gallery Images</Label>
                      <div className="flex flex-wrap items-center gap-2">
                        <MediaPickerButton
                          value=""
                          onChange={(url) => {
                            if (url) {
                              const newImg: UploadedImage = {
                                id: `img-${Date.now()}`,
                                url,
                                isThumbnail: false,
                              }
                              setUploadedImages((prev) => {
                                const updated = [...prev, newImg]
                                syncImageFields(updated)
                                return updated
                              })
                            }
                          }}
                          folder="products"
                          label="Add from Gallery"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setMediaGalleryOpen(true)}
                          className="gap-1.5"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          Browse All
                        </Button>
                      </div>
                      {gallery && (
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                          {uploadedImages.filter(i => !i.isThumbnail).length} gallery image(s)
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* SEO Section */}
          <Collapsible open={openSections.has('seo')} onOpenChange={() => toggleSection('seo')}>
            <Card className={`border-l-4 ${SECTIONS[4].color}`}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                        <Search className="h-4 w-4 text-rose-600" />
                      </div>
                      <CardTitle className="text-base">SEO</CardTitle>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.has('seo') ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <span className={`text-xs ${metaTitle.length > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>{metaTitle.length}/60</span>
                    </div>
                    <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Meta title" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="metaDesc">Meta Description</Label>
                      <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>{metaDescription.length}/160</span>
                    </div>
                    <Textarea id="metaDesc" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} placeholder="Meta description" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="metaKeywords">Meta Keywords</Label>
                      <span className="text-xs text-muted-foreground">{metaKeywords.split(',').filter(Boolean).length} keywords</span>
                    </div>
                    <Input id="metaKeywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="keyword1, keyword2" />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Specifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Specifications</CardTitle>
              <Button variant="outline" size="sm" onClick={addSpec}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {specifications.length === 0 && (
                <p className="text-sm text-muted-foreground">No specifications added</p>
              )}
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input placeholder="Key" value={spec.key} onChange={(e) => updateSpec(index, 'key', e.target.value)} className="flex-1" />
                  <Input placeholder="Value" value={spec.value} onChange={(e) => updateSpec(index, 'value', e.target.value)} className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeSpec(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Variants</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateVariants}
                  disabled={selectedAttrSlugs.length === 0 || variantRows.length > 0}
                >
                  <Wand2 className="h-4 w-4 mr-1" /> Generate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Attribute Selector */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Product Attributes</Label>
                {fetchingAttrs ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    Loading attributes...
                  </div>
                ) : allAttributes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No attributes found. Create attributes in the database first.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allAttributes.map((attr) => {
                      const isSelected = selectedAttrSlugs.includes(attr.slug)
                      return (
                        <Badge
                          key={attr.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer select-none"
                          onClick={() => toggleAttrSlug(attr.slug)}
                        >
                          <Check className={`h-3 w-3 mr-1 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                          {attr.name}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Attribute Value Pills */}
              {selectedAttrSlugs.length > 0 && (
                <div className="space-y-3">
                  {selectedAttrSlugs.map((slug) => {
                    const attr = allAttributes.find((a) => a.slug === slug)
                    if (!attr) return null
                    return (
                      <div key={slug}>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">{attr.name} Values</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {attr.values.map((val) => {
                            const active = selectedAttrValues[slug]?.includes(val.id)
                            return (
                              <Badge
                                key={val.id}
                                variant={active ? 'default' : 'secondary'}
                                className="cursor-pointer select-none"
                                onClick={() => toggleAttrValue(slug, val.id)}
                              >
                                {active && <Check className="h-3 w-3 mr-1" />}
                                {val.value}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Divider */}
              {variantRows.length > 0 && <hr className="my-2" />}

              {/* Variant Rows */}
              {variantRows.length > 0 && (
                <div className="space-y-2">
                  {/* Bulk Actions */}
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-xs">
                    <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Bulk:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">Price</span>
                      <Input
                        className="h-7 w-20 text-xs"
                        placeholder="$0.00"
                        value={bulkPrice}
                        onChange={(e) => setBulkPrice(e.target.value)}
                      />
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={applyBulkPrice}>
                        Apply
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">Stock</span>
                      <Input
                        className="h-7 w-20 text-xs"
                        placeholder="0"
                        value={bulkStock}
                        onChange={(e) => setBulkStock(e.target.value)}
                      />
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={applyBulkStock}>
                        Apply
                      </Button>
                    </div>
                  </div>

                  {/* Grid Header */}
                  <div className="hidden md:grid grid-cols-[1fr_auto_100px_80px_80px_48px_36px] gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/30 rounded-lg">
                    <span>Name</span>
                    <span>SKU</span>
                    <span className="text-right">Price</span>
                    <span className="text-right">Stock</span>
                    <span>Image</span>
                    <span className="text-center">Active</span>
                    <span></span>
                  </div>

                  {/* Rows */}
                  <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                    {variantRows.map((vr, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 md:grid-cols-[1fr_auto_100px_80px_80px_48px_36px] gap-2 items-center p-2.5 border rounded-lg bg-background text-sm"
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {vr.attributeValues.map((av, j) => (
                              <Badge key={j} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {av.value}
                              </Badge>
                            ))}
                          </div>
                          <Input
                            className="h-7 mt-1 text-xs"
                            placeholder="Variant name"
                            value={vr.name}
                            onChange={(e) => updateVariantRow(i, 'name', e.target.value)}
                          />
                        </div>
                        <Input
                          className="h-7 text-xs font-mono"
                          placeholder="SKU"
                          value={vr.sku}
                          onChange={(e) => updateVariantRow(i, 'sku', e.target.value)}
                        />
                        <Input
                          className="h-7 text-xs text-right"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={vr.price}
                          onChange={(e) => updateVariantRow(i, 'price', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          className="h-7 text-xs text-right"
                          type="number"
                          step="1"
                          placeholder="0"
                          value={vr.stock}
                          onChange={(e) => updateVariantRow(i, 'stock', parseInt(e.target.value) || 0)}
                        />
                        <div className="flex items-center justify-center">
                          <MediaPickerButton
                            value={vr.thumbnail}
                            onChange={(url) => updateVariantRow(i, 'thumbnail', url)}
                          />
                        </div>
                        <div className="flex justify-center">
                          <Switch
                            checked={vr.isActive}
                            onCheckedChange={(v) => updateVariantRow(i, 'isActive', v)}
                            className="scale-75"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => removeVariantRow(i)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {variantRows.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Select attributes and values, then click <strong>Generate</strong> to create variants.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Live Preview & Sidebar */}
        <div className="space-y-6">
          {/* Live Preview */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border p-4 bg-background">
                {/* Product Card Preview */}
                <div className="space-y-3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={uploadedImages.find((i) => i.isThumbnail)?.url || thumbnail || 'https://picsum.photos/seed/placeholder/400/400'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isFeatured && (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">Featured</Badge>
                      )}
                      {isNewArrival && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">New</Badge>
                      )}
                      {isBestSeller && (
                        <Badge className="bg-sky-100 text-sky-700 border-0 text-[10px]">Best Seller</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2">{name || 'Product Name'}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1">(0)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {discountPrice ? (
                        <>
                          <span className="font-bold text-emerald-600">${parseFloat(discountPrice).toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground line-through">${parseFloat(sellingPrice || '0').toFixed(2)}</span>
                          <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">
                            -{Math.round(((parseFloat(sellingPrice) - parseFloat(discountPrice)) / parseFloat(sellingPrice)) * 100)}%
                          </Badge>
                        </>
                      ) : (
                        <span className="font-bold text-emerald-600">${parseFloat(sellingPrice || '0').toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <ShoppingCart className="h-3 w-3" />
                      {parseInt(stockQuantity) > 0 ? `${stockQuantity} in stock` : 'Out of stock'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Featured</Label>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">New Arrival</Label>
                <Switch checked={isNewArrival} onCheckedChange={setIsNewArrival} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Best Seller</Label>
                <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
              </div>
            </CardContent>
          </Card>

          {/* Category & Brand */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId || 'none'} onValueChange={(v) => setCategoryId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {flattenedCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.depth)}{cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={brandId || 'none'} onValueChange={(v) => setBrandId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button onClick={() => handleSave(false)} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
        </Button>
        <Button variant="outline" onClick={() => handleSave(true)} disabled={saving} className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600">
          <FileText className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button variant="ghost" onClick={() => navigateAdmin('products')}>
          Cancel
        </Button>
      </div>

      {/* Media Gallery Dialog */}
      <MediaGallery
        open={mediaGalleryOpen}
        onOpenChange={setMediaGalleryOpen}
        onSelect={handleMediaSelect}
        multiple={true}
        folder="products"
        maxSelect={8}
      />
    </div>
  )
}
