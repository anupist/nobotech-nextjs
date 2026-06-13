'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Share2,
  Facebook,
  Twitter,
  Link2,
  MessageCircle,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface SocialShareProps {
  productName: string
  productUrl?: string
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  )
}

const shareOptions = [
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-[#1877F2] hover:bg-[#166FE5]',
    textColor: 'text-white',
    getUrl: (url: string, text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    name: 'Twitter / X',
    icon: Twitter,
    color: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-white',
    getUrl: (url: string, text: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: 'Pinterest',
    icon: PinterestIcon,
    color: 'bg-[#E60023] hover:bg-[#CC001F]',
    textColor: 'text-white',
    getUrl: (url: string, text: string) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-[#25D366] hover:bg-[#22C55E]',
    textColor: 'text-white',
    getUrl: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text} - ${url}`)}`,
  },
]

export function SocialShare({ productName, productUrl }: SocialShareProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = productUrl || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = `Check out ${productName} on ShopHub!`

  const handleShare = useCallback((option: typeof shareOptions[number]) => {
    const url = option.getUrl(shareUrl, shareText)
    window.open(url, '_blank', 'width=600,height=400')
    setOpen(false)
  }, [shareUrl, shareText])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!', {
        description: 'Share it with your friends and family.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }, [shareUrl])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end" sideOffset={8}>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <p className="text-sm font-medium mb-3">Share this product</p>
              <div className="grid grid-cols-2 gap-2">
                {shareOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.name}
                      onClick={() => handleShare(option)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${option.color} ${option.textColor} hover:scale-[1.03] active:scale-[0.97]`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {option.name}
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 pt-2 border-t">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 transition-all duration-200 hover:scale-[1.01] active:scale-[0.97]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3.5 w-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}
