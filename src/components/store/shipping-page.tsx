'use client'

import { useNavStore } from '@/stores/nav-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import {
  Truck,
  Package,
  Clock,
  ShieldCheck,
  Globe,
  MapPin,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Zap,
  Plane,
  Ship,
  Box,
  Send,
  Wallet,
  RefreshCcw,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { motion } from 'framer-motion'

/* ── Shipping Methods ── */
interface ShippingMethod {
  name: string
  icon: React.ComponentType<{ className?: string }>
  time: string
  cost: string
  features: string[]
  color: string
}

const shippingMethods: ShippingMethod[] = [
  {
    name: 'Standard',
    icon: Truck,
    time: '5-7 business days',
    cost: '$4.99 (Free over $50)',
    features: ['Tracking included', 'Insurance up to $100', 'Signature on delivery'],
    color: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'Express',
    icon: Zap,
    time: '2-3 business days',
    cost: '$9.99',
    features: ['Priority handling', 'Full insurance', 'Real-time tracking', 'Signature required'],
    color: 'from-amber-400 to-orange-500',
  },
  {
    name: 'Overnight',
    icon: Plane,
    time: 'Next business day',
    cost: '$19.99',
    features: ['Guaranteed delivery', 'Full insurance', 'Real-time tracking', 'White glove service', 'Signature required'],
    color: 'from-violet-400 to-purple-500',
  },
]

/* ── Return Policy Accordion Data ── */
const returnPolicies = [
  {
    id: 'return-window',
    title: 'Return Window',
    icon: Clock,
    content:
      'You have 30 days from the date of delivery to initiate a return. Items must be returned within 14 days of initiating the return request. Holiday purchases made between November 15 and December 31 have an extended return window until January 31.',
  },
  {
    id: 'condition-requirements',
    title: 'Condition Requirements',
    icon: CheckCircle2,
    content:
      'Items must be unused, unworn, and in their original packaging with all tags attached. Products should be in the same condition as received. Items that have been washed, altered, or show signs of wear will not be accepted. Electronics must be factory-reset and include all accessories.',
  },
  {
    id: 'non-returnable',
    title: 'Non-Returnable Items',
    icon: XCircle,
    content:
      'The following items cannot be returned for hygiene and safety reasons: underwear, swimwear, earrings, personalized/customized items, perishable goods, hazardous materials, and items marked as "Final Sale". Gift cards and digital downloads are also non-returnable.',
  },
  {
    id: 'refund-methods',
    title: 'Refund Methods',
    icon: Wallet,
    content:
      'Refunds are processed to the original payment method within 3-5 business days after we receive and inspect the return. Credit card refunds may take 5-10 business days to appear on your statement. You can also opt for store credit, which is issued instantly and includes a 5% bonus.',
  },
  {
    id: 'exchange-policy',
    title: 'Exchange Policy',
    icon: RefreshCcw,
    content:
      'You can request an exchange for a different size, color, or variant within the return window. The easiest way is to return the original item and place a new order. If the new item costs more, you\'ll pay the difference. If it costs less, the difference will be refunded. Exchanges are processed within 2-3 business days.',
  },
]

/* ── FAQ Data ── */
const faqItems = [
  {
    question: 'How long does standard shipping take?',
    answer: 'Standard shipping typically takes 5-7 business days within the continental US. Orders placed before 2 PM EST on business days are processed the same day. Delivery to Alaska, Hawaii, and US territories may take an additional 2-3 business days.',
  },
  {
    question: 'Do you ship to PO boxes?',
    answer: 'Yes, we ship to PO boxes via USPS for Standard shipping only. Express and Overnight shipping require a physical street address as they are delivered via FedEx or UPS.',
  },
  {
    question: 'What if my package is delayed?',
    answer: 'If your package is significantly delayed beyond the estimated delivery window, please contact our support team with your order number. We\'ll investigate with the carrier and either locate your package or issue a replacement/refund.',
  },
  {
    question: 'Can I change my shipping address after ordering?',
    answer: 'You can update your shipping address within 2 hours of placing your order by contacting our support team. After that, the order may already be in processing and the address cannot be changed.',
  },
  {
    question: 'Who pays for return shipping?',
    answer: 'For defective or incorrect items, we cover all return shipping costs and provide a prepaid label. For other returns (change of mind, wrong size), a flat return shipping fee of $5.99 will be deducted from your refund.',
  },
  {
    question: 'How do I track my return?',
    answer: 'Once you initiate a return, you\'ll receive a prepaid shipping label via email with a tracking number. You can track the return package through the carrier\'s website. We\'ll also email you when we receive and process your return.',
  },
]

/* ── Animation Variants ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ── Component ── */
export function ShippingPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)

  const returnSteps = [
    { icon: RotateCcw, label: 'Initiate Return', desc: 'Request return from your order page' },
    { icon: Box, label: 'Pack Items', desc: 'Securely pack in original packaging' },
    { icon: Send, label: 'Ship Back', desc: 'Use prepaid label or drop off' },
    { icon: Wallet, label: 'Get Refund', desc: 'Refund processed in 3-5 days' },
  ]

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-14 relative z-10">
          <BreadcrumbNav items={[{ label: 'Shipping & Returns' }]} />
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Truck className="h-4 w-4 text-emerald-200" />
              <span className="text-sm text-white/90 font-medium">Fast & reliable delivery</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Shipping & Returns</h1>
            <p className="text-lg text-emerald-100/80">
              Everything you need to know about delivery, shipping, and our hassle-free return policy.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-16">
        {/* ── Free Shipping Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-0">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Free Shipping on Orders Over $50</h2>
                <p className="text-emerald-100/80 text-sm">No coupon needed — free standard shipping is automatically applied at checkout.</p>
              </div>
              <Button
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-lg shrink-0"
                onClick={() => navigateStore('products')}
              >
                Shop Now
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* ── Shipping Methods Table ── */}
        <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Ship className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Shipping Methods</h2>
          </motion.div>

          {/* Desktop Table */}
          <motion.div variants={itemVariants} className="hidden md:block">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-4 text-sm font-semibold">Method</th>
                      <th className="text-left p-4 text-sm font-semibold">Delivery Time</th>
                      <th className="text-left p-4 text-sm font-semibold">Cost</th>
                      <th className="text-left p-4 text-sm font-semibold">Features</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingMethods.map((method, i) => {
                      const Icon = method.icon
                      return (
                        <tr key={method.name} className={i < shippingMethods.length - 1 ? 'border-b' : ''}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0`}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-semibold">{method.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {method.time}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-emerald-600">{method.cost}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1.5">
                              {method.features.map((f) => (
                                <Badge key={f} variant="secondary" className="text-xs font-normal">
                                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                                  {f}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {shippingMethods.map((method) => {
              const Icon = method.icon
              return (
                <Card key={method.name} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shadow-md`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.time}</p>
                      </div>
                      <span className="ml-auto font-bold text-emerald-600 text-sm">{method.cost}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {method.features.map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs font-normal">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.section>

        {/* ── Shipping Zones ── */}
        <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Shipping Zones</h2>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Accordion type="single" collapsible defaultValue="domestic" className="space-y-3">
              <AccordionItem value="domestic" className="border rounded-xl overflow-hidden px-0">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                    <div className="text-left">
                      <span className="font-semibold">Domestic Shipping (United States)</span>
                      <p className="text-xs text-muted-foreground font-normal">All 50 states, DC, and territories</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>We ship to all 50 US states, Washington DC, Puerto Rico, Guam, US Virgin Islands, and American Samoa.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
                        <p className="font-semibold text-foreground mb-1">Continental US</p>
                        <p>Standard: 5-7 days | Express: 2-3 days | Overnight: 1 day</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
                        <p className="font-semibold text-foreground mb-1">Alaska & Hawaii</p>
                        <p>Standard: 7-10 days | Express: 3-5 days | Overnight: 2 days</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
                        <p className="font-semibold text-foreground mb-1">US Territories</p>
                        <p>Standard: 10-14 days | Express: 5-7 days</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
                        <p className="font-semibold text-foreground mb-1">APO/FPO Addresses</p>
                        <p>Standard: 10-20 days (via USPS)</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="international" className="border rounded-xl overflow-hidden px-0">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-sky-500" />
                    <div className="text-left">
                      <span className="font-semibold">International Shipping</span>
                      <p className="text-xs text-muted-foreground font-normal">Over 50 countries worldwide</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    <p>We ship internationally to over 50 countries. International orders may be subject to customs duties, import taxes, and fees levied by the destination country, which are the responsibility of the recipient.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-sky-50 dark:bg-sky-950/20 rounded-lg p-3">
                        <p className="font-semibold text-foreground mb-1">Canada</p>
                        <p>Standard: 7-14 days — $12.99 | Express: 3-5 days — $24.99</p>
                      </div>
                      <div className="bg-sky-50 dark:bg-sky-950/20 rounded-lg p-3">
                        <p className="font-semibold text-foreground mb-1">Europe & UK</p>
                        <p>Standard: 10-21 days — $15.99 | Express: 5-7 days — $29.99</p>
                      </div>
                      <div className="bg-sky-50 dark:bg-sky-950/20 rounded-lg p-3">
                        <p className="font-semibold text-foreground mb-1">Asia-Pacific</p>
                        <p>Standard: 14-28 days — $18.99 | Express: 5-10 days — $34.99</p>
                      </div>
                      <div className="bg-sky-50 dark:bg-sky-950/20 rounded-lg p-3">
                        <p className="font-semibold text-foreground mb-1">Rest of World</p>
                        <p>Standard: 14-35 days — $22.99 | Express: 7-14 days — $39.99</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">International delivery times are estimates and not guaranteed. Customs processing may cause additional delays.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </motion.section>

        {/* ── Returns Process ── */}
        <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <RotateCcw className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Returns Process</h2>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {returnSteps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div key={step.label} variants={itemVariants}>
                  <Card className="text-center h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="relative mx-auto mb-3">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center mx-auto">
                          <Icon className="h-6 w-6 text-emerald-600" />
                        </div>
                        <Badge className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center bg-emerald-600 text-white border-0 text-xs font-bold">
                          {i + 1}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{step.label}</h3>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.section>

        {/* ── Return Policy Details ── */}
        <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Return Policy Details</h2>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {returnPolicies.map((policy, idx) => {
                    const Icon = policy.icon
                    return (
                      <AccordionItem
                        key={policy.id}
                        value={policy.id}
                        className={idx === returnPolicies.length - 1 ? 'border-b-0' : ''}
                      >
                        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors group text-left">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-emerald-500 shrink-0 group-hover:text-emerald-600 transition-colors" />
                            <span className="font-medium text-sm">{policy.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4">
                          <div className="pl-7 text-sm text-muted-foreground leading-relaxed">
                            {policy.content}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* ── FAQ Section ── */}
        <motion.section variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </motion.div>

          <motion.div variants={itemVariants} className="max-w-3xl">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`faq-${idx}`}
                      className={idx === faqItems.length - 1 ? 'border-b-0' : ''}
                    >
                      <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors text-left">
                        <span className="font-medium text-sm">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-4">
                        <div className="text-sm text-muted-foreground leading-relaxed">
                          {item.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* ── Still Need Help CTA ── */}
        <motion.section
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
              <h2 className="text-2xl font-bold mb-2">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Our support team is here to help with any shipping or return inquiries.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                  onClick={() => navigateStore('contact')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
                <Button variant="outline" className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600" onClick={() => navigateStore('faq')}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Visit FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
}
