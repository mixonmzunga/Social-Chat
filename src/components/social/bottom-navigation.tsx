import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageCircle, Users, Image, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chat-store'

type Tab = 'feed' | 'messages' | 'friends' | 'media' | 'settings'

interface BottomNavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { conversations, pendingFriendRequestsCount } = useChatStore()

  const totalUnreadMessages = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)

  const tabs: { id: Tab; icon: typeof Home; label: string; badge?: number }[] = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'messages', icon: MessageCircle, label: 'Chats', badge: totalUnreadMessages },
    { id: 'friends', icon: Users, label: 'Friends', badge: pendingFriendRequestsCount },
    { id: 'media', icon: Image, label: 'Media' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t border-gray-100/50 dark:border-slate-700/50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center justify-center py-2 px-5 min-w-[60px] group"
            >
              {/* Active Background */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavBg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    className="absolute inset-1 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 rounded-2xl"
                  />
                )}
              </AnimatePresence>

              {/* Icon Container */}
              <div className="relative z-10 flex items-center justify-center">
                <motion.div
                  animate={{
                    y: isActive ? -2 : 0,
                    scale: isActive ? 1.1 : 1
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>

                {/* Badge */}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-2 min-w-[18px] h-[18px] bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center px-1 shadow-sm"
                  >
                    <span className="text-[10px] font-bold text-white">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <motion.span
                animate={{
                  y: isActive ? -1 : 0,
                  fontWeight: isActive ? 600 : 500
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                  "relative z-10 text-[10px] mt-0.5 font-medium transition-colors",
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                )}
              >
                {tab.label}
              </motion.span>

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-0.5 w-5 h-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                  transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
