'use client'

import { useEffect } from 'react'
import { useNavStore, type StorePage } from '@/stores/nav-store'
import { StoreHeader } from './store-header'
import { StoreFooter } from './store-footer'
import { CartSidebar } from './cart-sidebar'
import { HomePage } from './home-page'
import { ProductListPage } from './product-list-page'
import { ProductDetailPage } from './product-detail-page'
import { CartPage } from './cart-page'
import { CheckoutPage } from './checkout-page'
import { AuthPage } from './auth-page'
import { AccountPage } from './account-page'
import { WishlistPage } from './wishlist-page'
import { SearchPage } from './search-page'
import { CustomerOrderDetailPage } from './order-detail-page'
import { BackToTop } from '@/components/shared/back-to-top'
import { OrderTrackingPage } from './order-tracking-page'
import { ProductComparePage } from './product-compare-page'
import { ChatWidget } from './chat-widget'
import { BlogPage } from './blog-page'
import { BlogDetailPage } from './blog-detail-page'
import { ContactPage } from './contact-page'
import { FAQPage } from './faq-page'
import { GiftCardPage } from './gift-card-page'
import { DealsPage } from './deals-page'
import { ShippingPage } from './shipping-page'
import { AboutPage } from './about-page'
import { CookieConsent } from './cookie-consent'
import { PWAInstallPrompt } from './pwa-install-prompt'
import { OfflineIndicator } from './offline-indicator'
import { PromoBar } from './promo-bar'
import { KeyboardShortcuts } from '@/components/shared/keyboard-shortcuts'
import { SocialProof } from './social-proof'
import { NewsletterPopup } from './newsletter-popup'
import { ReturnRequestPage } from './return-request-page'
import { motion, AnimatePresence } from 'framer-motion'

const pageComponents: Record<StorePage, React.ComponentType> = {
  home: HomePage,
  products: ProductListPage,
  'product-detail': ProductDetailPage,
  cart: CartPage,
  checkout: CheckoutPage,
  wishlist: WishlistPage,
  auth: AuthPage,
  account: AccountPage,
  'account-orders': AccountPage,
  'account-addresses': AccountPage,
  'account-reviews': AccountPage,
  search: SearchPage,
  blog: BlogPage,
  'blog-detail': BlogDetailPage,
  page: HomePage,
  'order-detail': CustomerOrderDetailPage,
  'order-tracking': OrderTrackingPage,
  compare: ProductComparePage,
  contact: ContactPage,
  faq: FAQPage,
  'gift-cards': GiftCardPage,
  deals: DealsPage,
  shipping: ShippingPage,
  about: AboutPage,
  'return-request': ReturnRequestPage,
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export function StoreApp() {
  const storePage = useNavStore((s) => s.storePage)

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed, likely in development
      })
    }
  }, [])

  const PageComponent = pageComponents[storePage] || HomePage

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PromoBar />
      <StoreHeader />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={storePage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <StoreFooter />
      <CartSidebar />
      <ChatWidget />
      <SocialProof />
      <NewsletterPopup />
      <BackToTop />
      <KeyboardShortcuts />
      <CookieConsent />
      <PWAInstallPrompt />
      <OfflineIndicator />
    </div>
  )
}
