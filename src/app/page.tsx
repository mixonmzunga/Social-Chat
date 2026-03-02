'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useChatStore } from '@/store/chat-store'
import { AuthScreen } from '@/components/auth/auth-screen'
import { DesktopLayout } from '@/components/chat/desktop-layout'
import { MobileLayout } from '@/components/chat/mobile-layout'
import { SplashScreen } from '@/components/splash-screen'
import { SocialLayout } from '@/components/social/social-layout'

export default function SocialChatApp() {
  const { 
    isAuthenticated, 
    currentUser,
    setCurrentUser,
    setCurrentView,
    selectedConversation
  } = useChatStore()
  
  const [isMobile, setIsMobile] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [sessionChecked, setSessionChecked] = useState(false)

  // Initialize state after mount to avoid SSR issues
  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsDesktop(width >= 1024)
    }
    
    // Defer state updates to avoid synchronous setState warning
    requestAnimationFrame(() => {
      setMounted(true)
      checkScreen()
    })
    
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const savedUserId = localStorage.getItem('loyalchat_user_id')
      
      if (savedUserId) {
        try {
          const response = await fetch(`/api/auth/session?userId=${savedUserId}`)
          const data = await response.json()
          
          if (data.user) {
            setCurrentUser(data.user)
            setCurrentView('chats')
          }
        } catch (error) {
          console.error('Session check failed:', error)
          localStorage.removeItem('loyalchat_user_id')
        }
      }
      setSessionChecked(true)
    }

    checkSession()
  }, [setCurrentUser, setCurrentView])

  // Save user ID to localStorage when authenticated
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem('loyalchat_user_id', currentUser.id)
    }
  }, [currentUser?.id])

  // Prevent zoom on iOS and handle touch events
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    
    document.addEventListener('touchstart', preventZoom, { passive: false })
    
    return () => {
      document.removeEventListener('touchstart', preventZoom)
    }
  }, [])

  // Handle splash screen completion
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500" />
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white dark:bg-slate-900">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        ) : !isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <AuthScreen />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {/* Show chat layout when a conversation is selected */}
            {selectedConversation ? (
              isMobile ? <MobileLayout /> : <DesktopLayout />
            ) : (
              /* Show social layout for main app */
              <SocialLayout />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
