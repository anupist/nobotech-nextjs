'use client'

import { useState, useCallback } from 'react'
import { useNavStore } from '@/stores/nav-store'
import { useGiftCardStore } from '@/stores/gift-card-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Gift,
  CreditCard,
  Check,
  Search,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { BreadcrumbNav } from '@/components/shared/breadcrumb-nav'

const giftCardOptions = [
  { amount: 25, label: '$25', gradient: 'from-emerald-400 to-teal-500', description: 'Perfect for small treats' },
  { amount: 50, label: '$50', gradient: 'from-teal-400 to-cyan-500', description: 'Great for gifts' },
  { amount: 75, label: '$75', gradient: 'from-cyan-400 to-emerald-500', description: 'Something special' },
  { amount: 100, label: '$100', gradient: 'from-emerald-500 to-teal-600', description: 'The ultimate gift' },
]

export function GiftCardPage() {
  const navigateStore = useNavStore((s) => s.navigateStore)
  const { balance, code, isActive, redeemCard, checkBalance } = useGiftCardStore()

  const [cardCode, setCardCode] = useState('')
  const [balanceResult, setBalanceResult] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const handleCheckBalance = useCallback(() => {
    if (!cardCode.trim()) {
      toast.error('Please enter a gift card code')
      return
    }
    setChecking(true)
    setTimeout(() => {
      const result = checkBalance(cardCode)
      setBalanceResult(result.message)
      setChecking(false)
    }, 500)
  }, [cardCode, checkBalance])

  const handleRedeem = useCallback(() => {
    if (!cardCode.trim()) {
      toast.error('Please enter a gift card code')
      return
    }
    const result = redeemCard(cardCode)
    if (result.success) {
      toast.success(result.message)
      setCardCode('')
      setBalanceResult(null)
    } else {
      toast.error(result.message)
    }
  }, [cardCode, redeemCard])

  const handleAddToCart = useCallback((amount: number) => {
    toast.success(`$${amount} Gift Card added to cart!`)
  }, [])

  return (
    <div className="container mx-auto px-4 py-6">
      <BreadcrumbNav items={[{ label: 'Gift Cards' }]} />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 md:p-12 mb-8 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gift className="h-20 w-20 md:h-24 md:w-24 drop-shadow-lg" />
            </motion.div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Gift Cards</h1>
            <p className="text-emerald-100 text-lg max-w-xl">
              Give the perfect gift! ShopHub gift cards let your loved ones choose exactly what they want.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Active Balance Display */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Gift Card Balance</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${balance.toFixed(2)}
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">
                        {code}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => navigateStore('cart')}
                >
                  Use at Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Redeem a Gift Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Redeem a Gift Card</h2>
                  <p className="text-sm text-muted-foreground">Enter your code to check balance or apply</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Enter gift card code (e.g., GIFT50)"
                    value={cardCode}
                    onChange={(e) => {
                      setCardCode(e.target.value.toUpperCase())
                      setBalanceResult(null)
                    }}
                    className="h-12 text-lg tracking-wider font-mono pl-4 pr-10 border-emerald-200 focus:border-emerald-500 dark:border-emerald-800 dark:focus:border-emerald-600"
                  />
                  {cardCode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-10 w-10"
                      onClick={() => {
                        setCardCode('')
                        setBalanceResult(null)
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>

                {/* Demo codes hint */}
                <p className="text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 inline text-emerald-500 mr-1" />
                  Try demo codes: <span className="font-mono font-medium">GIFT50</span> or <span className="font-mono font-medium">GIFT100</span>
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
                    onClick={handleCheckBalance}
                    disabled={checking || !cardCode.trim()}
                  >
                    {checking ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        Checking...
                      </span>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Check Balance
                      </>
                    )}
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleRedeem}
                    disabled={!cardCode.trim()}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Apply to Account
                  </Button>
                </div>

                {/* Balance Result */}
                <AnimatePresence>
                  {balanceResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800"
                    >
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {balanceResult}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchase Gift Cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-md">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Purchase Gift Cards</h2>
                  <p className="text-sm text-muted-foreground">Choose an amount for that perfect gift</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {giftCardOptions.map((option, idx) => (
                  <motion.div
                    key={option.amount}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${option.gradient} p-5 text-white shadow-lg cursor-pointer group`}>
                      {/* Decorative circles */}
                      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
                      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

                      <div className="relative z-10">
                        <Gift className="h-5 w-5 mb-2 opacity-80" />
                        <p className="text-3xl font-bold mb-1">{option.label}</p>
                        <p className="text-xs opacity-80 mb-3">{option.description}</p>
                        <Button
                          size="sm"
                          className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(option.amount)
                          }}
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Gift cards are delivered by email and contain instructions to redeem at checkout.
                  No additional processing fees. No expiration date.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
