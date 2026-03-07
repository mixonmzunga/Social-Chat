'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, UserPlus, Check, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chat-store'

interface Suggestion {
  id: string
  userId: string
  name: string
  username: string
  avatar: string | null
  mutualFriends: number
  isVerified: boolean
}

const sampleSuggestions: Suggestion[] = [
  { id: '1', userId: 'u1', name: 'Zione Kalua', username: '@zione_k', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face', mutualFriends: 12, isVerified: true },
  { id: '2', userId: 'u3', name: 'Yamikani Kaunda', username: '@yamikani_k', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', mutualFriends: 8, isVerified: false },
  { id: '3', userId: 'u4', name: 'Lusungu Moyo', username: '@lusungu_m', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', mutualFriends: 5, isVerified: false },
  { id: '4', userId: 'u5', name: 'Mwayi Kamanga', username: '@mwayi_k', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', mutualFriends: 15, isVerified: true },
  { id: '5', userId: 'u6', name: 'Tiwonge Msiska', username: '@tiwonge_m', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', mutualFriends: 3, isVerified: false },
]

export function FriendSuggestions() {
  const { currentUser } = useChatStore()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  const fetchData = async () => {
    if (!currentUser?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/friends/suggestions?userId=${currentUser.id}`)
      const data = await res.json()
      setSuggestions(data.users || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setLoading(true)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentUser?.id])

  const handleFollow = async (receiverId: string) => {
    if (!currentUser?.id) return
    setFollowStates(prev => ({ ...prev, [receiverId]: true }))
    try {
      await fetch('/api/friends/request', {
        method: 'POST',
        body: JSON.stringify({ senderId: currentUser.id, receiverId })
      })
    } catch (error) {
      console.error('Follow failed:', error)
      setFollowStates(prev => ({ ...prev, [receiverId]: false }))
    }
  }

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  if (suggestions.length === 0 && !loading) return null

  return (
    <>
      <section className="px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Suggested for You</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">People you might know</p>
          </div>
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 hover:text-violet-700 transition-colors"
          >
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {suggestions.map((suggestion, index) => {
            const isFollowing = followStates[suggestion.id]
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-[140px] bg-white dark:bg-slate-800 rounded-3xl p-4 text-center shadow-sm border border-gray-50 dark:border-slate-700"
              >
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
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{suggestion.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{suggestion.username || `@${suggestion.name.toLowerCase().replace(/\s/g, '')}`}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{suggestion.mutualFriends || 0} mutual</p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFollow(suggestion.id)}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5',
                    isFollowing
                      ? 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  )}
                >
                  {isFollowing ? (
                    <><Check className="w-4 h-4" /> Pending</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Follow</>
                  )}
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* See All Modal */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end"
            onClick={() => setShowAll(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-white dark:bg-slate-900 rounded-t-3xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 pt-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white text-xl">People You May Know</h3>
                  <button onClick={() => setShowAll(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {suggestions.map((suggestion) => {
                  const isFollowing = followStates[suggestion.id]
                  return (
                    <div key={suggestion.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <Avatar className="w-14 h-14 flex-shrink-0">
                        <AvatarImage src={suggestion.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold">
                          {getInitials(suggestion.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{suggestion.name}</p>
                          {suggestion.isVerified && <Check className="w-4 h-4 text-violet-500 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-gray-500">{suggestion.username || `@${suggestion.name.toLowerCase().replace(/\s/g, '')}`}</p>
                        <p className="text-xs text-gray-400">{suggestion.mutualFriends || 0} mutual friends</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFollow(suggestion.id)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0',
                          isFollowing
                            ? 'bg-gray-100 dark:bg-slate-700 text-gray-600'
                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        )}
                      >
                        {isFollowing ? 'Pending' : 'Follow'}
                      </motion.button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
