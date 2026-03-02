'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Moon, Sun, Bell, Lock, HelpCircle, 
  LogOut, ChevronRight, User, Shield, Info, Trash2
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useChatStore } from '@/store/chat-store'
import { useTheme } from 'next-themes'

interface SettingsScreenProps {
  onBack?: () => void
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { currentUser, setCurrentView, logout } = useChatStore()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleLogout = async () => {
    if (currentUser) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    logout()
  }

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          description: 'Edit your profile information',
          action: () => setCurrentView('profile')
        },
        {
          icon: Lock,
          label: 'Privacy',
          description: 'Manage your privacy settings',
          action: () => {}
        },
        {
          icon: Shield,
          label: 'Security',
          description: 'Password and authentication',
          action: () => {}
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Dark Mode',
          description: 'Toggle dark theme',
          toggle: true,
          checked: theme === 'dark',
          action: () => setTheme(theme === 'dark' ? 'light' : 'dark')
        },
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Manage notification settings',
          toggle: true,
          checked: notifications,
          action: () => setNotifications(!notifications)
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'Get help with LoyalChat',
          action: () => {}
        },
        {
          icon: Info,
          label: 'About',
          description: 'App version and info',
          action: () => {}
        }
      ]
    }
  ]

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 flex-shrink-0">
        {isMobile && onBack && (
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        <div className="max-w-2xl mx-auto py-4 px-4">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setCurrentView('profile')}
            className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors mb-6"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={currentUser?.avatar || undefined} />
                <AvatarFallback className="bg-teal-500 text-white">
                  {currentUser ? getInitials(currentUser.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                  {currentUser?.name || 'Unknown'}
                </h2>
                {currentUser?.username && (
                  <p className="text-sm text-teal-500 dark:text-teal-400 truncate">
                    @{currentUser.username}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentUser?.email || 'No email'}
                </p>
                {currentUser?.bio && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                    {currentUser.bio}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </motion.div>

          {/* Settings Groups */}
          {settingsGroups.map((group, groupIndex) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="mb-4"
            >
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 px-1">
                {group.title}
              </h3>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-slate-700">
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    onClick={!item.toggle ? item.action : undefined}
                    className={`flex items-center gap-3 p-3 ${
                      !item.toggle ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700' : ''
                    } transition-colors`}
                  >
                    <div className="w-9 h-9 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-teal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                    </div>
                    {item.toggle ? (
                      <Switch
                        checked={item.checked}
                        onCheckedChange={item.action}
                      />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Button
              onClick={() => setShowLogoutConfirm(true)}
              variant="outline"
              className="w-full h-11 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </motion.div>

          {/* Delete Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-center"
          >
            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors mx-auto">
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account
            </button>
          </motion.div>

          {/* Version Info */}
          <div className="text-center py-6 text-xs text-gray-400">
            LoyalChat v1.0.0
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-slate-800 rounded-xl p-5 max-w-sm w-full shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Log Out?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Are you sure you want to log out of LoyalChat?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowLogoutConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Log Out
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
