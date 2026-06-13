'use client'

import { useNavStore, type StorePage } from '@/stores/nav-store'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home, ChevronRight } from 'lucide-react'
import { useMemo, Fragment } from 'react'

interface BreadcrumbItemData {
  label: string
  page?: StorePage
  params?: Record<string, string>
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItemData[]
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const storePage = useNavStore((s) => s.storePage)

  const breadcrumbs = useMemo(() => {
    if (items) return [{ label: 'Home', page: 'home' as StorePage }, ...items]

    const home = { label: 'Home', page: 'home' as StorePage }

    switch (storePage) {
      case 'home':
        return [home]
      case 'products':
        return [home, { label: 'Products', page: 'products' }]
      case 'product-detail':
        return [home, { label: 'Products', page: 'products' }, { label: 'Product Detail' }]
      case 'cart':
        return [home, { label: 'Cart', page: 'cart' }]
      case 'checkout':
        return [home, { label: 'Cart', page: 'cart' }, { label: 'Checkout' }]
      case 'wishlist':
        return [home, { label: 'Wishlist', page: 'wishlist' }]
      case 'auth':
        return [home, { label: 'Sign In' }]
      case 'account':
      case 'account-orders':
      case 'account-addresses':
      case 'account-reviews':
        return [home, { label: 'My Account', page: 'account' }]
      case 'search':
        return [home, { label: 'Search Results' }]
      case 'order-tracking':
        return [home, { label: 'Track Order', page: 'order-tracking' }]
      case 'order-detail':
        return [home, { label: 'My Orders', page: 'account' }, { label: 'Order Detail' }]
      case 'compare':
        return [home, { label: 'Compare Products', page: 'compare' }]
      case 'contact':
        return [home, { label: 'Contact Us', page: 'contact' }]
      case 'faq':
        return [home, { label: 'FAQ', page: 'faq' }]
      case 'deals':
        return [home, { label: 'Deals', page: 'deals' }]
      case 'shipping':
        return [home, { label: 'Shipping & Returns', page: 'shipping' }]
      case 'about':
        return [home, { label: 'About Us', page: 'about' }]
      case 'gift-cards':
        return [home, { label: 'Gift Cards', page: 'gift-cards' }]
      default:
        return [home]
    }
  }, [items, storePage])

  // JSON-LD structured data for SEO
  const jsonLd = useMemo(() => {
    if (typeof window === 'undefined') return null
    const itemList = breadcrumbs.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label === 'Home' ? 'Home' : item.label,
      item: item.page ? `${window.location.origin}/#/${item.page}` : undefined,
    }))
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: itemList,
    }
  }, [breadcrumbs])

  // Mobile: show only last 2 levels
  const mobileBreadcrumbs = useMemo(() => {
    if (breadcrumbs.length <= 2) return breadcrumbs
    return breadcrumbs.slice(-2)
  }, [breadcrumbs])

  return (
    <>
      {/* JSON-LD structured data — template avoids React script warning */}
      {jsonLd && (
        <template
          id="breadcrumb-jsonld"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <Breadcrumb className="mb-4">
        {/* Desktop: full breadcrumb */}
        <BreadcrumbList className="hidden sm:flex">
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1

            return (
              <Fragment key={idx}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-emerald-700 font-medium relative group">
                      {item.label === 'Home' ? (
                        <span className="flex items-center gap-1.5">
                          <Home className="h-3.5 w-3.5" />
                          <span>Home</span>
                        </span>
                      ) : (
                        <span className="relative">
                          {/* "You are here" indicator */}
                          <span className="absolute -top-4 left-0 text-[9px] text-emerald-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            You are here
                          </span>
                          {item.label}
                          {/* Emerald underline slide-in on hover (for non-current pages) */}
                        </span>
                      )}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="cursor-pointer hover:text-emerald-600 transition-colors relative group/link"
                      onClick={() => {
                        if (item.page) {
                          navigateStore(item.page, item.params)
                        }
                      }}
                    >
                      {item.label === 'Home' ? (
                        <span className="flex items-center gap-1.5">
                          <Home className="h-3.5 w-3.5" />
                          <span>Home</span>
                        </span>
                      ) : (
                        <span className="relative">
                          {item.label}
                          {/* Emerald underline slide-in on hover */}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover/link:w-full transition-all duration-300" />
                        </span>
                      )}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            )
          })}
        </BreadcrumbList>

        {/* Mobile: condensed breadcrumb (last 2 levels) */}
        <BreadcrumbList className="flex sm:hidden">
          {mobileBreadcrumbs.map((item, idx) => {
            const isLast = idx === mobileBreadcrumbs.length - 1
            const isFirst = idx === 0 && breadcrumbs.length > 2

            return (
              <Fragment key={idx}>
                <BreadcrumbItem>
                  {isFirst && breadcrumbs.length > 2 ? (
                    <BreadcrumbLink
                      className="cursor-pointer hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs"
                      onClick={() => navigateStore('home')}
                    >
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      ...
                    </BreadcrumbLink>
                  ) : isLast ? (
                    <BreadcrumbPage className="text-emerald-700 font-medium text-xs relative group">
                      <span className="relative">
                        <span className="absolute -top-4 left-0 text-[8px] text-emerald-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          You are here
                        </span>
                        {item.label}
                      </span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="cursor-pointer hover:text-emerald-600 transition-colors text-xs relative group/link"
                      onClick={() => {
                        if (item.page) {
                          navigateStore(item.page, item.params)
                        }
                      }}
                    >
                      <span className="relative">
                        {item.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover/link:w-full transition-all duration-300" />
                      </span>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}
