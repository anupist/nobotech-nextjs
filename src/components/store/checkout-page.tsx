'use client'

import { useState, useCallback, useMemo } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useNavStore } from '@/stores/nav-store'
import { createOrder, formatPrice, validateCoupon, type CouponData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  Truck,
  CreditCard,
  ClipboardList,
  Package,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Wallet,
  Smartphone,
  Lock,
  Banknote,
  Calendar,
  Tag,
  ShieldCheck,
  Loader2,
  CheckCircle,
  Gift,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

type CheckoutStep = 'shipping' | 'payment' | 'review'

interface ShippingForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
}

// Step transition animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

const slideTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
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

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const navigateStore = useNavStore((s) => s.navigateStore)
  const user = useAuthStore((s) => s.user)

  const [step, setStep] = useState<CheckoutStep>('shipping')
  const [placing, setPlacing] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [direction, setDirection] = useState(1)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)

  const [shipping, setShipping] = useState<ShippingForm>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  })
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // Gift wrap state
  const [giftWrap, setGiftWrap] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const GIFT_WRAP_COST = 4.99

  const subtotal = getTotal()
  const shippingCost = useMemo(() => {
    if (shippingMethod === 'express') return 19.99
    if (shippingMethod === 'standard') return subtotal > 50 ? 0 : 9.99
    return 0
  }, [shippingMethod, subtotal])
  const couponDiscount = useMemo(() => appliedCoupon?.discountAmount || 0, [appliedCoupon])
  const giftWrapCost = giftWrap ? GIFT_WRAP_COST : 0
  const taxAmount = (subtotal - couponDiscount) * 0.08
  const total = subtotal - couponDiscount + shippingCost + taxAmount + giftWrapCost

  const updateShipping = useCallback((field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }))
  }, [])

  const shippingValid = useMemo(() => {
    return !!(
      shipping.firstName &&
      shipping.lastName &&
      shipping.email &&
      shipping.phone &&
      shipping.address1 &&
      shipping.city &&
      shipping.state &&
      shipping.zipCode
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

  const goToStep = useCallback((newStep: CheckoutStep) => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review']
    const currentIdx = steps.indexOf(step)
    const newIdx = steps.indexOf(newStep)
    setDirection(newIdx > currentIdx ? 1 : -1)
    setStep(newStep)
  }, [step])

  const handlePlaceOrder = useCallback(async () => {
    if (items.length === 0) return
    setPlacing(true)
    try {
      const orderData = {
        customerId: user ? undefined : undefined,
        guestEmail: !user ? shipping.email : undefined,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        })),
        shippingAddress: shipping,
        billingAddress: shipping,
        shippingMethod,
        paymentMethod,
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
  }, [items, shipping, shippingMethod, paymentMethod, shippingCost, taxAmount, user, clearCart, appliedCoupon, couponDiscount])

  // Estimated delivery date
  const estimatedDelivery = useMemo(() => {
    const date = new Date()
    if (shippingMethod === 'express') {
      date.setDate(date.getDate() + 3)
    } else {
      date.setDate(date.getDate() + 7)
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }, [shippingMethod])

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
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Estimated delivery: <strong className="text-foreground">{estimatedDelivery}</strong></span>
            </div>
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

  const steps: { key: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { key: 'shipping', label: 'Shipping', icon: <Truck className="h-4 w-4" /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
    { key: 'review', label: 'Review', icon: <CheckCircle className="h-4 w-4" /> },
  ]

  const currentStepIdx = steps.findIndex((s) => s.key === step)

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
        className="text-2xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Checkout
      </motion.h1>

      {/* Step indicator with animated progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-center">
          {steps.map((s, idx) => (
            <div key={s.key} className="flex items-center">
              <motion.div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  idx < currentStepIdx
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : idx === currentStepIdx
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-muted text-muted-foreground'
                }`}
                whileHover={{ scale: idx === currentStepIdx ? 1.02 : 1 }}
              >
                {idx < currentStepIdx ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative"
                  >
                    <Check className="h-4 w-4" />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-emerald-400/30"
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                ) : s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </motion.div>
              {idx < steps.length - 1 && (
                <div className="relative w-8 sm:w-16 mx-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: idx < currentStepIdx ? 1 : idx === currentStepIdx ? 0.5 : 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                  {idx < currentStepIdx && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/40 to-teal-400/40 origin-left shimmer-subtle"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Shipping Step */}
            {step === 'shipping' && (
              <motion.div
                key="shipping"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'firstName', label: 'First Name *', col: '' },
                    { id: 'lastName', label: 'Last Name *', col: '' },
                    { id: 'email', label: 'Email *', type: 'email', col: '' },
                    { id: 'phone', label: 'Phone *', col: '' },
                    { id: 'address1', label: 'Address *', col: 'sm:col-span-2' },
                    { id: 'address2', label: 'Apartment, suite, etc.', col: 'sm:col-span-2' },
                    { id: 'city', label: 'City *', col: '' },
                    { id: 'state', label: 'State *', col: '' },
                    { id: 'zipCode', label: 'ZIP Code *', col: '' },
                    { id: 'country', label: 'Country', col: '' },
                  ].map((field) => (
                    <div key={field.id} className={`space-y-2 ${field.col}`}>
                      <Label htmlFor={field.id} className="text-sm">{field.label}</Label>
                      <Input
                        id={field.id}
                        type={(field as { type?: string }).type || 'text'}
                        value={shipping[field.id as keyof ShippingForm]}
                        onChange={(e) => updateShipping(field.id as keyof ShippingForm, e.target.value)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    Shipping Method
                  </h3>
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:border-emerald-300 has-[input:checked]:border-emerald-600 has-[input:checked]:bg-emerald-50/50 transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="standard" />
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center group-has-[input:checked]:bg-emerald-200 transition-colors">
                            <Truck className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Standard Shipping</p>
                            <p className="text-xs text-muted-foreground">5-7 business days</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          {subtotal > 50 ? <Badge className="bg-emerald-100 text-emerald-700 border-0">Free</Badge> : '$9.99'}
                        </span>
                      </label>
                      <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:border-emerald-300 has-[input:checked]:border-emerald-600 has-[input:checked]:bg-emerald-50/50 transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="express" />
                          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center group-has-[input:checked]:bg-amber-200 transition-colors">
                            <Truck className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Express Shipping</p>
                            <p className="text-xs text-muted-foreground">2-3 business days</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">$19.99</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Estimated delivery */}
                <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">
                    Estimated delivery: <strong className="text-foreground">{estimatedDelivery}</strong>
                  </span>
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all duration-200"
                    disabled={!shippingValid}
                    onClick={() => goToStep('payment')}
                  >
                    Continue to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <motion.div
                key="payment"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Payment Method</h2>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-emerald-300 has-[input:checked]:border-emerald-600 has-[input:checked]:bg-emerald-50/50 transition-all duration-200 group">
                      <RadioGroupItem value="cod" />
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center group-has-[input:checked]:from-emerald-200 group-has-[input:checked]:to-teal-200 transition-colors">
                        <Banknote className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-emerald-300 has-[input:checked]:border-emerald-600 has-[input:checked]:bg-emerald-50/50 transition-all duration-200 group">
                      <RadioGroupItem value="stripe" />
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center group-has-[input:checked]:from-violet-200 group-has-[input:checked]:to-purple-200 transition-colors">
                        <CreditCard className="h-6 w-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Credit/Debit Card (Stripe)</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-emerald-300 has-[input:checked]:border-emerald-600 has-[input:checked]:bg-emerald-50/50 transition-all duration-200 group">
                      <RadioGroupItem value="bkash" />
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center group-has-[input:checked]:from-pink-200 group-has-[input:checked]:to-rose-200 transition-colors">
                        <Smartphone className="h-6 w-6 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">bKash</p>
                        <p className="text-xs text-muted-foreground">Mobile payment via bKash</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-emerald-300 has-[input:checked]:border-emerald-600 has-[input:checked]:bg-emerald-50/50 transition-all duration-200 group">
                      <RadioGroupItem value="nagad" />
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center group-has-[input:checked]:from-orange-200 group-has-[input:checked]:to-amber-200 transition-colors">
                        <Smartphone className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nagad</p>
                        <p className="text-xs text-muted-foreground">Mobile payment via Nagad</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => goToStep('shipping')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Shipping
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                    onClick={() => goToStep('review')}
                  >
                    Review Order
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Review Step */}
            {step === 'review' && (
              <motion.div
                key="review"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold">Review Your Order</h2>
                </div>

                {/* Shipping Address */}
                <Card className="overflow-hidden border-emerald-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-emerald-100 flex items-center justify-center">
                          <MapPin className="h-3 w-3 text-emerald-600" />
                        </div>
                        Shipping Address
                      </h3>
                      <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700" onClick={() => goToStep('shipping')}>
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">
                      {shipping.firstName} {shipping.lastName}<br />
                      {shipping.address1}
                      {shipping.address2 ? `, ${shipping.address2}` : ''}<br />
                      {shipping.city}, {shipping.state} {shipping.zipCode}<br />
                      {shipping.phone}
                    </p>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="overflow-hidden border-emerald-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-emerald-100 flex items-center justify-center">
                          <CreditCard className="h-3 w-3 text-emerald-600" />
                        </div>
                        Payment Method
                      </h3>
                      <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700" onClick={() => goToStep('payment')}>
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8 capitalize">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'stripe' ? 'Credit/Debit Card' : paymentMethod}
                    </p>
                  </CardContent>
                </Card>

                {/* Gift Wrap Preview */}
                {giftWrap && (
                  <Card className="overflow-hidden border-emerald-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-emerald-100 flex items-center justify-center">
                          <Gift className="h-3 w-3 text-emerald-600" />
                        </div>
                        Gift Wrap
                      </h3>
                      <div className="ml-8 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Premium gift wrapping included <span className="text-emerald-600 font-medium">(+{formatPrice(GIFT_WRAP_COST)})</span>
                        </p>
                        {giftMessage && (
                          <div className="mt-2 p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                            <p className="text-xs text-muted-foreground mb-1 font-medium">Gift Message:</p>
                            <p className="text-sm italic text-foreground">&ldquo;{giftMessage}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Order Items */}
                <Card className="overflow-hidden border-emerald-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-emerald-100 flex items-center justify-center">
                        <Package className="h-3 w-3 text-emerald-600" />
                      </div>
                      Order Items ({items.length})
                    </h3>
                    <div className="space-y-3 ml-8">
                      {items.map((item) => (
                        <div
                          key={`${item.productId}-${item.variantId || 'default'}`}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={item.thumbnail || `https://picsum.photos/seed/${item.productSlug}/80/80`}
                            alt={item.productName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                            {item.variantName && (
                              <p className="text-xs text-muted-foreground">{item.variantName}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium">
                              {formatPrice((item.discountPrice || item.price) * item.quantity)}
                            </p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => goToStep('payment')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Payment
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 shadow-lg shadow-emerald-600/20 transition-all duration-200"
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

            {/* Gift Wrap Option */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setGiftWrap(!giftWrap)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all duration-200 text-left ${
                  giftWrap
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-700'
                    : 'border-border hover:border-emerald-300'
                }`
                }
              >
                <motion.div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    giftWrap
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'
                  }`
                }
                  animate={giftWrap ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Gift className="h-5 w-5" />
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Add Gift Wrap</p>
                    <span className="text-sm font-semibold text-emerald-600">+{formatPrice(GIFT_WRAP_COST)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Premium wrapping with a personal touch</p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  giftWrap
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'border-muted-foreground/30'
                }`}>
                  {giftWrap && <Check className="h-3 w-3 text-white" />}
                </div>
              </button>

              <AnimatePresence>
                {giftWrap && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1 space-y-2">
                      <Label className="text-xs flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3 text-emerald-600" />
                        Gift Message (optional)
                      </Label>
                      <textarea
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder="Write a personal message..."
                        maxLength={200}
                        rows={2}
                        className="w-full rounded-lg border border-emerald-200 dark:border-emerald-800/40 bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                      <p className="text-[11px] text-muted-foreground text-right">{giftMessage.length}/200</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
              {giftWrap && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Gift className="h-3 w-3" />
                    Gift Wrap
                  </span>
                  <span>{formatPrice(giftWrapCost)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-emerald-600">{formatPrice(total)}</span>
            </div>

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
