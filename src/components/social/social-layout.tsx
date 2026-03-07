'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useChatStore } from '@/store/chat-store'
import { FeedScreen } from './feed-screen'
import { MessagesScreen } from './messages-screen'
import { FriendsScreen } from './friends-screen'
import { MediaScreen } from './media-screen'
import { SettingsScreen } from './settings-screen'
import { BottomNavigation } from './bottom-navigation'
import { DesktopSidebar } from './desktop-sidebar'
import { DesktopRightSidebar } from './desktop-right-sidebar'

type Screen = 'feed' | 'messages' | 'friends' | 'media' | 'settings'

export function SocialLayout() {
  const { selectedConversation, currentUser, setPendingFriendRequestsCount, textSize } = useChatStore()
  const [activeScreen, setActiveScreen] = useState<Screen>('feed')
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    document.documentElement.classList.remove('text-size-small', 'text-size-medium', 'text-size-large')
    document.documentElement.classList.add(`text-size-${textSize || 'medium'}`)
  }, [textSize])

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!currentUser?.id) return
      try {
        const res = await fetch(`/api/friends/request?userId=${currentUser.id}`)
        if (res.ok) {
          const data = await res.json()
          setPendingFriendRequestsCount(data.requests?.length || 0)
        }
      } catch (error) {
        console.error('Failed to fetch pending requests count:', error)
      }
    }

    fetchPendingRequests()
    // Optional: set up an interval or refresh on navigation to 'friends'
  }, [currentUser?.id, activeScreen])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (selectedConversation) {
    return null
  }

  const handleTabChange = (tab: Screen) => {
    setActiveScreen(tab)
  }

  const mainContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeScreen}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={isMobile ? 'pb-20' : ''}
      >
        {activeScreen === 'feed' && <FeedScreen />}
        {activeScreen === 'messages' && <MessagesScreen />}
        {activeScreen === 'friends' && <FriendsScreen />}
        {activeScreen === 'media' && <MediaScreen />}
        {activeScreen === 'settings' && <SettingsScreen />}
      </motion.div>
    </AnimatePresence>
  )

  // ─── Desktop Layout ───────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div className="h-full w-full flex bg-gray-50 dark:bg-slate-950">
        {/* Left sidebar: always visible on desktop */}
        <DesktopSidebar activeScreen={activeScreen} onNavigate={handleTabChange} />

        {/* Main feed – scrollable, centered */}
        <main className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
          <div className="max-w-2xl mx-auto">
            {mainContent}
          </div>
        </main>

        {/* Right sidebar: visible on lg+ */}
        <div className="hidden lg:block">
          <DesktopRightSidebar />
        </div>
      </div>
    )
  }

  // ─── Mobile Layout ────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full bg-gray-50 dark:bg-slate-900 app-container overflow-y-auto scrollbar-hide">
      {mainContent}
      <BottomNavigation
        activeTab={activeScreen}
        onTabChange={handleTabChange}
      />
    </div>
  )
}
