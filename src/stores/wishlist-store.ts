import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  items: string[] // product IDs
  loading: boolean

  // Actions
  isWishlisted: (productId: string) => boolean
  toggleWishlist: (productId: string, userId?: string) => void
  fetchWishlist: (userId: string) => Promise<void>
  setItems: (items: string[]) => void
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      isWishlisted: (productId: string) => {
        return get().items.includes(productId)
      },

      toggleWishlist: async (productId: string, userId?: string) => {
        const currentItems = get().items
        const isCurrentlyWishlisted = currentItems.includes(productId)

        // Optimistic update
        if (isCurrentlyWishlisted) {
          set({ items: currentItems.filter((id) => id !== productId) })
        } else {
          set({ items: [...currentItems, productId] })
        }

        // Sync with API if userId is provided
        if (userId) {
          try {
            if (isCurrentlyWishlisted) {
              await fetch('/api/wishlist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId }),
              })
            } else {
              await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId }),
              })
            }
          } catch (error) {
            // Revert on error
            console.error('Wishlist sync failed:', error)
            set({ items: currentItems })
          }
        }
      },

      fetchWishlist: async (userId: string) => {
        set({ loading: true })
        try {
          const res = await fetch(`/api/wishlist?userId=${userId}`)
          const data = await res.json()
          if (data.success) {
            const productIds = data.data.map(
              (item: { productId: string }) => item.productId
            )
            set({ items: productIds, loading: false })
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('Failed to fetch wishlist:', error)
          set({ loading: false })
        }
      },

      setItems: (items: string[]) => set({ items }),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)

// Expose to window for debugging
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__wishlistStore = useWishlistStore
}
