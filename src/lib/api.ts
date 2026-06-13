const BASE_URL = '/api'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.error || 'API request failed')
    }
    return data as T
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('Network error')
  }
}

export interface ProductListResponse {
  success: boolean
  data: Product[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description?: string
  specifications?: string
  features?: string
  sellingPrice: number
  costPrice: number
  discountPrice?: number | null
  thumbnail?: string | null
  gallery?: string | null
  status: string
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  totalSold: number
  averageRating: number
  reviewCount: number
  categoryId?: string | null
  brandId?: string | null
  createdAt: string
  updatedAt: string
  category?: { id: string; name: string; slug: string } | null
  brand?: { id: string; name: string; slug: string } | null
  inventory?: { quantity: number; lowStockAlert: number } | null
  variants?: ProductVariant[]
  images?: ProductImage[]
  reviews?: Review[]
  _count?: { reviews: number; wishlistItems: number }
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  discountPrice?: number | null
  thumbnail?: string | null
  isActive: boolean
  attributeValues?: {
    id: string
    attributeValue: {
      id: string
      value: string
      meta?: string | null
      attribute: { id: string; name: string; slug: string }
    }
  }[]
  inventory?: { quantity: number; lowStockAlert: number } | null
}

export interface ProductImage {
  id: string
  url: string
  alt?: string | null
  sortOrder: number
  variantId?: string | null
}

export interface AttributeValue {
  id: string
  value: string
  meta?: string | null
}

export interface Attribute {
  id: string
  name: string
  slug: string
  type: string
  values: AttributeValue[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  parentId?: string | null
  sortOrder: number
  isActive: boolean
  children?: Category[]
  _count?: { products: number }
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string | null
  description?: string | null
  isActive: boolean
  _count?: { products: number }
}

export interface Banner {
  id: string
  title: string
  image: string
  link?: string | null
  position: string
  sortOrder: number
  isActive: boolean
}

export interface Review {
  id: string
  rating: number
  title?: string | null
  comment?: string | null
  images?: string | null
  status: string
  createdAt: string
  customer?: {
    id: string
    user: { name: string; avatar?: string | null }
  }
}

export interface CouponData {
  id: string
  code: string
  type: string
  value: number
  minPurchase: number
  maxDiscount?: number | null
  discountAmount: number
}

export interface OrderData {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paymentMethod?: string | null
  paymentStatus: string
  shippingAddress?: string | null
  billingAddress?: string | null
  shippingMethod?: string | null
  createdAt: string
  items: OrderItemData[]
}

export interface OrderItemData {
  id: string
  productId: string
  variantId?: string | null
  productName: string
  variantName?: string | null
  sku: string
  price: number
  quantity: number
  total: number
  product?: { id: string; name: string; thumbnail?: string | null }
}

export async function fetchProducts(params: Record<string, string> = {}): Promise<ProductListResponse> {
  const query = new URLSearchParams(params).toString()
  return fetchApi(`/products${query ? `?${query}` : ''}`)
}

export async function fetchProduct(id: string): Promise<{ success: boolean; data: Product }> {
  return fetchApi(`/products/${id}`)
}

export async function fetchCategories(): Promise<{ success: boolean; data: Category[] }> {
  return fetchApi('/categories')
}

export async function fetchBrands(): Promise<{ success: boolean; data: Brand[] }> {
  return fetchApi('/brands')
}

export async function fetchBanners(position?: string): Promise<{ success: boolean; data: Banner[] }> {
  const query = position ? `?position=${position}` : ''
  return fetchApi(`/banners${query}`)
}

export async function fetchAttributes(): Promise<{ success: boolean; data: Attribute[] }> {
  return fetchApi('/admin/attributes')
}

export async function fetchSettings(): Promise<{ success: boolean; data: Record<string, string> }> {
  return fetchApi('/settings')
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ success: boolean; data: CouponData }> {
  return fetchApi('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  })
}

export async function createOrder(orderData: Record<string, unknown>): Promise<{ success: boolean; data: OrderData }> {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

export async function submitReview(data: Record<string, unknown>): Promise<{ success: boolean; data: Review }> {
  return fetchApi('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; data: { message: string } }> {
  return fetchApi('/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function getDiscountPercentage(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100)
}
