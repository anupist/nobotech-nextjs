import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentlyViewedItem {
  id: string
  name: string
  slug: string
  thumbnail: string
  price: number
  discountPrice?: number | null
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[]
  addItem: (item: RecentlyViewedItem) => void
  clearAll: () => void
  getItems: () => RecentlyViewedItem[]
}

const MAX_ITEMS = 10

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items.filter((i) => i.id !== item.id)
        set({ items: [item, ...items].slice(0, MAX_ITEMS) })
      },

      clearAll: () => set({ items: [] }),

      getItems: () => get().items,
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
)
