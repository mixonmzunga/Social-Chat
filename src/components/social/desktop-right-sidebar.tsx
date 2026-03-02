'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Hash, UserPlus, Check, MoreHorizontal,
  ExternalLink, Flame
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Sample trending topics
const trendingTopics = [
  { id: '1', hashtag: '#Technology', posts: '12.5K', category: 'Trending in Tech' },
  { id: '2', hashtag: '#AI', posts: '8.2K', category: 'Science & Tech' },
  { id: '3', hashtag: '#WebDevelopment', posts: '5.1K', category: 'Programming' },
  { id: '4', hashtag: '#React', posts: '3.8K', category: 'Development' },
  { id: '5', hashtag: '#Design', posts: '2.9K', category: 'Creative' },
]

// Sample suggested users
const suggestedUsers = [
  { id: '1', name: 'Sarah Chen', username: '@sarahc', avatar: null, isVerified: true },
  { id: '2', name: 'Dev Community', username: '@devcommunity', avatar: null, isVerified: true },
  { id: '3', name: 'UI Design Labs', username: '@uidesignlabs', avatar: null, isVerified: false },
]

export function DesktopRightSidebar() {
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({})

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleFollow = (id: string) => {
    setFollowingStates(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside className="w-[320px] h-screen sticky top-0 flex flex-col bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {/* Trending Section */}
        <section className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Trending</h2>
          </div>

          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{topic.category}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {topic.hashtag}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {topic.posts} posts
                    </p>
                  </div>
                  <button className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <button className="mt-3 text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline">
            Show more
          </button>
        </section>

        {/* Who to Follow */}
        <section className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-pink-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Who to follow</h2>
          </div>

          <div className="space-y-3">
            {suggestedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {user.name}
                    </p>
                    {user.isVerified && (
                      <Badge className="h-4 w-4 p-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.username}
                  </p>
                </div>
                <Button
                  onClick={() => handleFollow(user.id)}
                  variant={followingStates[user.id] ? 'secondary' : 'default'}
                  className={cn(
                    "h-8 px-3 text-xs rounded-full",
                    followingStates[user.id]
                      ? "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                      : "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white"
                  )}
                >
                  {followingStates[user.id] ? 'Following' : 'Follow'}
                </Button>
              </motion.div>
            ))}
          </div>

          <button className="mt-3 text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline">
            Show more
          </button>
        </section>

        {/* Quick Links */}
        <section className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h2>
          <div className="flex flex-wrap gap-2">
            {['Terms', 'Privacy', 'Help', 'About', 'Status'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
              >
                {link}
              </a>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 dark:from-violet-500/20 dark:to-pink-500/20 rounded-2xl p-4 border border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Featured</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Discover amazing content from creators around the world
          </p>
          <Button
            variant="outline"
            className="w-full border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
          >
            Explore
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          © 2024 LoyalChat. All rights reserved.
        </p>
      </div>
    </aside>
  )
}
