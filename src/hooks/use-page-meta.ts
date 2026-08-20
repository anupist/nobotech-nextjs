'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { getFullTitle, getOverrideDescription, setSiteName } from '@/lib/page-meta'
import { initCurrency } from '@/lib/api'

const SECTION_NAMES: Record<string, string> = {
  home: '',
  products: 'Products',
  'product-detail': '',
  cart: 'Cart',
  checkout: 'Checkout',
  wishlist: 'Wishlist',
  auth: 'Account',
  account: 'My Account',
  'account-orders': 'My Orders',
  'account-addresses': 'My Addresses',
  'account-reviews': 'My Reviews',
  search: 'Search',
  blog: 'Blog',
  'blog-detail': '',
  page: '',
  'order-detail': 'Order Details',
  'order-tracking': 'Order Tracking',
  compare: 'Compare Products',
  contact: 'Contact Us',
  faq: 'FAQ',
  'gift-cards': 'Gift Cards',
  deals: 'Deals',
  shipping: 'Shipping',
  about: 'About Us',
  'return-request': 'Return Request',
}

const SECTION_TO_META_PREFIX: Record<string, string> = {
  home: '',
  products: 'meta_products',
  'product-detail': '',
  cart: 'meta_cart',
  checkout: 'meta_checkout',
  wishlist: 'meta_wishlist',
  auth: 'meta_auth',
  account: 'meta_account',
  search: 'meta_search',
  blog: 'meta_blog',
  'blog-detail': '',
  page: '',
  'order-detail': 'meta_order_detail',
  'order-tracking': 'meta_order_tracking',
  compare: 'meta_compare',
  contact: 'meta_contact',
  faq: 'meta_faq',
  'gift-cards': 'meta_gift_cards',
  deals: 'meta_deals',
  shipping: 'meta_shipping',
  about: 'meta_about',
  'return-request': 'meta_return_request',
}

const ADMIN_NAMES: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  products: 'Products',
  'add-product': 'Add Product',
  'edit-product': 'Edit Product',
  categories: 'Categories',
  brands: 'Brands',
  orders: 'Orders',
  'order-detail': 'Order Detail',
  customers: 'Customers',
  'customer-detail': 'Customer Detail',
  reviews: 'Reviews',
  coupons: 'Coupons',
  'flash-sales': 'Flash Sales',
  banners: 'Banners',
  blog: 'Blog',
  pages: 'Pages',
  newsletter: 'Newsletter',
  settings: 'Settings',
  inventory: 'Inventory',
  'audit-logs': 'Audit Logs',
  media: 'Media',
}

let cachedSettings: Record<string, string> | null = null
let settingsPromise: Promise<void> | null = null

export async function fetchSettingsOnce(): Promise<Record<string, string>> {
  if (cachedSettings) return cachedSettings
  if (settingsPromise) {
    await settingsPromise
    return cachedSettings!
  }
  settingsPromise = (async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.success) {
        cachedSettings = data.data
        initCurrency(data.data)
        setSiteName(data.data.site_name || 'KinleyMart')
      }
    } catch {
      // ignore
    }
  })()
  await settingsPromise
  return cachedSettings || {}
}

export function getCachedSettings(): Record<string, string> {
  return cachedSettings || {}
}

function setMetaTags(title: string, description?: string, keywords?: string) {
  if (typeof document === 'undefined') return
  document.title = title
  const setOrCreate = (selector: string, attr: string, value: string) => {
    let el = document.head.querySelector(selector)
    if (!el) {
      el = document.createElement('meta')
      const [name, val] = attr.split('=')
      el.setAttribute(name, val)
      document.head.appendChild(el)
    }
    el.setAttribute('content', value)
  }
  setOrCreate('meta[name="description"]', 'name=description', description || '')
  setOrCreate('meta[property="og:title"]', 'property=og:title', title)
  setOrCreate('meta[property="og:description"]', 'property=og:description', description || '')
  if (keywords) {
    setOrCreate('meta[name="keywords"]', 'name=keywords', keywords)
  }
}

export function usePageMeta() {
  const storePage = useNavStore((s) => s.storePage)
  const adminPage = useNavStore((s) => s.adminPage)
  const viewMode = useNavStore((s) => s.viewMode)
  const pageParams = useNavStore((s) => s.pageParams)
  const settingsRef = useRef<Record<string, string>>({})

  useEffect(() => {
    fetchSettingsOnce().then((s) => {
      settingsRef.current = s
    })
  }, [])

  const updateMeta = useCallback(() => {
    const s = settingsRef.current
    const siteName = s.site_name || 'KinleyMart'
    const slogan = s.site_slogan || s.site_tagline || ''

    if (viewMode === 'admin') {
      const sectionName = ADMIN_NAMES[adminPage] || adminPage
      const overrideTitle = getFullTitle()
      const overrideDesc = getOverrideDescription()
      const title = overrideTitle || `${sectionName} - Admin - ${siteName}`
      setMetaTags(title, overrideDesc || s.seo_meta_description || s.site_description || '')
      return
    }

    const overrideTitle = getFullTitle()
    if (overrideTitle) {
      setMetaTags(overrideTitle, getOverrideDescription() || s.site_description || '')
      return
    }

    let sectionName = SECTION_NAMES[storePage] || storePage
    let metaPrefix = SECTION_TO_META_PREFIX[storePage] || ''

    if (storePage === 'home') {
      sectionName = slogan || siteName
      metaPrefix = ''
    } else if (storePage === 'product-detail') {
      sectionName = pageParams.name || 'Product'
      metaPrefix = ''
    } else if (storePage === 'blog-detail') {
      sectionName = pageParams.title || 'Blog Post'
      metaPrefix = ''
    } else if (storePage === 'page') {
      sectionName = pageParams.title || 'Page'
      metaPrefix = ''
    }

    const metaTitleKey = metaPrefix ? `${metaPrefix}_title` : ''
    const metaDescKey = metaPrefix ? `${metaPrefix}_description` : ''
    const metaTitle = (metaPrefix ? (s[metaTitleKey] || '') : '') || `${siteName} - ${sectionName}`
    const metaDesc = (metaPrefix ? (s[metaDescKey] || '') : '') || s.seo_meta_description || s.site_description || ''
    const keywords = s.seo_meta_keywords || ''

    setMetaTags(metaTitle, metaDesc, keywords)
  }, [storePage, adminPage, viewMode, pageParams])

  useEffect(() => {
    fetchSettingsOnce().then(() => {
      updateMeta()
    })
  }, [storePage, adminPage, viewMode, pageParams, updateMeta])
}
