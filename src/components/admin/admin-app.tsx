'use client'

import { useState, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { usePageMeta } from '@/hooks/use-page-meta'
import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'
import { DashboardPage } from './dashboard-page'
import { AnalyticsPage } from './analytics-page'
import { ProductsPage } from './products-page'
import { ProductFormPage } from './product-form-page'
import { CategoriesPage } from './categories-page'
import { BrandsPage } from './brands-page'
import { OrdersPage } from './orders-page'
import { OrderDetailPage } from './order-detail-page'
import { CustomersPage } from './customers-page'
import { CouponsPage } from './coupons-page'
import { BannersPage } from './banners-page'
import { SettingsPage } from './settings-page'
import { InventoryPage } from './inventory-page'
import { ReviewsPage } from './reviews-page'
import { BlogPage } from './blog-page'
import { PagesPage } from './pages-page'
import { NewsletterPage } from './newsletter-page'
import { AuditLogsPage } from './audit-logs-page'
import { FlashSalesPage } from './flash-sales-page'
import { CustomerDetailPage } from './customer-detail-page'
import { MediaPage } from './media-page'
import { TestimonialsPage } from './testimonials-page'
import { AnnouncementsPage } from './announcements-page'
import { NavigationPage } from './navigation-page'
import { FooterWidgetsPage } from './footer-widgets-page'
import { FeaturesPage } from './features-page'
import { PaymentMethodsPage } from './payment-methods-page'
import { FAQPage } from './faq-page'
import { AboutSectionsPage } from './about-sections-page'
import { Sheet, SheetContent } from '@/components/ui/sheet'

export function AdminApp() {
  const adminPage = useNavStore((s) => s.adminPage)
  usePageMeta()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const renderPage = () => {
    switch (adminPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'products':
        return <ProductsPage />
      case 'add-product':
        return <ProductFormPage />
      case 'edit-product':
        return <ProductFormPage />
      case 'categories':
        return <CategoriesPage />
      case 'brands':
        return <BrandsPage />
      case 'orders':
        return <OrdersPage />
      case 'order-detail':
        return <OrderDetailPage />
      case 'customers':
        return <CustomersPage />
      case 'coupons':
        return <CouponsPage />
      case 'banners':
        return <BannersPage />
      case 'settings':
        return <SettingsPage />
      case 'inventory':
        return <InventoryPage />
      case 'reviews':
        return <ReviewsPage />
      case 'blog':
        return <BlogPage />
      case 'pages':
        return <PagesPage />
      case 'newsletter':
        return <NewsletterPage />
      case 'audit-logs':
        return <AuditLogsPage />
      case 'flash-sales':
        return <FlashSalesPage />
      case 'customer-detail':
        return <CustomerDetailPage />
      case 'media':
        return <MediaPage />
      case 'testimonials':
        return <TestimonialsPage />
      case 'announcements':
        return <AnnouncementsPage />
      case 'navigation':
        return <NavigationPage />
      case 'footer-widgets':
        return <FooterWidgetsPage />
      case 'features':
        return <FeaturesPage />
      case 'payment-methods':
        return <PaymentMethodsPage />
      case 'faq':
        return <FAQPage />
      case 'about-sections':
        return <AboutSectionsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[300px] bg-slate-900">
          <AdminSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <AdminHeader onMobileMenuToggle={toggleMobileMenu} />
        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
