'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  RotateCcw,
  ShieldCheck,
  Clock,
  Package,
  Upload,
  X,
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Truck,
  CreditCard,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

const RETURN_REASONS = [
  { value: 'defective', label: 'Defective Product' },
  { value: 'wrong-item', label: 'Wrong Item Received' },
  { value: 'not-as-described', label: 'Not as Described' },
  { value: 'changed-mind', label: 'Changed My Mind' },
  { value: 'other', label: 'Other' },
]

interface ProductOption {
  id: string
  name: string
}

export function ReturnRequestPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const pageParams = useNavStore((s) => s.pageParams)
  const user = useAuthStore((s) => s.user)

  const [orderNumber, setOrderNumber] = useState(pageParams.orderNumber || '')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<Array<{ id: string; url: string; name: string }>>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Load products from order or available products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=20')
        const data = await res.json()
        if (data.success) {
          setProducts(data.data.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })))
        }
      } catch {
        // fallback
        setProducts([
          { id: '1', name: 'iPhone 15 Pro Max' },
          { id: '2', name: 'MacBook Air M3' },
          { id: '3', name: 'Samsung Galaxy S24' },
          { id: '4', name: 'Wireless Headphones' },
          { id: '5', name: 'Smart Watch Pro' },
        ])
      }
    }
    loadProducts()
  }, [])

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return
    const newImages = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setImages((prev) => [...prev, ...newImages].slice(0, 5))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleImageUpload(e.dataTransfer.files)
  }, [handleImageUpload])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orderNumber.trim() || !selectedProduct || !reason) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSubmitted(true)
      toast.success('Return request submitted successfully!')
    } catch {
      toast.error('Failed to submit return request')
    } finally {
      setSubmitting(false)
    }
  }, [orderNumber, selectedProduct, reason])

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Return Request Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            We&apos;ve received your return request. Our team will review it within 24-48 hours and contact you with next steps.
          </p>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-100 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Return ID</span>
                <span className="font-semibold text-emerald-600">RET-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order</span>
                <span className="font-semibold">#{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Processing</span>
                <span className="font-semibold">2-5 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refund Timeline</span>
                <span className="font-semibold text-emerald-600">5-10 business days</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigateStore('account')}>
              My Account
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
              onClick={() => navigateStore('home')}
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <BreadcrumbNav items={[
        { label: 'Account', page: 'account' },
        { label: 'Return Request' },
      ]} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Return Policy Summary */}
        <Card className="mb-6 overflow-hidden border-emerald-200/60 dark:border-emerald-800/40">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Return & Refund Policy</h2>
                <p className="text-sm text-muted-foreground">We want you to be 100% satisfied</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="flex items-start gap-2.5 bg-white/60 dark:bg-white/5 rounded-lg p-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">30-Day Returns</p>
                  <p className="text-[11px] text-muted-foreground">Return within 30 days of delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-white/60 dark:bg-white/5 rounded-lg p-3">
                <Truck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Free Return Shipping</p>
                  <p className="text-[11px] text-muted-foreground">For defective items</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-white/60 dark:bg-white/5 rounded-lg p-3">
                <CreditCard className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Full Refund</p>
                  <p className="text-[11px] text-muted-foreground">Within 5-10 business days</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Estimated Refund Timeline */}
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 mb-6">
          <Clock className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Estimated refund:</strong> 5-10 business days after we receive the returned item
          </p>
        </div>

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => navigateStore('account')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Account
        </Button>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Number */}
              <div className="space-y-2">
                <Label htmlFor="orderNumber" className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-emerald-600" />
                  Order Number *
                </Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., ORD-20240115-001"
                  className="focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-emerald-600" />
                  Product to Return *
                </Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-emerald-600" />
                  Reason for Return *
                </Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-600" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  rows={4}
                  className="resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                  Upload Images (optional, max 5)
                </Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragOver
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-muted-foreground/25 hover:border-emerald-300'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop images here, or{' '}
                    <label className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files)}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB each</p>
                </div>

                {/* Image Previews */}
                <AnimatePresence>
                  {images.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-5 gap-2 mt-2"
                    >
                      {images.map((img) => (
                        <motion.div
                          key={img.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative group aspect-square rounded-lg overflow-hidden border"
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Separator />

              {/* Submit */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Your information is secure
                </p>
                <Button
                  type="submit"
                  disabled={submitting || !orderNumber.trim() || !selectedProduct || !reason}
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 min-w-[160px]"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Submit Return Request
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
