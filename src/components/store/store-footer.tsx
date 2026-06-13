'use client'

import { useState, useCallback, useEffect } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { subscribeNewsletter } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Package,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Link,
  FileText,
  HelpCircle,
  ShieldCheck,
  Scale,
  Navigation,
  Gift,
  ArrowUp,
  CheckCircle2,
  AlertCircle,
  Download,
  Apple,
  Smartphone,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const NEWSLETTER_STORAGE_KEY = 'shophub-newsletter-subscribed'

function getSubscribedEmails(): string[] {
  try {
    const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY)
    return stored ? JSON.parse(stored) as string[] : []
  } catch {
    return []
  }
}

function addSubscribedEmail(email: string) {
  try {
    const emails = getSubscribedEmails()
    if (!emails.includes(email.toLowerCase())) {
      emails.push(email.toLowerCase())
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(emails))
    }
  } catch { /* ignore */ }
}

function isEmailSubscribed(email: string): boolean {
  return getSubscribedEmails().includes(email.toLowerCase())
}

export function StoreFooter() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [alreadySubscribed, setAlreadySubscribed] = useState(false)
  const [emailError, setEmailError] = useState('')
  const navigateStore = useNavStore((s) => s.navigateStore)

  useEffect(() => {
    if (email.trim() && isEmailSubscribed(email.trim())) {
      setAlreadySubscribed(true)
    } else {
      setAlreadySubscribed(false)
    }
  }, [email])

  const validateEmail = useCallback((emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailStr.trim()) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(emailStr.trim())) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) return

    if (isEmailSubscribed(email.trim())) {
      toast.info('Already subscribed!', {
        description: 'This email is already subscribed to our newsletter.',
      })
      setAlreadySubscribed(true)
      return
    }

    setSubscribing(true)
    try {
      await subscribeNewsletter(email)
      addSubscribedEmail(email.trim())
      setSubscribed(true)
      setShowSuccessAnimation(true)
      toast.success('Successfully subscribed to newsletter!', {
        description: 'You\'ll receive our latest deals and updates.',
      })
      setEmail('')
      setTimeout(() => setShowSuccessAnimation(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe'
      if (errorMessage.includes('already subscribed') || errorMessage.includes('already')) {
        addSubscribedEmail(email.trim())
        toast.info('Already subscribed!', {
          description: 'This email is already subscribed to our newsletter.',
        })
        setAlreadySubscribed(true)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="mt-auto footer-gradient-border bg-gradient-to-b from-muted/30 to-muted/60">
      {/* Features bar */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% secure checkout</p>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day return policy</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Wave SVG Separator */}
      <div className="relative h-8 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-8"
          viewBox="0 0 1440 40"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 20C240 0 480 40 720 20C960 0 1200 40 1440 20V40H0V20Z"
            className="fill-emerald-500/5"
          />
          <path
            d="M0 28C360 8 720 40 1080 20C1260 10 1350 25 1440 28V40H0V28Z"
            className="fill-emerald-500/8"
          />
        </svg>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Shop Info */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                ShopHub
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your one-stop destination for quality products at unbeatable prices. Shop with confidence and enjoy a seamless experience.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                123 Commerce St, New York, NY 10001
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                support@shophub.com
              </div>
            </div>

            {/* Social Links with hover scale + color animation */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: Facebook, label: 'Facebook', hoverClass: 'hover:bg-blue-500', color: 'text-blue-500' },
                { Icon: Twitter, label: 'Twitter', hoverClass: 'hover:bg-sky-500', color: 'text-sky-500' },
                { Icon: Instagram, label: 'Instagram', hoverClass: 'hover:bg-pink-500', color: 'text-pink-500' },
                { Icon: Youtube, label: 'Youtube', hoverClass: 'hover:bg-red-600', color: 'text-red-500' },
              ].map(({ Icon, label, hoverClass }) => (
                <a
                  key={label}
                  href="#"
                  className={`social-icon-hover h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground ${hoverClass} hover:text-white`}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Link className="h-4 w-4 text-emerald-500" />
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', page: 'home' as const, icon: Navigation },
                { label: 'All Products', page: 'products' as const, icon: Package },
                { label: 'New Arrivals', page: 'products' as const, params: { newArrival: 'true' }, icon: Truck },
                { label: 'Best Sellers', page: 'products' as const, params: { bestSeller: 'true' }, icon: Shield },
                { label: 'Featured', page: 'products' as const, params: { featured: 'true' }, icon: ShieldCheck },
                { label: 'My Account', page: 'account' as const, icon: Mail },
                { label: 'My Wishlist', page: 'wishlist' as const, icon: Mail },
                { label: 'Blog', page: 'blog' as const, icon: FileText },
                { label: 'Gift Cards', page: 'gift-cards' as const, icon: Gift },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigateStore(item.page, item.params)}
                    className="underline-slide flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 transition-colors group"
                  >
                    <item.icon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Headphones className="h-4 w-4 text-emerald-500" />
              Customer Service
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Contact Us', page: 'contact' as const, icon: Phone },
                { label: 'Shipping Policy', page: 'shipping' as const, icon: Truck },
                { label: 'Returns & Exchanges', page: 'return-request' as const, icon: RotateCcw },
                { label: 'FAQ', page: 'faq' as const, icon: HelpCircle },
                { label: 'About Us', page: 'about' as const, icon: Shield },
                { label: 'Terms & Conditions', icon: Scale },
                { label: 'Track Order', page: 'order-tracking' as const, icon: Navigation },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigateStore('page' in item ? item.page : 'page')}
                    className="underline-slide flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 transition-colors group"
                  >
                    <item.icon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter with gradient background */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl bg-gradient-to-br from-emerald-600/5 via-teal-500/5 to-emerald-600/5 dark:from-emerald-600/10 dark:via-teal-500/10 dark:to-emerald-600/10 border border-emerald-200/30 dark:border-emerald-700/20 p-4 -m-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-emerald-500" />
                Newsletter
              </h3>
              <AnimatePresence mode="wait">
                {subscribed && !showSuccessAnimation ? (
                  <motion.div
                    key="thanks"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center text-center gap-3 py-4"
                  >
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-600">Thanks for subscribing!</p>
                      <p className="text-xs text-muted-foreground mt-1">You&apos;ll receive our latest deals and updates.</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setSubscribed(false)}
                    >
                      Subscribe another email
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-sm text-muted-foreground mb-3">
                      Subscribe to get special offers, free giveaways, and exclusive deals.
                    </p>
                    <form onSubmit={handleSubscribe} className="space-y-2">
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                          className={`h-9 bg-background ${emailError ? 'border-red-400 focus-visible:ring-red-400' : alreadySubscribed ? 'border-amber-400' : ''}`}
                          required
                        />
                        {alreadySubscribed && email.trim() && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          </div>
                        )}
                      </div>
                      {emailError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {emailError}
                        </p>
                      )}
                      {alreadySubscribed && email.trim() && !emailError && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Already subscribed!
                        </p>
                      )}
                      {showSuccessAnimation ? (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center justify-center gap-2 py-2"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                          >
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                          </motion.div>
                          <span className="text-sm font-semibold text-emerald-600">Subscribed!</span>
                        </motion.div>
                      ) : (
                        <Button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                          size="sm"
                          disabled={subscribing || alreadySubscribed}
                        >
                          {subscribing ? 'Subscribing...' : alreadySubscribed ? 'Already Subscribed' : 'Subscribe'}
                        </Button>
                      )}
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Download our App section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-500" />
                Download Our App
              </h3>
              <p className="text-xs text-muted-foreground">Shop faster and get exclusive app-only deals</p>
              <div className="flex items-center gap-2">
                {/* App Store Badge */}
                <div className="app-badge">
                  <Apple className="h-5 w-5" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[8px] opacity-70">Download on the</span>
                    <span className="text-[11px] font-semibold">App Store</span>
                  </div>
                </div>
                {/* Google Play Badge */}
                <div className="app-badge">
                  <Smartphone className="h-5 w-5" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[8px] opacity-70">Get it on</span>
                    <span className="text-[11px] font-semibold">Google Play</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      {/* Bottom bar with payment methods and back to top */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
          </p>

          {/* Payment Method Icons Row */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">We accept:</span>
            {/* Visa */}
            <div className="h-7 px-2 rounded bg-gradient-to-b from-blue-800 to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold text-white italic tracking-wider">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="h-7 px-2 rounded bg-gradient-to-b from-red-600 to-red-500 flex items-center justify-center shadow-sm relative overflow-hidden">
              <div className="absolute left-1.5 w-3.5 h-3.5 rounded-full bg-yellow-400/80" />
              <div className="absolute right-1.5 w-3.5 h-3.5 rounded-full bg-orange-400/70" />
              <span className="relative text-[9px] font-bold text-white z-10">MC</span>
            </div>
            {/* PayPal */}
            <div className="h-7 px-2 rounded bg-gradient-to-b from-sky-600 to-sky-500 flex items-center justify-center shadow-sm">
              <span className="text-[9px] font-bold text-white">Pay<span className="text-sky-200">Pal</span></span>
            </div>
            {/* bKash */}
            <div className="h-7 px-2 rounded bg-gradient-to-b from-pink-600 to-pink-500 flex items-center justify-center shadow-sm">
              <span className="text-[9px] font-bold text-white">bKash</span>
            </div>
            {/* Nagad */}
            <div className="h-7 px-2 rounded bg-gradient-to-b from-orange-600 to-orange-500 flex items-center justify-center shadow-sm">
              <span className="text-[9px] font-bold text-white">Nagad</span>
            </div>
          </div>

          {/* Animated Back to top link */}
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 transition-all duration-300 group"
            aria-label="Back to top"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <span className="hidden sm:inline">Back to top</span>
            <motion.div
              className="h-7 w-7 rounded-full bg-muted flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
