'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Plus, UserPlus, Users, Check,
  MoreVertical, ChevronRight
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Tab = 'suggestions' | 'friends' | 'requests'

interface FriendUser {
  id: string
  name: string
  username: string
  avatar: string | null
  isOnline: boolean
  isVerified: boolean
  mutualFriends?: number
}

const sampleSuggestions: FriendUser[] = [
  { id: '1', name: 'Madalitso Phiri', username: '@madalitso_p', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', isOnline: true, isVerified: true, mutualFriends: 12 },
  { id: '2', name: 'Chimwemwe Kaunda', username: '@chimwemwe_k', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', isOnline: false, isVerified: false, mutualFriends: 8 },
  { id: '3', name: 'Tadala Msiska', username: '@tadala_m', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', isOnline: true, isVerified: false, mutualFriends: 5 },
]

const sampleFriends: FriendUser[] = [
  { id: '1', name: 'Chikondi Banda', username: '@chikondi_b', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', isOnline: true, isVerified: true },
  { id: '2', name: 'Thandiwe Gondwe', username: '@thandiwe_g', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face', isOnline: false, isVerified: false },
  { id: '3', name: 'Kondwani Nkhoma', username: '@kondwani_n', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', isOnline: true, isVerified: false },
]

const sampleRequests: FriendUser[] = [
  { id: '1', name: 'Mphatso Jere', username: '@mphatso_j', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', isOnline: true, isVerified: false, mutualFriends: 3 },
  { id: '2', name: 'Zione Kalua', username: '@zione_k', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face', isOnline: false, isVerified: true, mutualFriends: 7 },
]

export function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('suggestions')
  const [searchQuery, setSearchQuery] = useState('')
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleFollow = (id: string) => {
    setFollowStates(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'suggestions', label: 'Suggestions', count: 3 },
    { id: 'friends', label: 'Friends', count: 24 },
    { id: 'requests', label: 'Requests', count: 2 },
  ]

  const getCurrentData = () => {
    switch (activeTab) {
      case 'suggestions':
        return sampleSuggestions
      case 'friends':
        return sampleFriends
      case 'requests':
        return sampleRequests
    }
  }

  const currentData = getCurrentData()

  return (
    <div className="pb-4 bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-gray-100 dark:border-slate-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Friends</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connect with people</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="pl-10 h-10 bg-gray-100 dark:bg-slate-700 border-0 rounded-xl"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize",
                  activeTab === tab.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                )}
              >
                {tab.label}
                {tab.count && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeTab === tab.id
                      ? 'bg-white/20 dark:bg-black/10'
                      : 'bg-gray-200 dark:bg-slate-600'
                  )}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            {currentData.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      {user.isVerified && (
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.username}</p>
                    {user.mutualFriends && (
                      <p className="text-xs text-gray-400 mt-0.5">{user.mutualFriends} mutual friends</p>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFollow(user.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                      followStates[user.id]
                        ? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                        : "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    )}
                  >
                    {followStates[user.id] ? 'Following' : 'Follow'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {currentData.map((user, index) => (
              <motion.button
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="w-full flex items-center gap-3 py-3 text-left"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.username}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.button>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {currentData.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.mutualFriends} mutual friends</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl">
                      Decline
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
