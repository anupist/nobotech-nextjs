'use client'

import { useState, useCallback, useEffect } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  ChevronRight,
  HelpCircle,
  Truck,
  RotateCcw,
  CreditCard,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'
import { fetchSettings, submitContactForm } from '@/lib/api'
import { stripHtml } from '@/lib/utils'

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const contactCardConfig = [
  {
    key: 'contact_address' as const,
    icon: MapPin,
    title: 'Our Address',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    key: 'contact_phone' as const,
    icon: Phone,
    title: 'Phone Number',
    gradient: 'from-teal-400 to-cyan-500',
  },
  {
    key: 'contact_email' as const,
    icon: Mail,
    title: 'Email Address',
    gradient: 'from-cyan-400 to-sky-500',
  },
  {
    key: 'business_hours' as const,
    icon: Clock,
    title: 'Business Hours',
    gradient: 'from-sky-400 to-blue-500',
  },
]

const faqTeaser = [
  {
    question: 'How do I track my order?',
    answer: 'Track your order using the order tracking page with your order number.',
    page: 'order-tracking' as const,
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day hassle-free return policy for all unused items.',
    page: 'faq' as const,
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days, express 1-2 days.',
    page: 'faq' as const,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function ContactPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSettings()
      .then((res) => setSettings(res.data))
      .catch(() => {})
  }, [])

  const getContactDetails = (key: string): string[] => {
    const value = settings[key]
    if (!value) return []
    return value.split('\n').map((s) => s.trim()).filter(Boolean)
  }

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.subject) newErrors.subject = 'Please select a subject'
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validate()) return
      setSubmitting(true)
      try {
        const res = await submitContactForm({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        })
        toast.success(res.data.message || "Message sent successfully! We'll get back to you soon.")
        setFormData({ name: '', email: '', subject: '', message: '' })
        setErrors({})
      } catch {
        toast.error('Failed to send message. Please try again later.')
      } finally {
        setSubmitting(false)
      }
    },
    [validate, formData]
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <BreadcrumbNav items={[{ label: 'Contact Us' }]} />
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <MessageCircle className="h-4 w-4 text-emerald-200" />
              <span className="text-sm text-white/90 font-medium">We&apos;d love to hear from you</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-lg text-emerald-100/80">
              Have a question, feedback, or need help? Our team is here to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <motion.div
            className="lg:col-span-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="shadow-lg border-0 shadow-emerald-500/5">
              <CardContent className="p-6 sm:p-8">
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
                  <p className="text-muted-foreground mb-6">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={itemVariants}>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          if (errors.name) setErrors({ ...errors, name: undefined })
                        }}
                        className={errors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}
                      />
                      {errors.name && (
                        <motion.p
                          className="text-sm text-red-500"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          if (errors.email) setErrors({ ...errors, email: undefined })
                        }}
                        className={errors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}
                      />
                      {errors.email && (
                        <motion.p
                          className="text-sm text-red-500"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => {
                        setFormData({ ...formData, subject: value })
                        if (errors.subject) setErrors({ ...errors, subject: undefined })
                      }}
                    >
                      <SelectTrigger className={errors.subject ? 'border-red-400' : ''}>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="order">Order Support</SelectItem>
                        <SelectItem value="product">Product Question</SelectItem>
                        <SelectItem value="returns">Returns</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <motion.p
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.subject}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value })
                        if (errors.message) setErrors({ ...errors, message: undefined })
                      }}
                      className={errors.message ? 'border-red-400 focus-visible:ring-red-400' : ''}
                    />
                    {errors.message && (
                      <motion.p
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-12 px-8 text-base"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <motion.div
                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info Sidebar */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {contactCardConfig.map((card) => {
              const Icon = card.icon
              const details = getContactDetails(card.key)
              return (
                <motion.div key={card.key} variants={itemVariants}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow group">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{card.title}</h3>
                          {details.length > 0 ? (
                            details.map((detail, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">{detail}</p>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Not set</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* FAQ Teaser */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Quick answers to common questions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {faqTeaser.map((faq, idx) => {
              const Icon = idx === 0 ? Truck : idx === 1 ? RotateCcw : CreditCard
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Icon className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm mb-1">{faq.question}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{stripHtml(faq.answer)}</p>
                          <button
                            onClick={() => navigateStore(faq.page)}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group/link"
                          >
                            Learn more
                            <ChevronRight className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
          <div className="text-center mt-6">
            <Button
              variant="outline"
              className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => navigateStore('faq')}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              View All FAQs
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
