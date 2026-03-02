'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, MessageCircle, Bell, User,
  Settings, LogOut, Moon, Sun,
  Bookmark, Users, Image, Search
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chat-store'
import { useTheme } from 'next-themes'
import { useState } from 'react'

type Screen = 'feed' | 'messages' | 'friends' | 'media' | 'settings'

interface DesktopSidebarProps {
  activeScreen: Screen
  onNavigate: (screen: Screen) => void
}

const navItems: { id: Screen; icon: typeof Home; label: string; badge?: number }[] = [
  { id: 'feed', icon: Home, label: 'Feed' },
  { id: 'messages', icon: MessageCircle, label: 'Messages', badge: 3 },
  { id: 'friends', icon: Users, label: 'Friends', badge: 5 },
  { id: 'media', icon: Image, label: 'Media' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export function DesktopSidebar({ activeScreen, onNavigate }: DesktopSidebarProps) {
  const { currentUser, logout } = useChatStore()
  const { theme, setTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shrink-0">

      {/* ── Brand ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-white flex items-center justify-center shadow-sm">
          <MessageCircle className="w-4 h-4 text-white dark:text-slate-900" />
        </div>
        <span className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
          LoyaChat
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeScreen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon className={cn('w-4.5 h-4.5 shrink-0', isActive ? 'w-[18px] h-[18px]' : 'w-[18px] h-[18px]')} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-[11px] font-semibold rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="desktopNavActive"
                  className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-slate-800 -z-10"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Theme toggle ── */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {theme === 'dark'
            ? <Sun className="w-[18px] h-[18px]" strokeWidth={2} />
            : <Moon className="w-[18px] h-[18px]" strokeWidth={2} />
          }
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* ── User card ── */}
      <div className="border-t border-gray-100 dark:border-slate-800 p-3 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={currentUser?.avatar || undefined} />
            <AvatarFallback className="bg-slate-700 text-white text-xs font-semibold">
              {currentUser ? getInitials(currentUser.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">@{currentUser?.username || 'username'}</p>
          </div>
        </button>

        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-1.5 z-50"
            >
              <button
                onClick={() => { logout(); setShowUserMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
