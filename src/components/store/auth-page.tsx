'use client'

import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useNavStore } from '@/stores/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Truck,
  Tag,
  MapPin,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const formVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

const formTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
}

export function AuthPage() {
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const isLoading = useAuthStore((s) => s.isLoading)
  const navigateStore = useNavStore((s) => s.navigateStore)

  const [activeTab, setActiveTab] = useState('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({})
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)

  const validateLogin = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!loginEmail.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) errors.email = 'Invalid email format'
    if (!loginPassword.trim()) errors.password = 'Password is required'
    else if (loginPassword.length < 6) errors.password = 'Password must be at least 6 characters'
    setLoginErrors(errors)
    return Object.keys(errors).length === 0
  }, [loginEmail, loginPassword])

  const validateRegister = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!regName.trim()) errors.name = 'Name is required'
    if (!regEmail.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errors.email = 'Invalid email format'
    if (!regPassword.trim()) errors.password = 'Password is required'
    else if (regPassword.length < 6) errors.password = 'Password must be at least 6 characters'
    if (regPassword !== regConfirmPassword) errors.confirmPassword = 'Passwords do not match'
    setRegErrors(errors)
    return Object.keys(errors).length === 0
  }, [regName, regEmail, regPassword, regConfirmPassword])

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateLogin()) return
      const success = await login(loginEmail, loginPassword)
      if (success) {
        toast.success('Welcome back!')
        navigateStore('account')
      } else {
        toast.error('Invalid email or password')
      }
    },
    [loginEmail, loginPassword, login, validateLogin, navigateStore]
  )

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateRegister()) return
      const success = await register(regName, regEmail, regPassword, regPhone || undefined)
      if (success) {
        toast.success('Account created successfully!')
        navigateStore('account')
      } else {
        toast.error('Registration failed. Email may already be in use.')
      }
    },
    [regName, regEmail, regPassword, regPhone, register, validateRegister, navigateStore]
  )

  // Benefits list for the left panel
  const benefits = [
    { icon: Truck, title: 'Free Shipping', description: 'On orders over $50' },
    { icon: Tag, title: 'Exclusive Deals', description: 'Members-only discounts' },
    { icon: MapPin, title: 'Order Tracking', description: 'Real-time updates' },
    { icon: RotateCcw, title: 'Easy Returns', description: '30-day return policy' },
  ]

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl border">
          {/* Left Panel - Decorative / Benefits */}
          <motion.div
            className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-10 text-white relative overflow-hidden auth-pattern-bg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Decorative shapes */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute top-20 right-12 w-16 h-16 bg-white/5 rounded-full" />

            {/* Animated floating circles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="floating-circle-1 absolute top-[10%] right-[15%] w-20 h-20 border border-white/10 rounded-full" />
              <div className="floating-circle-2 absolute top-[60%] left-[10%] w-14 h-14 bg-white/5 rounded-full" />
              <div className="floating-circle-3 absolute bottom-[20%] right-[30%] w-10 h-10 border border-white/8 rotate-45" />
              <div className="floating-circle-1 absolute top-[35%] left-[25%] w-8 h-8 bg-emerald-300/10 rounded-full" style={{ animationDelay: '2s' }} />
              <div className="floating-circle-2 absolute bottom-[40%] right-[15%] w-16 h-16 border border-white/6 rounded-full" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="relative z-10">
              {/* Logo */}
              <button
                onClick={() => navigateStore('home')}
                className="inline-flex items-center gap-2 mb-10 group"
              >
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">
                  <span className="text-white">Shop</span>
                  <span className="text-emerald-200">Hub</span>
                </span>
              </button>

              <h2 className="text-3xl font-bold mb-2">Welcome to ShopHub</h2>
              <p className="text-white/80 text-sm mb-8">
                Your one-stop destination for everything you need. Join thousands of happy customers today.
              </p>

              {/* Benefits */}
              <div className="space-y-5">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={benefit.title}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
                  >
                    <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{benefit.title}</p>
                      <p className="text-xs text-white/70">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom testimonial */}
            <div className="relative z-10 mt-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-sm text-white/90 italic mb-3">
                  &ldquo;ShopHub has completely changed the way I shop online. Great products and amazing service!&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    S
                  </div>
                  <div>
                    <p className="text-xs font-medium">Sarah Johnson</p>
                    <p className="text-[10px] text-white/60">Verified Customer</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Auth Form */}
          <motion.div
            className="bg-card p-6 sm:p-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            {/* Mobile logo */}
            <div className="text-center mb-6 lg:hidden">
              <button onClick={() => navigateStore('home')} className="inline-flex items-center gap-2">
                <Package className="h-7 w-7 text-emerald-600" />
                <span className="text-xl font-bold">
                  <span className="text-emerald-600">Shop</span>Hub
                </span>
              </button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-6 bg-muted/50 relative">
                <TabsTrigger value="login" className="flex-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-200 tab-animated-underline">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-200 tab-animated-underline">
                  Register
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {/* Login Form */}
                {activeTab === 'login' && (
                  <motion.div
                    key="login-form"
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={formTransition}
                  >
                    <form onSubmit={handleLogin} className="space-y-4">
                      <motion.div className="space-y-2 stagger-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                        <AnimatePresence>
                          {loginErrors.email && (
                            <motion.p
                              className="text-xs text-red-500 flex items-center gap-1"
                              initial={{ opacity: 0, y: -5, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -5, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {loginErrors.email}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div className="space-y-2 stagger-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Password</Label>
                          <button
                            type="button"
                            className="text-xs text-emerald-600 hover:underline"
                            onClick={() => toast.info('Password reset feature coming soon!')}
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showLoginPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-9 pr-10 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <AnimatePresence>
                          {loginErrors.password && (
                            <motion.p
                              className="text-xs text-red-500 flex items-center gap-1"
                              initial={{ opacity: 0, y: -5, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -5, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {loginErrors.password}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div className="stagger-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all duration-200 h-11"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      </motion.div>

                      {/* Social login buttons */}
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 transition-all duration-200 hover:shadow-md"
                          onClick={() => toast.info('Google login coming soon!')}
                        >
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 transition-all duration-200 hover:shadow-md"
                          onClick={() => toast.info('Facebook login coming soon!')}
                        >
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </Button>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mt-3">
                          Demo: customer1@shop.com / customer123
                        </p>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Register Form */}
                {activeTab === 'register' && (
                  <motion.div
                    key="register-form"
                    variants={formVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={formTransition}
                  >
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-name"
                            placeholder="John Doe"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                        <AnimatePresence>
                          {regErrors.name && (
                            <motion.p
                              className="text-xs text-red-500 flex items-center gap-1"
                              initial={{ opacity: 0, y: -5, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -5, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {regErrors.name}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="you@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                        <AnimatePresence>
                          {regErrors.email && (
                            <motion.p
                              className="text-xs text-red-500 flex items-center gap-1"
                              initial={{ opacity: 0, y: -5, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -5, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {regErrors.email}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-phone">Phone (optional)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-phone"
                            placeholder="+1 (555) 000-0000"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-password"
                            type={showRegPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="pl-9 pr-10 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                          >
                            {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <AnimatePresence>
                          {regErrors.password && (
                            <motion.p
                              className="text-xs text-red-500 flex items-center gap-1"
                              initial={{ opacity: 0, y: -5, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -5, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {regErrors.password}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="reg-confirm-password"
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className="pl-9 pr-10 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          >
                            {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <AnimatePresence>
                          {regErrors.confirmPassword && (
                            <motion.p
                              className="text-xs text-red-500 flex items-center gap-1"
                              initial={{ opacity: 0, y: -5, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -5, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {regErrors.confirmPassword}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all duration-200 h-11"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      {/* Social login buttons */}
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 transition-all duration-200 hover:shadow-md"
                          onClick={() => toast.info('Google signup coming soon!')}
                        >
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 transition-all duration-200 hover:shadow-md"
                          onClick={() => toast.info('Facebook signup coming soon!')}
                        >
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
