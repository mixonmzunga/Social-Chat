'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, UserPlus, Check } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: string
  name: string
  username: string
  avatar: string | null
  mutualFriends: number
  isVerified: boolean
}

const sampleSuggestions: Suggestion[] = [
  { id: '1', name: 'Zione Kalua', username: '@zione_k', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face', mutualFriends: 12, isVerified: true },
  { id: '2', name: 'Yamikani Kaunda', username: '@yamikani_k', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', mutualFriends: 8, isVerified: false },
  { id: '3', name: 'Lusungu Moyo', username: '@lusungu_m', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', mutualFriends: 5, isVerified: false },
  { id: '4', name: 'Mwayi Kamanga', username: '@mwayi_k', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', mutualFriends: 15, isVerified: true },
  { id: '5', name: 'Tiwonge Msiska', username: '@tiwonge_m', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', mutualFriends: 3, isVerified: false },
]

export function FriendSuggestions() {
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleFollow = (id: string) => {
    setFollowStates(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section className="px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Suggested for You</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">People you might know</p>
        </div>
        <button className="text-sm text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 hover:text-violet-700 transition-colors">
          See All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {sampleSuggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 w-[140px] bg-white dark:bg-slate-800 rounded-3xl p-4 text-center shadow-sm border border-gray-50 dark:border-slate-700"
          >
            {/* Avatar */}
            <div className="relative inline-block mb-2">
              <Avatar className="w-16 h-16 ring-2 ring-gray-100 dark:ring-slate-700">
                <AvatarImage src={suggestion.avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white text-lg font-semibold">
                  {getInitials(suggestion.name)}
                </AvatarFallback>
              </Avatar>
              {suggestion.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {suggestion.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
              {suggestion.username}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              {suggestion.mutualFriends} mutual
            </p>

            {/* Follow Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFollow(suggestion.id)}
              className={cn(
                "w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
                followStates[suggestion.id]
                  ? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                  : "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              )}
            >
              {followStates[suggestion.id] ? (
                <>
                  <Check className="w-4 h-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
