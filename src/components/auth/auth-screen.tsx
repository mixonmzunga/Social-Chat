'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Mail, Lock, Phone, ArrowRight, Loader2, Users, Shield, Zap, Globe, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChatStore } from '@/store/chat-store'
import { useMobile } from '@/hooks/use-mobile'

type AuthTab = 'login' | 'register' | 'phone'

export function AuthScreen() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Register form state
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerPhone, setRegisterPhone] = useState('')
  
  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const { setCurrentUser, setCurrentView } = useChatStore()
  const isMobile = useMobile()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }
      
      setCurrentUser(data.user)
      setCurrentView('chats')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          phone: registerPhone
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      
      // Auto-login after registration
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail, password: registerPassword })
      })
      
      const loginData = await loginResponse.json()
      setCurrentUser(loginData.user)
      setCurrentView('chats')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    
    try {
      // Simulate Google OAuth
      const googleUser = {
        email: `google_${Date.now()}@gmail.com`,
        name: 'Google User',
        picture: null
      }
      
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Google login failed')
        return
      }
      
      setCurrentUser(data.user)
      setCurrentView('chats')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('Phone authentication coming soon!')
  }

  // Feature cards for desktop
  const features = [
    {
      icon: MessageCircle,
      title: 'Real-time Messaging',
      description: 'Instant message delivery with end-to-end encryption'
    },
    {
      icon: Users,
      title: 'Group Chats',
      description: 'Create groups and stay connected with everyone'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Industry-standard security for your conversations'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed on any connection'
    }
  ]

  // Stats for desktop
  const stats = [
    { value: '10M+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '150+', label: 'Countries' },
  ]

  // Testimonials
  const testimonials = [
    { name: 'Sarah K.', text: 'Best chat app I\'ve ever used!', rating: 5 },
    { name: 'Mike R.', text: 'So fast and reliable.', rating: 5 },
  ]

  // Mobile Layout - Responsive for ALL phone sizes (320px - 768px)
  if (isMobile) {
    return (
      <div 
        className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 via-cyan-50 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Main Content Container - Centers content vertically */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8">
            
            {/* Logo & Brand */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mb-6 sm:mb-8"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-3 shadow-xl shadow-teal-500/30">
                <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400">Social Chat</h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Connect with anyone, anywhere</p>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-4 sm:mb-6"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Welcome back</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to continue</p>
            </motion.div>

            {/* Auth Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 overflow-hidden"
            >
              {/* Tabs */}
              <div className="flex p-1.5 sm:p-2 bg-gray-50 dark:bg-slate-700/50 gap-1">
                {([
                  { id: 'login', label: 'Login' },
                  { id: 'register', label: 'Register' },
                  { id: 'phone', label: 'Phone' }
                ] as { id: AuthTab; label: string }[]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setError('')
                    }}
                    className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-sm sm:text-base font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'login' && (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleLogin}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm text-gray-700 dark:text-gray-300">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="name@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-10 sm:pl-12 h-12 sm:h-13 text-base bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl"
                            required
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm text-gray-700 dark:text-gray-300">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-10 sm:pl-12 h-12 sm:h-13 text-base bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl"
                            required
                            autoComplete="current-password"
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 sm:h-13 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl font-medium text-base shadow-lg shadow-teal-500/30"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}

                  {activeTab === 'register' && (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleRegister}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="register-name" className="text-sm text-gray-700 dark:text-gray-300">Full Name</Label>
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="John Doe"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="h-12 sm:h-13 text-base bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl"
                          required
                          autoComplete="name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-sm text-gray-700 dark:text-gray-300">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="name@example.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="pl-10 sm:pl-12 h-12 sm:h-13 text-base bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl"
                            required
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-sm text-gray-700 dark:text-gray-300">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Create a strong password"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="pl-10 sm:pl-12 h-12 sm:h-13 text-base bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl"
                            required
                            minLength={6}
                            autoComplete="new-password"
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 sm:h-13 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl font-medium text-base shadow-lg shadow-teal-500/30"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}

                  {activeTab === 'phone' && (
                    <motion.form
                      key="phone"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handlePhoneLogin}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="phone-number" className="text-sm text-gray-700 dark:text-gray-300">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="phone-number"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="pl-10 sm:pl-12 h-12 sm:h-13 text-base bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl"
                            required
                            autoComplete="tel"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">We'll send you a verification code</p>
                      </div>

                      {error && (
                        <p className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 sm:h-13 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl font-medium text-base shadow-lg shadow-teal-500/30"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Send Code
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="flex items-center my-5 sm:my-6">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                  <span className="px-4 text-xs sm:text-sm text-gray-400 uppercase">or continue with</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                </div>

                {/* Social Login Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex-1 h-12 border-gray-200 dark:border-slate-600 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    className="flex-1 h-12 border-gray-200 dark:border-slate-600 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Terms */}
            <p className="text-center text-xs sm:text-sm text-gray-400 mt-5 sm:mt-6">
              By continuing, you agree to our{' '}
              <span className="text-teal-500 hover:underline cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-teal-500 hover:underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Desktop Layout - Classic WhatsApp-style Design
  return (
    <div className="h-screen flex items-center justify-center bg-[#111b21] overflow-hidden">
      <div className="flex items-center gap-16 max-w-4xl mx-auto px-8">
        {/* Left Side - Illustration */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Chat mockup illustration */}
            <div className="w-[320px] h-[420px] bg-[#222e35] rounded-3xl p-4 shadow-2xl relative overflow-hidden">
              {/* Chat header mockup */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <div className="w-10 h-10 bg-[#00a884] rounded-full" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-white/20 rounded mb-1" />
                  <div className="h-2 w-16 bg-white/10 rounded" />
                </div>
              </div>
              
              {/* Chat messages mockup */}
              <div className="space-y-3">
                <div className="flex justify-start">
                  <div className="bg-[#202c33] rounded-lg px-3 py-2 max-w-[70%]">
                    <div className="h-2 w-32 bg-white/30 rounded" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#005c4b] rounded-lg px-3 py-2 max-w-[70%]">
                    <div className="h-2 w-24 bg-white/30 rounded" />
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#202c33] rounded-lg px-3 py-2 max-w-[60%]">
                    <div className="h-2 w-20 bg-white/30 rounded" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#005c4b] rounded-lg px-3 py-2 max-w-[80%]">
                    <div className="h-2 w-36 bg-white/30 rounded" />
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-[#202c33] rounded-lg px-3 py-2 max-w-[55%]">
                    <div className="h-2 w-16 bg-white/30 rounded" />
                  </div>
                </div>
              </div>
              
              {/* Floating bubbles */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#00a884]/20 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#00a884]/10 rounded-full blur-xl" />
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-[#e9edef] mb-2">Social Chat</h1>
            <p className="text-[#8696a0] text-sm">Send and receive messages securely</p>
          </div>

          {/* Auth Card */}
          <div className="bg-[#202c33] rounded-xl shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {([
                { id: 'login', label: 'Login' },
                { id: 'register', label: 'Register' }
              ] as { id: AuthTab; label: string }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setError('')
                  }}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#00a884] border-b-2 border-[#00a884]'
                      : 'text-[#8696a0] hover:text-[#e9edef]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'login' && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#8696a0] uppercase tracking-wide">Email</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full h-11 bg-[#2a3942] border border-[#3b4a54] rounded-lg px-4 text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors text-sm"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#8696a0] uppercase tracking-wide">Password</label>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full h-11 bg-[#2a3942] border border-[#3b4a54] rounded-lg px-4 text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors text-sm"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 text-center bg-red-500/10 p-2 rounded-lg">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-[#00a884] hover:bg-[#008f72] text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {activeTab === 'register' && (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onSubmit={handleRegister}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#8696a0] uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full h-11 bg-[#2a3942] border border-[#3b4a54] rounded-lg px-4 text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors text-sm"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#8696a0] uppercase tracking-wide">Email</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full h-11 bg-[#2a3942] border border-[#3b4a54] rounded-lg px-4 text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors text-sm"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#8696a0] uppercase tracking-wide">Password</label>
                      <input
                        type="password"
                        placeholder="Create a password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full h-11 bg-[#2a3942] border border-[#3b4a54] rounded-lg px-4 text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors text-sm"
                        required
                        minLength={6}
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 text-center bg-red-500/10 p-2 rounded-lg">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-[#00a884] hover:bg-[#008f72] text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-[#3b4a54]" />
                <span className="px-3 text-xs text-[#8696a0]">or</span>
                <div className="flex-1 h-px bg-[#3b4a54]" />
              </div>

              {/* Social Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-11 bg-transparent border border-[#3b4a54] hover:bg-[#2a3942] text-[#e9edef] rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-[#8696a0] mt-6">
            By continuing, you agree to our{' '}
            <span className="text-[#00a884] hover:underline cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[#00a884] hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
