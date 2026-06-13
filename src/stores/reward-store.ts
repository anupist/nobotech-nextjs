import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RewardHistoryEntry {
  id: string
  points: number
  description: string
  date: string
  type: 'earned' | 'redeemed'
}

interface RewardState {
  points: number
  history: RewardHistoryEntry[]
  earnPoints: (amount: number, description: string) => void
  redeemPoints: (amount: number, description: string) => boolean
  getPoints: () => number
}

const demoHistory: RewardHistoryEntry[] = [
  {
    id: '1',
    points: 500,
    description: 'Purchase - Order #ORD-2024-001',
    date: '2025-01-15',
    type: 'earned',
  },
  {
    id: '2',
    points: 300,
    description: 'Purchase - Order #ORD-2024-003',
    date: '2025-01-20',
    type: 'earned',
  },
  {
    id: '3',
    points: 500,
    description: 'Redeemed - $5 off coupon',
    date: '2025-02-01',
    type: 'redeemed',
  },
  {
    id: '4',
    points: 750,
    description: 'Purchase - Order #ORD-2024-005',
    date: '2025-02-10',
    type: 'earned',
  },
  {
    id: '5',
    points: 200,
    description: 'Product review bonus',
    date: '2025-02-15',
    type: 'earned',
  },
  {
    id: '6',
    points: 1000,
    description: 'Redeemed - $10 off coupon',
    date: '2025-02-20',
    type: 'redeemed',
  },
  {
    id: '7',
    points: 450,
    description: 'Purchase - Order #ORD-2024-008',
    date: '2025-03-01',
    type: 'earned',
  },
  {
    id: '8',
    points: 250,
    description: 'Referral bonus - Friend signed up',
    date: '2025-03-05',
    type: 'earned',
  },
  {
    id: '9',
    points: 500,
    description: 'Redeemed - $5 off coupon',
    date: '2025-03-10',
    type: 'redeemed',
  },
  {
    id: '10',
    points: 500,
    description: 'Purchase - Order #ORD-2024-012',
    date: '2025-03-15',
    type: 'earned',
  },
]

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      points: 2450,
      history: demoHistory,

      earnPoints: (amount, description) => {
        const id = String(Date.now())
        const date = new Date().toISOString().split('T')[0]
        set((state) => ({
          points: state.points + amount,
          history: [
            { id, points: amount, description, date, type: 'earned' },
            ...state.history,
          ],
        }))
      },

      redeemPoints: (amount, description) => {
        const currentPoints = get().points
        if (currentPoints < amount) return false
        const id = String(Date.now())
        const date = new Date().toISOString().split('T')[0]
        set((state) => ({
          points: state.points - amount,
          history: [
            { id, points: amount, description, date, type: 'redeemed' },
            ...state.history,
          ],
        }))
        return true
      },

      getPoints: () => get().points,
    }),
    {
      name: 'shophub-rewards',
    }
  )
)
