import type { StorePage, AdminPage } from '@/stores/nav-store'

export function pageToUrl(page: StorePage, params: Record<string, string>): string {
  switch (page) {
    case 'home':
      return '/'
    case 'products': {
      // Pure category view → clean /category/{slug} URL
      if (params.category && !params.brand && !params.featured && !params.newArrival && !params.bestSeller && !params.sort) {
        return `/category/${params.category}`
      }
      const qp = new URLSearchParams()
      if (params.category) qp.set('category', params.category)
      if (params.brand) qp.set('brand', params.brand)
      if (params.featured) qp.set('featured', params.featured)
      if (params.newArrival) qp.set('newArrival', params.newArrival)
      if (params.bestSeller) qp.set('bestSeller', params.bestSeller)
      if (params.sort) qp.set('sort', params.sort)
      const qs = qp.toString()
      return qs ? `/products?${qs}` : '/products'
    }
    case 'product-detail':
      return `/product/${params.slug || params.id || ''}`
    case 'cart':
      return '/cart'
    case 'checkout':
      return '/checkout'
    case 'wishlist':
      return '/wishlist'
    case 'auth':
      return '/auth'
    case 'account':
      return '/account'
    case 'account-orders':
      return '/account/orders'
    case 'account-addresses':
      return '/account/addresses'
    case 'account-reviews':
      return '/account/reviews'
    case 'search': {
      const q = params.query || ''
      return q ? `/search?q=${encodeURIComponent(q)}` : '/search'
    }
    case 'blog':
      return '/blog'
    case 'blog-detail':
      return `/blog/${params.slug || ''}`
    case 'page':
      return `/page/${params.slug || ''}`
    case 'order-detail':
      return `/orders/${params.id || ''}`
    case 'order-tracking':
      return `/orders/${params.id || ''}/tracking`
    case 'compare':
      return '/compare'
    case 'contact':
      return '/contact'
    case 'faq':
      return '/faq'
    case 'deals':
      return '/deals'
    case 'shipping':
      return '/shipping'
    case 'about':
      return '/about'
    case 'gift-cards':
      return '/gift-cards'
    case 'return-request':
      return '/return-request'
    default:
      return '/'
  }
}

export function urlToPage(pathname: string, searchParams: URLSearchParams): { page: StorePage; params: Record<string, string> } {
  const segments = pathname.replace(/^\/+/, '').split('/').filter(Boolean)

  // Backward compat: /?page=X&slug=Y — check BEFORE segments check
  // so /?page=product-detail&slug=X still works
  if (searchParams.has('page')) {
    const page = searchParams.get('page') as StorePage
    const params: Record<string, string> = {}
    for (const key of ['id', 'slug', 'query']) {
      const val = searchParams.get(key)
      if (val) params[key] = val
    }
    return { page, params }
  }

  if (segments.length === 0) {
    return { page: 'home', params: {} }
  }

  const [main, ...rest] = segments

  // Category route: /category/{slug} → products with category filter
  if (main === 'category' && rest.length > 0) {
    return { page: 'products', params: { category: rest[0] } }
  }

  // Product routes — support both /product/{slug} and /products/...
  if (main === 'product' || main === 'products') {
    if (rest.length > 0) {
      return { page: 'product-detail', params: { slug: rest[0] } }
    }
    // Parse filter query params
    const params: Record<string, string> = {}
    for (const key of ['category', 'brand', 'featured', 'newArrival', 'bestSeller', 'sort']) {
      const val = searchParams.get(key)
      if (val) params[key] = val
    }
    return { page: 'products', params }
  }

  // Account routes
  if (main === 'account') {
    const sub = rest[0]
    if (sub === 'orders') return { page: 'account-orders', params: {} }
    if (sub === 'addresses') return { page: 'account-addresses', params: {} }
    if (sub === 'reviews') return { page: 'account-reviews', params: {} }
    return { page: 'account', params: {} }
  }

  // Order routes
  if (main === 'orders') {
    if (rest.length > 0) {
      if (rest[1] === 'tracking') return { page: 'order-tracking', params: { id: rest[0] } }
      return { page: 'order-detail', params: { id: rest[0] } }
    }
    return { page: 'order-detail', params: {} }
  }

  // Blog routes
  if (main === 'blog') {
    return rest.length > 0
      ? { page: 'blog-detail', params: { slug: rest[0] } }
      : { page: 'blog', params: {} }
  }

  // Search route
  if (main === 'search') {
    return { page: 'search', params: { query: searchParams.get('q') || '' } }
  }

  // Page route for static pages
  if (main === 'page' && rest.length > 0) {
    return { page: 'page', params: { slug: rest[0] } }
  }

  // Direct page mapping
  const directMap: Record<string, StorePage> = {
    cart: 'cart',
    checkout: 'checkout',
    wishlist: 'wishlist',
    auth: 'auth',
    compare: 'compare',
    contact: 'contact',
    faq: 'faq',
    deals: 'deals',
    shipping: 'shipping',
    about: 'about',
    'gift-cards': 'gift-cards',
    'return-request': 'return-request',
    'return-requests': 'return-request',
  }

  if (directMap[main]) {
    return { page: directMap[main], params: {} }
  }

  // Fallback: treat unknown path as a static page
  return { page: 'page', params: { slug: segments.join('/') } }
}

export function adminPageToUrl(page: AdminPage, params: Record<string, string>): string {
  switch (page) {
    case 'dashboard':
      return '/admin'
    case 'analytics':
      return '/admin/analytics'
    case 'products':
      return '/admin/products'
    case 'add-product':
      return '/admin/products/new'
    case 'edit-product':
      return `/admin/products/${params.id || ''}/edit`
    case 'categories':
      return '/admin/categories'
    case 'brands':
      return '/admin/brands'
    case 'orders':
      return '/admin/orders'
    case 'order-detail':
      return `/admin/orders/${params.id || ''}`
    case 'customers':
      return '/admin/customers'
    case 'customer-detail':
      return `/admin/customers/${params.id || ''}`
    case 'reviews':
      return '/admin/reviews'
    case 'coupons':
      return '/admin/coupons'
    case 'flash-sales':
      return '/admin/flash-sales'
    case 'banners':
      return '/admin/banners'
    case 'blog':
      return '/admin/blog'
    case 'pages':
      return '/admin/pages'
    case 'newsletter':
      return '/admin/newsletter'
    case 'settings':
      return '/admin/settings'
    case 'inventory':
      return '/admin/inventory'
    case 'audit-logs':
      return '/admin/audit-logs'
    case 'media':
      return '/admin/media'
    default:
      return '/admin'
  }
}

export function adminUrlToPage(pathname: string): { page: AdminPage; params: Record<string, string> } {
  const segments = pathname.replace(/^\/+/, '').split('/').filter(Boolean)

  // Remove 'admin' prefix if present
  if (segments[0] === 'admin') segments.shift()

  if (segments.length === 0) {
    return { page: 'dashboard', params: {} }
  }

  const [main, ...rest] = segments

  const map: Record<string, AdminPage> = {
    analytics: 'analytics',
    products: 'products',
    categories: 'categories',
    brands: 'brands',
    orders: 'orders',
    customers: 'customers',
    reviews: 'reviews',
    coupons: 'coupons',
    'flash-sales': 'flash-sales',
    banners: 'banners',
    blog: 'blog',
    pages: 'pages',
    newsletter: 'newsletter',
    settings: 'settings',
    inventory: 'inventory',
    'audit-logs': 'audit-logs',
    media: 'media',
  }

  // Handle /admin/products/new → add-product
  if (main === 'products' && rest[0] === 'new') {
    return { page: 'add-product', params: {} }
  }

  // Handle /admin/products/:id/edit → edit-product
  if (main === 'products' && rest.length >= 2 && rest[1] === 'edit') {
    return { page: 'edit-product', params: { id: rest[0] } }
  }

  // Handle /admin/orders/:id → order-detail
  if (main === 'orders' && rest.length > 0) {
    return { page: 'order-detail', params: { id: rest[0] } }
  }

  // Handle /admin/customers/:id → customer-detail
  if (main === 'customers' && rest.length > 0) {
    return { page: 'customer-detail', params: { id: rest[0] } }
  }

  if (map[main]) {
    return { page: map[main], params: {} }
  }

  return { page: 'dashboard', params: {} }
}
