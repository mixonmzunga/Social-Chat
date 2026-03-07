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
import { useChatStore } from '@/store/chat-store'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

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

interface FriendRequest {
  id: string
  sender: FriendUser
}

export function FriendsScreen() {
  const { currentUser } = useChatStore()
  const [activeTab, setActiveTab] = useState<Tab>('suggestions')
  const [searchQuery, setSearchQuery] = useState('')
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  const [suggestions, setSuggestions] = useState<FriendUser[]>([])
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    if (!currentUser?.id) return
    setIsLoading(true)
    try {
      const [sugRes, friRes, reqRes] = await Promise.all([
        fetch(`/api/friends/suggestions?userId=${currentUser.id}`),
        fetch(`/api/friends/list?userId=${currentUser.id}`),
        fetch(`/api/friends/request?userId=${currentUser.id}`)
      ])

      const sugData = await sugRes.json()
      const friData = await friRes.json()
      const reqData = await reqRes.json()

      setSuggestions(sugData.users || [])
      setFriends(friData.friends || [])
      setRequests(reqData.requests || [])
    } catch (error) {
      console.error('Failed to fetch friends data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentUser?.id])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleFollow = async (receiverId: string) => {
    if (!currentUser?.id) return
    setFollowStates(prev => ({ ...prev, [receiverId]: true }))
    try {
      await fetch('/api/friends/request', {
        method: 'POST',
        body: JSON.stringify({ senderId: currentUser.id, receiverId })
      })
      // Optionally refresh suggestions or show "Request Sent"
    } catch (error) {
      console.error('Follow failed:', error)
      setFollowStates(prev => ({ ...prev, [receiverId]: false }))
    }
  }

  const handleRequestAction = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      await fetch('/api/friends/accept', {
        method: 'POST',
        body: JSON.stringify({ requestId, action })
      })
      fetchData() // Refresh everything
    } catch (error) {
      console.error(`${action} request failed:`, error)
    }
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'suggestions', label: 'Suggestions', count: suggestions.length },
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: requests.length },
  ]

  const getCurrentData = () => {
    switch (activeTab) {
      case 'suggestions':
        return suggestions
      case 'friends':
        return friends
      case 'requests':
        return [] // Handled separately due to structure
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
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={request.sender.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white font-semibold">
                      {getInitials(request.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{request.sender.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{request.sender.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequestAction(request.id, 'accept')}
                      className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestAction(request.id, 'decline')}
                      className="rounded-xl"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-10 text-gray-400">No pending requests</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
