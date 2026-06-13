import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  productName: string
  productSlug: string
  thumbnail: string
  variantId?: string
  variantName?: string
  sku: string
  price: number
  discountPrice?: number
  quantity: number
  stock: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Actions
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void

  // Computed
  getItemCount: () => number
  getSubtotal: () => number
  getDiscount: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (item) => {
        const items = get().items
        const existing = items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        )
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                : i
            ),
          })
        } else {
          set({ items: [...items, item] })
        }
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        })
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getDiscount: () =>
        get().items.reduce(
          (sum, i) => sum + ((i.discountPrice ? i.price - i.discountPrice : 0) * i.quantity),
          0
        ),
      getTotal: () =>
        get().items.reduce(
          (sum, i) => sum + ((i.discountPrice || i.price) * i.quantity),
          0
        ),
    }),
    {
      name: 'cart-storage',
    }
  )
)
