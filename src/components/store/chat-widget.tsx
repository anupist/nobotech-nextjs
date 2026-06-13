'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Bot, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { label: 'Find products', message: 'Help me find products on ShopHub' },
  { label: 'Track order', message: 'How can I track my order?' },
  { label: 'Shipping info', message: 'What are your shipping options and delivery times?' },
  { label: 'Returns policy', message: 'What is your returns and refund policy?' },
]

function generateSessionId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId()
  const stored = localStorage.getItem('shopbot-session-id')
  if (stored) return stored
  const newId = generateSessionId()
  localStorage.setItem('shopbot-session-id', newId)
  return newId
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="flex items-center gap-2 max-w-[80%]">
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl rounded-bl-sm">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize session ID on mount
  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  // Add welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && !hasShownWelcome) {
      setHasShownWelcome(true)
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm ShopBot, your AI shopping assistant. How can I help you today?",
        },
      ])
    }
  }, [isOpen, hasShownWelcome])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages, isLoading])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim(), sessionId }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Failed to get response')
        }

        // Update session ID if server returned a new one
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId)
          localStorage.setItem('shopbot-session-id', data.sessionId)
        }

        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.response,
        }

        setMessages((prev) => [...prev, botMessage])
      } catch {
        toast.error('Failed to send message. Please try again.')
        // Remove the user message on error so they can retry
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      } finally {
        setIsLoading(false)
        inputRef.current?.focus()
      }
    },
    [isLoading, sessionId]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickAction = (message: string) => {
    sendMessage(message)
  }

  return (
    <>
      {/* Floating Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 group"
            aria-label="Open chat assistant"
          >
            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: 3,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
            >
              <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </motion.div>
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">1</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-[calc(100vw-3rem)] sm:w-[380px] sm:max-w-[380px] h-[500px] max-h-[calc(100dvh-3rem)] box-border bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">ShopBot AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                    <span className="text-[11px] text-emerald-100">Online</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
              <div className="space-y-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 mb-3 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-br-sm'
                          : 'bg-emerald-600 text-white rounded-2xl rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && <TypingIndicator />}

                {/* Quick Actions (show only when few messages) */}
                {messages.length <= 1 && !isLoading && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium px-1">
                      Quick actions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.message)}
                          className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 shrink-0 bg-white dark:bg-zinc-900">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 h-10 text-sm rounded-full border-zinc-300 dark:border-zinc-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center mt-1.5">
                Powered by AI · Responses may not always be accurate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
