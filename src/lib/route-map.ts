import type { StorePage } from '@/stores/nav-store'

export function pageToUrl(page: StorePage, params: Record<string, string>): string {
  switch (page) {
    case 'home':
      return '/'
    case 'products':
      return '/products'
    case 'product-detail':
      return `/products/${params.slug || ''}`
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

  // Product routes
  if (main === 'products') {
    return rest.length > 0
      ? { page: 'product-detail', params: { slug: rest[0] } }
      : { page: 'products', params: {} }
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
