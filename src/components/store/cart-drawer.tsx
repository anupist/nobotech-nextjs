'use client'

import { useCartStore } from '@/stores/cart-store'
import { useNavStore } from '@/stores/nav-store'
import { formatPrice } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'

export function CartDrawer() {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const setOpen = useCartStore((s) => s.setOpen)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const getTotal = useCartStore((s) => s.getTotal)
  const navigateStore = useNavStore((s) => s.navigateStore)

  const total = getTotal()

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent className="max-h-[85vh] flex flex-col overflow-hidden">
        <DrawerTitle className="sr-only">Shopping Cart</DrawerTitle>
        <div className="mx-auto w-full max-w-lg flex flex-col min-h-0 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Cart</h2>
              <span className="text-sm text-muted-foreground">({items.length})</span>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🛒</div>
              <p className="text-sm text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId || 'default'}`}
                      className="flex gap-3 p-2"
                    >
                      <img
                        src={item.thumbnail || `https://picsum.photos/seed/${item.productSlug}/80/80`}
                        alt={item.productName}
                        className="w-14 h-14 rounded object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-1">{item.productName}</h4>
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-semibold text-emerald-600">
                            {formatPrice((item.discountPrice || item.price) * item.quantity)}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1, item.variantId)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1, item.variantId)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => removeItem(item.productId, item.variantId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t space-y-3 shrink-0">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-emerald-600">{formatPrice(total)}</span>
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setOpen(false)
                    navigateStore('checkout')
                  }}
                >
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
