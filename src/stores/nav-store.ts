import { create } from 'zustand'
import { pageToUrl, adminPageToUrl } from '@/lib/route-map'

export type StorePage = 
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'wishlist'
  | 'auth'
  | 'account'
  | 'account-orders'
  | 'account-addresses'
  | 'account-reviews'
  | 'search'
  | 'blog'
  | 'blog-detail'
  | 'page'
  | 'order-detail'
  | 'order-tracking'
  | 'compare'
  | 'contact'
  | 'faq'
  | 'deals'
  | 'shipping'
  | 'about'
  | 'gift-cards'
  | 'return-request'

export type AdminPage =
  | 'dashboard'
  | 'analytics'
  | 'products'
  | 'add-product'
  | 'edit-product'
  | 'categories'
  | 'brands'
  | 'orders'
  | 'order-detail'
  | 'customers'
  | 'reviews'
  | 'coupons'
  | 'flash-sales'
  | 'banners'
  | 'blog'
  | 'pages'
  | 'newsletter'
  | 'settings'
  | 'inventory'
  | 'audit-logs'
  | 'customer-detail'
  | 'media'

interface NavState {
  // View mode: 'store' for customer, 'admin' for dashboard
  viewMode: 'store' | 'admin'
  // Current page in store view
  storePage: StorePage
  // Current page in admin view
  adminPage: AdminPage
  // Page params (e.g., product slug, order id)
  pageParams: Record<string, string>
  // Search query
  searchQuery: string
  // Navigation history
  history: Array<{ page: StorePage | AdminPage; params: Record<string, string>; mode: 'store' | 'admin' }>

  // Actions
  navigateStore: (page: StorePage, params?: Record<string, string>) => void
  navigateAdmin: (page: AdminPage, params?: Record<string, string>) => void
  setSearchQuery: (query: string) => void
  goBack: () => void
}

export const useNavStore = create<NavState>((set, get) => ({
  viewMode: 'store',
  storePage: 'home',
  adminPage: 'dashboard',
  pageParams: {},
  searchQuery: '',
  history: [],

  navigateStore: (page, params = {}) => {
    const state = get()
    set({
      storePage: page,
      pageParams: params,
      viewMode: 'store',
      history: [...state.history, { page: state.storePage, params: state.pageParams, mode: 'store' }],
    })
    window.scrollTo(0, 0)
    if (typeof window !== 'undefined') {
      const url = pageToUrl(page, params)
      window.history.pushState({ page, params }, '', url)
    }
  },

  navigateAdmin: (page, params = {}) => {
    const state = get()
    set({
      adminPage: page,
      pageParams: params,
      history: [...state.history, { page: state.adminPage, params: state.pageParams, mode: 'admin' }],
    })
    window.scrollTo(0, 0)
    if (typeof window !== 'undefined') {
      const url = adminPageToUrl(page, params)
      window.history.pushState({ page, params, mode: 'admin' }, '', url)
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  goBack: () => {
    const state = get()
    if (state.history.length > 0) {
      const last = state.history[state.history.length - 1]
      set({
        viewMode: last.mode,
        ...(last.mode === 'store' ? { storePage: last.page as StorePage } : { adminPage: last.page as AdminPage }),
        pageParams: last.params,
        history: state.history.slice(0, -1),
      })
    }
  },
}))

// Expose to window for debugging
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__navStore = useNavStore
}
