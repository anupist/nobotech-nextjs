'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GiftCard {
  code: string
  balance: number
  originalBalance: number
}

interface GiftCardState {
  balance: number
  code: string
  isActive: boolean
  redeemedCards: GiftCard[]

  redeemCard: (code: string) => { success: boolean; message: string }
  checkBalance: (code: string) => { balance: number | null; message: string }
  applyToCart: (amount: number) => { success: boolean; message: string; applied: number }
}

// Demo gift card data
const DEMO_CARDS: Record<string, number> = {
  GIFT50: 50,
  GIFT100: 100,
}

export const useGiftCardStore = create<GiftCardState>()(
  persist(
    (set, get) => ({
      balance: 0,
      code: '',
      isActive: false,
      redeemedCards: [],

      redeemCard: (inputCode: string) => {
        const upperCode = inputCode.trim().toUpperCase()

        // Check if already redeemed
        const state = get()
        if (state.redeemedCards.find((c) => c.code === upperCode)) {
          // Reactivate the already-redeemed card
          const card = state.redeemedCards.find((c) => c.code === upperCode)!
          set({
            balance: card.balance,
            code: card.code,
            isActive: true,
          })
          return { success: true, message: `Gift card reactivated! Balance: $${card.balance.toFixed(2)}` }
        }

        // Check demo cards
        const cardValue = DEMO_CARDS[upperCode]
        if (cardValue) {
          const newCard: GiftCard = {
            code: upperCode,
            balance: cardValue,
            originalBalance: cardValue,
          }
          set({
            balance: cardValue,
            code: upperCode,
            isActive: true,
            redeemedCards: [...state.redeemedCards, newCard],
          })
          return { success: true, message: `Gift card redeemed! Balance: $${cardValue.toFixed(2)}` }
        }

        return { success: false, message: 'Invalid gift card code' }
      },

      checkBalance: (inputCode: string) => {
        const upperCode = inputCode.trim().toUpperCase()

        // Check active card
        const state = get()
        if (state.code === upperCode && state.isActive) {
          return { balance: state.balance, message: `Current balance: $${state.balance.toFixed(2)}` }
        }

        // Check redeemed cards
        const card = state.redeemedCards.find((c) => c.code === upperCode)
        if (card) {
          return { balance: card.balance, message: `Card balance: $${card.balance.toFixed(2)}` }
        }

        // Check demo cards
        const cardValue = DEMO_CARDS[upperCode]
        if (cardValue) {
          return { balance: cardValue, message: `Card available! Value: $${cardValue.toFixed(2)}` }
        }

        return { balance: null, message: 'Invalid gift card code' }
      },

      applyToCart: (amount: number) => {
        const state = get()
        if (!state.isActive || state.balance <= 0) {
          return { success: false, message: 'No active gift card', applied: 0 }
        }

        const applied = Math.min(amount, state.balance)
        const newBalance = state.balance - applied

        // Update the redeemed cards array too
        const updatedCards = state.redeemedCards.map((c) =>
          c.code === state.code ? { ...c, balance: newBalance } : c
        )

        set({
          balance: newBalance,
          isActive: newBalance > 0,
          redeemedCards: updatedCards,
        })

        return {
          success: true,
          message: `$${applied.toFixed(2)} applied from gift card`,
          applied,
        }
      },
    }),
    {
      name: 'shophub-gift-card',
    }
  )
)
