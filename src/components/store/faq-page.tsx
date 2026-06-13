'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Search,
  HelpCircle,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  Shirt,
  UserCircle,
  MessageCircle,
  ChevronRight,
  Info,
  Shield,
  Clock,
  DollarSign,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

interface FAQItem {
  question: string
  answer: string
  icon: React.ComponentType<{ className?: string }>
}

interface FAQCategory {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    id: 'general',
    label: 'General',
    icon: Info,
    items: [
      {
        question: 'What is ShopHub?',
        answer: 'ShopHub is your one-stop online shopping destination offering a wide range of quality products at competitive prices. We provide a seamless shopping experience with fast shipping, easy returns, and excellent customer support.',
        icon: Info,
      },
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign In" button in the top right corner, then select "Create Account". Fill in your name, email, and password to register. You can also sign up using your social media accounts for faster registration.',
        icon: UserCircle,
      },
      {
        question: 'Is my personal information secure?',
        answer: 'Absolutely! We use industry-standard SSL encryption to protect your data. Your personal information is never shared with third parties without your consent. We comply with all data protection regulations.',
        icon: Shield,
      },
      {
        question: 'Do you offer gift cards?',
        answer: 'Yes, we offer digital gift cards in denominations of $25, $50, $75, and $100. Gift cards never expire and can be used on any product in our store. You can purchase them from our products page.',
        icon: DollarSign,
      },
      {
        question: 'How can I contact customer support?',
        answer: 'You can reach us through our Contact Us page, by email at support@shophub.com, or by calling +1 (555) 123-4567. Our support team is available Monday through Friday, 9 AM to 6 PM EST.',
        icon: MessageCircle,
      },
      {
        question: 'Do you have a loyalty program?',
        answer: 'Yes! Our rewards program lets you earn points on every purchase. You earn 1 point for every dollar spent. Points can be redeemed for discounts on future orders. Check your Rewards tab in My Account for details.',
        icon: DollarSign,
      },
    ],
  },
  {
    id: 'orders-shipping',
    label: 'Orders & Shipping',
    icon: Package,
    items: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping takes 3-5 business days, while express shipping delivers in 1-2 business days. International orders typically take 7-14 business days depending on the destination country.',
        icon: Truck,
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order ships, you\'ll receive a confirmation email with a tracking number. You can also track your order by visiting our Order Tracking page and entering your order number.',
        icon: Package,
      },
      {
        question: 'Do you offer free shipping?',
        answer: 'Yes! We offer free standard shipping on all orders over $50. For orders under $50, a flat shipping rate of $4.99 applies. Express shipping is available for an additional fee.',
        icon: Truck,
      },
      {
        question: 'Can I change my shipping address after placing an order?',
        answer: 'You can update your shipping address within 2 hours of placing your order by contacting our support team. After that window, we may have already processed your order for shipping.',
        icon: Package,
      },
      {
        question: 'What happens if my package is lost or damaged?',
        answer: 'If your package is lost or arrives damaged, contact us immediately. We\'ll either resend your order at no additional cost or issue a full refund. All orders are insured against loss and damage during transit.',
        icon: Shield,
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination. You can check availability and rates during checkout.',
        icon: Truck,
      },
      {
        question: 'Can I cancel my order?',
        answer: 'You can cancel your order within 1 hour of placing it by contacting our support team. If the order has already been processed for shipping, we won\'t be able to cancel it, but you can return it once received.',
        icon: Clock,
      },
    ],
  },
  {
    id: 'returns-refunds',
    label: 'Returns & Refunds',
    icon: RotateCcw,
    items: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day hassle-free return policy. Items must be unused, in their original packaging, and with all tags attached. Some categories like underwear and personalized items are non-returnable for hygiene reasons.',
        icon: RotateCcw,
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Log into your account, go to Orders, find the order you want to return, and click "Request Return". Follow the prompts to select items and reason. You\'ll receive a prepaid return label via email within 24 hours.',
        icon: RotateCcw,
      },
      {
        question: 'How long do refunds take?',
        answer: 'Once we receive your returned item, we\'ll inspect it and process your refund within 3-5 business days. The refund will appear on your original payment method within 5-10 business days depending on your bank.',
        icon: DollarSign,
      },
      {
        question: 'Can I exchange an item instead of returning it?',
        answer: 'Yes, you can request an exchange for a different size, color, or product. The easiest way is to return the original item and place a new order. This ensures faster processing and availability.',
        icon: RotateCcw,
      },
      {
        question: 'Who pays for return shipping?',
        answer: 'For defective or incorrect items, we cover return shipping costs. For other returns (change of mind, wrong size), a return shipping fee of $5.99 will be deducted from your refund.',
        icon: Truck,
      },
      {
        question: 'What if I received the wrong item?',
        answer: 'We\'re sorry for the mix-up! Contact our support team immediately with your order number and photos of the item received. We\'ll send the correct item at no additional cost and arrange a pickup for the wrong item.',
        icon: Package,
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Visa, MasterCard, American Express, PayPal, and Stripe. For select regions, we also support mobile payment methods like bKash and Nagad. All transactions are secured with SSL encryption.',
        icon: CreditCard,
      },
      {
        question: 'Is it safe to use my credit card on your site?',
        answer: 'Absolutely! We use industry-standard 256-bit SSL encryption and are PCI DSS compliant. Your credit card details are never stored on our servers - they\'re processed securely by our payment partners.',
        icon: Shield,
      },
      {
        question: 'Can I use multiple payment methods for one order?',
        answer: 'Currently, we only support one payment method per order. However, you can use gift cards or reward points in combination with a payment method during checkout.',
        icon: CreditCard,
      },
      {
        question: 'How do I apply a coupon code?',
        answer: 'Enter your coupon code in the "Promo Code" field during checkout or on the cart page. The discount will be applied to your order total immediately. Only one coupon can be used per order.',
        icon: DollarSign,
      },
      {
        question: 'Why was my payment declined?',
        answer: 'Payments may be declined due to insufficient funds, incorrect card details, expired cards, or your bank\'s security measures. Try again with a different payment method or contact your bank for more information.',
        icon: CreditCard,
      },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Shirt,
    items: [
      {
        question: 'How do I find the right size?',
        answer: 'Each product page has a "Size Guide" button that shows detailed measurement charts for clothing and shoes. We recommend measuring yourself and comparing with our size chart before ordering.',
        icon: Shirt,
      },
      {
        question: 'Are product colors accurate on the website?',
        answer: 'We make every effort to display product colors accurately. However, colors may vary slightly due to monitor settings and lighting conditions. If you\'re unsatisfied with the color, you can always return the item.',
        icon: Info,
      },
      {
        question: 'Do you restock sold-out items?',
        answer: 'We regularly restock popular items. You can sign up for "Back in Stock" notifications on any out-of-stock product page. We\'ll email you as soon as the item becomes available again.',
        icon: Package,
      },
      {
        question: 'Are your products authentic?',
        answer: 'Yes, we only sell 100% authentic products sourced directly from authorized manufacturers and distributors. Every product comes with an authenticity guarantee.',
        icon: Shield,
      },
      {
        question: 'How do I leave a product review?',
        answer: 'After receiving your order, go to the product page and scroll to the Reviews section. Click "Write a Review", rate the product, and share your experience. Reviews help other shoppers make informed decisions!',
        icon: MessageCircle,
      },
      {
        question: 'What does "Pre-order" mean?',
        answer: 'Pre-order means the product is not yet in stock but will be available soon. You can place an order now and we\'ll ship it as soon as it arrives. Your payment won\'t be charged until the item ships.',
        icon: Clock,
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    icon: UserCircle,
    items: [
      {
        question: 'How do I reset my password?',
        answer: 'Click "Sign In", then "Forgot Password". Enter your email address and we\'ll send you a password reset link. The link expires after 24 hours for security reasons.',
        icon: UserCircle,
      },
      {
        question: 'How do I update my account information?',
        answer: 'Log into your account, go to "My Account" > "Profile", and update your name, email, phone number, or password. Changes take effect immediately.',
        icon: UserCircle,
      },
      {
        question: 'How do I delete my account?',
        answer: 'You can request account deletion from your Profile settings under "Danger Zone". Please note that this action is permanent and will remove all your data, order history, and reward points.',
        icon: UserCircle,
      },
      {
        question: 'Can I have multiple shipping addresses?',
        answer: 'Yes! You can save multiple shipping addresses in your account. Go to "My Account" > "Addresses" to add, edit, or remove addresses. You can select any saved address during checkout.',
        icon: Package,
      },
      {
        question: 'How do reward points work?',
        answer: 'You earn 1 point for every dollar spent. Points can be redeemed for discounts: 500 points = $5 off, 1000 points = $10 off, etc. Points are automatically added to your account after each purchase and can be tracked in the Rewards tab.',
        icon: DollarSign,
      },
      {
        question: 'How do I unsubscribe from newsletters?',
        answer: 'Click the "Unsubscribe" link at the bottom of any newsletter email, or go to "My Account" > "Profile" and update your email preferences. It may take up to 48 hours for the change to take effect.',
        icon: MessageCircle,
      },
    ],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function FAQPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('general')
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Filter FAQ items based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return faqData
    const query = searchQuery.toLowerCase()
    return faqData
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.items.length > 0)
  }, [searchQuery])

  // Smooth scroll to category
  const scrollToCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId)
    const el = categoryRefs.current[categoryId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchQuery('')
  }, [])

  // Set initial category ref
  useEffect(() => {
    categoryRefs.current[activeCategory] = categoryRefs.current[activeCategory]
  }, [activeCategory])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <BreadcrumbNav items={[{ label: 'FAQ' }]} />
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <HelpCircle className="h-4 w-4 text-emerald-200" />
              <span className="text-sm text-white/90 font-medium">Find answers quickly</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Help Center</h1>
            <p className="text-lg text-emerald-100/80 mb-8">
              Search our FAQ or browse by category to find the answers you need.
            </p>
            {/* Search Input */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-12 text-base bg-white dark:bg-gray-900 border-0 shadow-lg rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        {!searchQuery && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {faqData.map((category) => {
                const Icon = category.icon
                const isActive = activeCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => scrollToCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Search Results Info */}
        {searchQuery && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-muted-foreground">
              {filteredData.reduce((acc, cat) => acc + cat.items.length, 0)} result{filteredData.reduce((acc, cat) => acc + cat.items.length, 0) !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </p>
          </motion.div>
        )}

        {/* FAQ Content */}
        <motion.div
          className="space-y-10 max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredData.length === 0 ? (
            <motion.div className="text-center py-16" variants={itemVariants}>
              <HelpCircle className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">Try a different search term or browse categories above.</p>
            </motion.div>
          ) : (
            filteredData.map((category) => {
              const CategoryIcon = category.icon
              return (
                <motion.div
                  key={category.id}
                  ref={(el) => { categoryRefs.current[category.id] = el }}
                  variants={itemVariants}
                >
                  {!searchQuery && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center">
                        <CategoryIcon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <h2 className="text-xl font-bold">{category.label}</h2>
                      <Badge variant="secondary" className="text-xs">
                        {category.items.length} questions
                      </Badge>
                    </div>
                  )}
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        {category.items.map((item, idx) => {
                          const ItemIcon = item.icon
                          return (
                            <AccordionItem
                              key={idx}
                              value={`${category.id}-${idx}`}
                              className={idx === category.items.length - 1 ? 'border-b-0' : ''}
                            >
                              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors group text-left">
                                <div className="flex items-center gap-3 text-left">
                                  <ItemIcon className="h-4 w-4 text-emerald-500 shrink-0 group-hover:text-emerald-600 transition-colors" />
                                  <span className="font-medium text-sm">{item.question}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-5 pb-4">
                                <div className="pl-7 text-sm text-muted-foreground leading-relaxed">
                                  {item.answer}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </motion.div>

        {/* Still Need Help CTA */}
        <motion.section
          className="mt-16 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Can&apos;t find what you&apos;re looking for? Our support team is ready to assist you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                  onClick={() => navigateStore('contact')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
                <Button variant="outline" className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Browse All Topics
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
