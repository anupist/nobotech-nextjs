import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareState {
  productIds: string[]
  addProduct: (id: string) => void
  removeProduct: (id: string) => void
  clearAll: () => void
  isInCompare: (id: string) => boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],

      addProduct: (id: string) => {
        const { productIds } = get()
        if (productIds.length >= 3) return
        if (productIds.includes(id)) return
        set({ productIds: [...productIds, id] })
      },

      removeProduct: (id: string) => {
        set({ productIds: get().productIds.filter((pid) => pid !== id) })
      },

      clearAll: () => {
        set({ productIds: [] })
      },

      isInCompare: (id: string) => {
        return get().productIds.includes(id)
      },
    }),
    {
      name: 'shophub-compare',
    }
  )
)
