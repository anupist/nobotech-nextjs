'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useNavStore } from '@/stores/nav-store'
import {
  createOrder,
  fetchSettings,
  fetchCountries,
  fetchShippingMethods,
  fetchPaymentMethods,
  formatPrice,
  validateCoupon,
  type CouponData,
  type CountryData,
  type ShippingMethodData,
  type PaymentMethod,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  Truck,
  CreditCard,
  ClipboardList,
  Package,
  ArrowRight,
  MapPin,
  Banknote,
  Smartphone,
  Wallet,
  Lock,
  Tag,
  ShieldCheck,
  Loader2,
  User,
  Phone,
  Mail,
  MapPinned,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

interface ShippingForm {
  name: string
  phone: string
  email: string
  address: string
  country: string
  state: string
  city: string
  area: string
}

// Success checkmark animation
function SuccessAnimation() {
  return (
    <div className="relative">
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="celebrate-check"
        >
          <Check className="h-12 w-12 text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Pulse rings */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-emerald-400"
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-teal-400"
        initial={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
      />

      {/* Confetti particles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180)
        const distance = 60 + Math.random() * 40
        const colors = ['bg-emerald-400', 'bg-teal-400', 'bg-amber-400', 'bg-rose-400', 'bg-sky-400']
        return (
          <motion.div
            key={i}
            className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full ${colors[i % colors.length]}`}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0, 1, 0.5],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.8, delay: 0.6 + i * 0.05, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

// Confetti rain for success background
function ConfettiRain() {
  const particles = useMemo(() =>
    [...Array(30)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: `${4 + Math.random() * 6}px`,
      color: ['bg-emerald-400', 'bg-teal-400', 'bg-amber-400', 'bg-rose-400', 'bg-sky-400', 'bg-purple-400', 'bg-pink-400'][i % 7],
      rotation: Math.random() * 360,
    })),
    []
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute confetti-particle ${p.color}`}
          style={{
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  )
}

function paymentIcon(name: string) {
  const n = name.toLowerCase()
  if (n.includes('cod') || n.includes('cash')) return <Banknote className="h-5 w-5 text-emerald-600" />
  if (n.includes('bkash') || n.includes('nagad') || n.includes('rocket') || n.includes('mobile')) return <Smartphone className="h-5 w-5 text-pink-600" />
  return <Wallet className="h-5 w-5 text-violet-600" />
}

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const navigateStore = useNavStore((s) => s.navigateStore)
  const user = useAuthStore((s) => s.user)

  const [placing, setPlacing] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)

  const [shipping, setShipping] = useState<ShippingForm>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    country: 'BD',
    state: '',
    city: '',
    area: '',
  })

  const [settings, setSettings] = useState<Record<string, string>>({})
  const [countries, setCountries] = useState<CountryData[]>([])
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodData[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [shippingMethod, setShippingMethod] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  useEffect(() => {
    fetchSettings().then((res) => {
      if (res.success) setSettings(res.data)
    })
    fetchCountries().then((res) => {
      if (res.success) setCountries(res.data)
    })
    fetchShippingMethods().then((res) => {
      if (res.success && res.data.length > 0) {
        setShippingMethods(res.data)
        setShippingMethod((prev) => prev || res.data[0].id)
      }
    })
    fetchPaymentMethods().then((res) => {
      if (res.success && res.data.length > 0) {
        setPaymentMethods(res.data)
        setPaymentMethod((prev) => prev || res.data[0].id)
      }
    })
  }, [])

  const selectedCountry = countries.find((c) => c.code === shipping.country)
  const statesForCountry = selectedCountry?.states || []
  const selectedState = statesForCountry.find((s) => s.name === shipping.state)
  const citiesForState = selectedState?.cities || []
  const selectedCity = citiesForState.find((c) => c.name === shipping.city)
  const areasForCity = selectedCity?.areas || []

  const handleCountryChange = useCallback((code: string) => {
    setShipping((prev) => ({ ...prev, country: code, state: '', city: '', area: '' }))
  }, [])

  const handleStateChange = useCallback((name: string) => {
    setShipping((prev) => ({ ...prev, state: name, city: '', area: '' }))
  }, [])

  const handleCityChange = useCallback((name: string) => {
    setShipping((prev) => ({ ...prev, city: name, area: '' }))
  }, [])

  const handleAreaChange = useCallback((name: string) => {
    setShipping((prev) => ({ ...prev, area: name }))
  }, [])

  const subtotal = getTotal()

  const selectedShippingMethod = shippingMethods.find((m) => m.id === shippingMethod)

  const shippingCost = useMemo(() => {
    if (!selectedShippingMethod) return 0
    if (selectedShippingMethod.freeAbove !== null && subtotal >= selectedShippingMethod.freeAbove) return 0
    return selectedShippingMethod.cost
  }, [selectedShippingMethod, subtotal])

  const couponDiscount = useMemo(() => appliedCoupon?.discountAmount || 0, [appliedCoupon])
  const taxEnabled = settings.tax_enabled === 'false' ? false : true
  const taxRate = taxEnabled ? parseFloat(settings.tax_rate || '8') / 100 : 0
  const taxAmount = (subtotal - couponDiscount) * taxRate
  const total = subtotal - couponDiscount + shippingCost + taxAmount

  const updateShipping = useCallback((field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }))
  }, [])

  const shippingValid = useMemo(() => {
    return !!(
      shipping.name &&
      shipping.phone &&
      shipping.address &&
      shipping.state &&
      shipping.city &&
      shipping.area
    )
  }, [shipping])

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await validateCoupon(couponCode, subtotal)
      setAppliedCoupon(res.data)
      toast.success(`Coupon applied! You save ${formatPrice(res.data.discountAmount)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }, [couponCode, subtotal])

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.info('Coupon removed')
  }, [])

  const handlePlaceOrder = useCallback(async () => {
    if (items.length === 0) return
    if (!shippingValid) {
      toast.error('Please fill in all required shipping fields')
      return
    }
    if (!selectedShippingMethod) {
      toast.error('Please select a shipping method')
      return
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }
    setPlacing(true)
    try {
      const orderData = {
        customerId: user ? undefined : undefined,
        guestEmail: user ? undefined : shipping.email || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        })),
        shippingAddress: shipping,
        billingAddress: shipping,
        shippingMethod: selectedShippingMethod.name,
        paymentMethod: paymentMethods.find((m) => m.id === paymentMethod)?.name || paymentMethod,
        shippingCost,
        taxAmount,
        couponCode: appliedCoupon?.code,
        discountAmount: couponDiscount,
      }
      const res = await createOrder(orderData)
      setOrderNumber(res.data.orderNumber)
      clearCart()
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }, [items, shipping, shippingValid, selectedShippingMethod, paymentMethod, paymentMethods, shippingCost, taxAmount, user, clearCart, appliedCoupon, couponDiscount])

  // Success state
  if (orderNumber) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg relative">
        <ConfettiRain />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 py-4">
            <SuccessAnimation />
          </div>
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            Order Placed Successfully!
          </motion.h1>
          <motion.p
            className="text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            Thank you for your purchase. Your order has been confirmed.
          </motion.p>
          <motion.div
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-100"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.4 }}
          >
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-2xl font-bold text-emerald-600">{orderNumber}</p>
          </motion.div>
          <motion.p
            className="text-sm text-muted-foreground mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            We&apos;ll send you a confirmation email with order details and tracking information.
          </motion.p>
          <motion.div
            className="flex gap-3 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.4 }}
          >
            <Button
              variant="outline"
              onClick={() => navigateStore('account-orders')}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              View Orders
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
              onClick={() => navigateStore('home')}
            >
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add products to your cart before checking out.</p>
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" onClick={() => navigateStore('products')}>
            Browse Products
          </Button>
        </motion.div>
      </div>
    )
  }

  const selectTriggerClass =
    'h-11 w-full transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'

  return (
    <div className="container mx-auto px-4 py-6">
      <BreadcrumbNav items={[{ label: 'Cart', page: 'cart' }, { label: 'Checkout' }]} />

      {/* Secure Checkout Badge */}
      <motion.div
        className="flex items-center justify-center gap-2 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full px-4 py-1.5 text-sm text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          <span className="font-medium">Secure Checkout</span>
          <Lock className="h-3 w-3 text-emerald-500" />
        </div>
      </motion.div>

      <motion.h1
        className="text-2xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Checkout
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold">Shipping Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> Name *
                </Label>
                <Input
                  id="name"
                  value={shipping.name}
                  onChange={(e) => updateShipping('name', e.target.value)}
                  placeholder="Your full name"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shipping.phone}
                  onChange={(e) => updateShipping('phone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email" className="text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={shipping.email}
                  onChange={(e) => updateShipping('email', e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="text-sm flex items-center gap-1.5">
                  <MapPinned className="h-3.5 w-3.5 text-muted-foreground" /> Address *
                </Label>
                <Textarea
                  id="address"
                  value={shipping.address}
                  onChange={(e) => updateShipping('address', e.target.value)}
                  placeholder="House, road, village / thana details"
                  rows={3}
                  className="resize-none transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {countries.length === 0 ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-11 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-11 w-full" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Skeleton className="h-11 w-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">Division *</Label>
                    <Select value={shipping.state} onValueChange={handleStateChange} disabled={statesForCountry.length === 0}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {statesForCountry.map((s) => (
                          <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {statesForCountry.length === 0 && (
                      <p className="text-xs text-muted-foreground">No divisions available</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">City *</Label>
                    <Select value={shipping.city} onValueChange={handleCityChange} disabled={!shipping.state || citiesForState.length === 0}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder={!shipping.state ? 'Select division first' : 'Select city'} />
                      </SelectTrigger>
                      <SelectContent>
                        {citiesForState.map((city) => (
                          <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm">Area *</Label>
                    <Select value={shipping.area} onValueChange={handleAreaChange} disabled={!shipping.city || areasForCity.length === 0}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder={!shipping.city ? 'Select city first' : 'Select area'} />
                      </SelectTrigger>
                      <SelectContent>
                        {areasForCity.map((area) => (
                          <SelectItem key={area.id} value={area.name}>{area.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </section>

          <Separator />

          {/* Shipping Method */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold">Shipping Method</h2>
            </div>

            {shippingMethods.length === 0 ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                <div className="space-y-3">
                  {shippingMethods.map((method) => {
                    const isFree = method.freeAbove !== null && subtotal >= method.freeAbove
                    return (
                      <label
                        key={method.id}
                        className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:border-emerald-300 has-[input:checked]:border-emerald-600 has-[input:checked]:bg-emerald-50/50 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={method.id} />
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center group-has-[input:checked]:bg-emerald-200 transition-colors">
                            <Truck className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{method.name}</p>
                            {method.freeAbove !== null && (
                              <p className="text-xs text-muted-foreground">Free shipping over {formatPrice(method.freeAbove)}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          {isFree ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0">Free</Badge>
                          ) : (
                            formatPrice(method.cost)
                          )}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </RadioGroup>
            )}
          </section>

          <Separator />

          {/* Payment Method */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold">Payment Method</h2>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-emerald-300 has-[input:checked]:border-emerald-600 has-[input:checked]:bg-emerald-50/50 transition-all duration-200 group"
                    >
                      <RadioGroupItem value={method.id} />
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center group-has-[input:checked]:from-emerald-100 group-has-[input:checked]:to-teal-100 transition-colors overflow-hidden">
                        {method.image ? (
                          <img src={method.image} alt={method.name} className="h-full w-full object-cover" />
                        ) : (
                          paymentIcon(method.name)
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{method.name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            )}
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="border rounded-xl p-6 space-y-4 sticky top-24 bg-card">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
              Order Summary
            </h2>

            {/* Cart items preview */}
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'default'}`}
                  className="flex items-center gap-2"
                >
                  <div className="relative shrink-0">
                    <img
                      src={item.thumbnail || `https://picsum.photos/seed/${item.productSlug}/60/60`}
                      alt={item.productName}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-medium">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{item.productName}</p>
                  </div>
                  <span className="text-xs font-medium shrink-0">
                    {formatPrice((item.discountPrice || item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Coupon code */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-emerald-600" />
                Coupon Code
              </Label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">{appliedCoupon.code}</p>
                    <p className="text-xs text-emerald-600">Save {formatPrice(appliedCoupon.discountAmount)}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500" onClick={handleRemoveCoupon}>
                    ×
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-9 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Free</Badge>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              {taxEnabled && taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({parseFloat(settings.tax_rate || '8')}%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-emerald-600">{formatPrice(total)}</span>
            </div>

            {/* Place order */}
            <Button
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all duration-200"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  Place Order
                  <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            {!shippingValid && (
              <p className="text-xs text-muted-foreground text-center">
                Fill in your shipping details to place the order.
              </p>
            )}

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2 text-muted-foreground">
              <div className="flex items-center gap-1 text-[11px]">
                <Lock className="h-3 w-3" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="h-3 w-3" />
                <span>Buyer Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
